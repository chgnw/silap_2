import { NextRequest, NextResponse } from "next/server";
import { query } from '@/lib/db';

function generateTransactionCode() {
    const prefix = "RDM";

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const date = `${day}${month}${year}`;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomCode = '';
    for (let i = 0; i < 6; i++) {
        randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `${prefix}-${date}-${randomCode}`;
}

export async function POST (req: NextRequest) {
    try {
        const body = await req.json();
        console.log("req body /redeem: ", body);

        const { user_id, items } = body;
        if (!user_id || !items || items.length === 0) {
            return NextResponse.json({ 
                message: "FAILED", 
                detail: "Data user atau item tidak lengkap." 
            }, { status: 400 });
        }

        const transaction_code = generateTransactionCode();
        const rewardIds = items.map((i:any) => i.reward_id);

        await query("START TRANSACTION");
        try {
            // Ambil data user dan lock
            const userSql = `SELECT id, points FROM ms_users WHERE id = ? FOR UPDATE`;
            const userResult: any = await query(userSql, [user_id]);

            if (userResult.length === 0) {
                throw new Error("User tidak ditemukan.");
            }
            const currentPoints = userResult[0].points;

            
            // Ambil data reward dan lock
            const rewardSql = `
                SELECT id, reward_name, points_required, stock 
                FROM ms_rewards 
                WHERE id IN (?) 
                FOR UPDATE
            `;
            const rewardResult: any = await query(rewardSql, [rewardIds]);
            const rewardMap: Record<number, any> = {};
            rewardResult.forEach((r: any) => { rewardMap[r.id] = r; });

            // Validasi dan calculate point yang harus di potong
            let grandTotalPoints = 0;
            const insertValues: any[] = [];
            
            for (const item of items) {
                const dbReward = rewardMap[item.reward_id];

                if (!dbReward) {
                    throw new Error(`Reward ID ${item.reward_id} tidak valid.`);
                }

                if (dbReward.stock < item.quantity) {
                    throw new Error(`Stok '${dbReward.reward_name}' habis/tidak cukup.`);
                }

                const subtotal = dbReward.points_required * item.quantity;
                grandTotalPoints += subtotal;

                // Data to insert
                insertValues.push([
                    transaction_code,
                    user_id,
                    item.reward_id,
                    dbReward.points_required,
                    item.quantity,
                    subtotal
                ]);
            }

            // Cek poin user cukup gak
            if (currentPoints < grandTotalPoints) {
                throw new Error(`Poin anda tidak cukup. Poinmu: ${currentPoints}`);
            }

            // Kalau cukup
            // Insert ke tr_redemptions
            const insertRedeemSql = `
                INSERT INTO tr_redemptions (
                    transaction_code, user_id, reward_id, 
                    points_per_item, quantity, total_points_spent
                ) VALUES ?
            `;
            await query(insertRedeemSql, [insertValues]);

            // Potong Poin User
            const updateUserSql = `UPDATE ms_users SET points = points - ? WHERE id = ?`;
            await query(updateUserSql, [grandTotalPoints, user_id]);

            // Potong Stok Reward
            for (const item of items) {
                await query(
                    `UPDATE ms_rewards SET stock = stock - ?, total_redeemed = total_redeemed + ? WHERE id = ?`,
                    [item.quantity, item.quantity, item.reward_id]
                );
            }

            // Masukkin ke point_history
            const insertHistorySql = `
                INSERT INTO tr_point_history (
                    users_id, 
                    points_change, 
                    description, 
                    created_at
                ) VALUES (?, ?, ?, NOW())
            `;
            const description = `Redeem Items (${transaction_code})`;
            await query(insertHistorySql, [user_id, -grandTotalPoints, description]);
            await query("COMMIT");
            
            const remainingPoints = currentPoints - grandTotalPoints;
            return NextResponse.json({
                message: "SUCCESS",
                detail: "Redeem berhasil",
                data: {
                    trx_code: transaction_code,
                    total_spent: grandTotalPoints,
                    new_point_balance: remainingPoints
                }
            }, { status: 200 });
        } catch (logicError: any) {
            await query("ROLLBACK");
            console.error("Logic Error / DB Error:", logicError);
            const errorMessage = logicError.message || "Terjadi kesalahan transaksi.";

            let status = 500;
            if (
                errorMessage.includes("Stok") || 
                errorMessage.includes("Poin") || 
                errorMessage.includes("User") || 
                errorMessage.includes("Item")
            ) {
                status = 400;
            }

            return NextResponse.json({
                message: "FAILED",
                detail: errorMessage,
            }, { status: status });
        }
    } catch (error:any) {
        console.error("Error in /redeem: ", error);
        return NextResponse.json({
            message: "FAILED",
            detail: "Terjadi kesalahan pada server.",
            error: error
        }, { status: 500 });
    }
}
