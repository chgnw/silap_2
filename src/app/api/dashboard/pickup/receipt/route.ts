import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        if (!userId) {
            return NextResponse.json(
                { message: "FAILED", detail: "Unauthorized" },
                { status: 401 }
            );
        }

        const url = new URL(req.url);
        const pickupId = url.searchParams.get("pickup_id");

        if (!pickupId) {
            return NextResponse.json(
                { message: "FAILED", detail: "Pickup ID diperlukan" },
                { status: 400 }
            );
        }

        // Get pickup details with items
        const pickupSql = `
            SELECT 
                p.id as pickup_id,
                p.transaction_code,
                p.completion_time,
                p.notes,
                pe.pickup_address,
                pe.pickup_weight as estimated_weight,
                ts.transaction_status_name as status
            FROM tr_pickup p
            JOIN tr_pickup_event pe ON p.pickup_event_id = pe.id
            JOIN ms_transaction_status ts ON p.transaction_status_id = ts.id
            WHERE p.id = ? AND pe.user_id = ?
        `;

        const pickupResult = (await query(pickupSql, [pickupId, userId])) as any[];

        if (pickupResult.length === 0) {
            return NextResponse.json(
                { message: "FAILED", detail: "Pickup tidak ditemukan" },
                { status: 404 }
            );
        }

        const pickup = pickupResult[0];

        // Get pickup items with category info
        const itemsSql = `
            SELECT 
                pi.id,
                pi.weight,
                pi.points_earned,
                wc.waste_category_name as category_name,
                wc.icon_name,
                wc.point_per_unit
            FROM tr_pickup_item pi
            JOIN ms_waste_category wc ON pi.waste_category_id = wc.id
            WHERE pi.pickup_id = ?
        `;

        const items = (await query(itemsSql, [pickupId])) as any[];

        // Calculate totals
        const totalWeight = items.reduce((sum: number, item: any) => sum + parseFloat(item.weight), 0);
        const totalPoints = items.reduce((sum: number, item: any) => sum + item.points_earned, 0);

        // Get user's current points balance and tier info for session update
        const userInfoSql = `
            SELECT u.points, u.tier_list_id, t.tier_name
            FROM ms_user u
            LEFT JOIN ms_tier_list t ON u.tier_list_id = t.id
            WHERE u.id = ?
        `;
        const userInfoResult = (await query(userInfoSql, [userId])) as any[];
        const currentPoints = userInfoResult[0]?.points || 0;
        const currentTierName = userInfoResult[0]?.tier_name || null;

        // Check if tier was upgraded (compare with what was expected before this pickup)
        // We'll store tier info in pickup_event or check from point_history
        // For now, just return current tier - frontend can compare with session tier
        return NextResponse.json(
            {
                message: "SUCCESS",
                data: {
                    pickup_id: pickup.pickup_id,
                    transaction_code: pickup.transaction_code,
                    completion_time: pickup.completion_time,
                    address: pickup.pickup_address,
                    estimated_weight: pickup.estimated_weight,
                    status: pickup.status,
                    items: items.map((item: any) => ({
                        id: item.id,
                        category_name: item.category_name,
                        icon: item.icon_name,
                        weight: parseFloat(item.weight),
                        points_per_kg: item.point_per_unit,
                        points_earned: item.points_earned,
                    })),
                    total_weight: totalWeight,
                    total_points: totalPoints,
                    user_current_points: currentPoints,
                    current_tier_name: currentTierName,
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error fetching pickup receipt:", error);
        return NextResponse.json(
            { message: "FAILED", detail: error.message },
            { status: 500 }
        );
    }
}
