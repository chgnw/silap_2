import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generateTransactionCode } from "@/lib/transactionCode";
import path from "path";
import fs from "fs/promises";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized - Please login first" },
                { status: 401 }
            );
        }

        // Parse FormData instead of JSON
        const formData = await request.formData();
        const subscription_plan_id = formData.get("subscription_plan_id") as string;
        const payment_method = formData.get("payment_method") as string;
        const paymentProofFile = formData.get("payment_proof") as File | null;

        console.log("subscription_plan_id:", subscription_plan_id);
        console.log("payment_method:", payment_method);
        console.log("paymentProofFile:", paymentProofFile?.name);

        if (!subscription_plan_id) {
            return NextResponse.json(
                { error: "Subscription plan ID is required" },
                { status: 400 }
            );
        }

        if (!paymentProofFile || paymentProofFile.size === 0) {
            return NextResponse.json(
                { error: "Payment proof image is required" },
                { status: 400 }
            );
        }

        // Verify the plan exists and get price
        const planSql = `
            SELECT id, plan_name, price, duration_days 
            FROM ms_subscription_plan 
            WHERE id = ? AND is_active = 1
        `;
        const planResult = await query(planSql, [subscription_plan_id]) as any[];

        if (planResult.length === 0) {
            return NextResponse.json(
                { error: "Subscription plan not found or inactive" },
                { status: 404 }
            );
        }

        const plan = planResult[0];

        // Check if user already has an active subscription
        const activeSubSql = `
            SELECT id FROM tr_user_subscription 
            WHERE user_id = ? AND status = 'active' AND end_date >= CURDATE()
            LIMIT 1
        `;
        const activeSubResult = await query(activeSubSql, [session.user.id]) as any[];

        if (activeSubResult.length > 0) {
            return NextResponse.json(
                { error: "You already have an active subscription" },
                { status: 400 }
            );
        }

        // Check if user has a pending payment
        const pendingPaymentSql = `
            SELECT id FROM tr_payment_history 
            WHERE user_id = ? 
                AND transaction_status_id = 1 
                AND subscription_plan_id IS NOT NULL
            LIMIT 1
        `;
        const pendingResult = await query(pendingPaymentSql, [session.user.id]) as any[];

        if (pendingResult.length > 0) {
            return NextResponse.json(
                { error: "You already have a pending payment awaiting verification" },
                { status: 400 }
            );
        }

        // Handle payment proof file upload
        let dbPaymentProofPath = null;
        const uploadDir = path.join(process.cwd(), "public", "upload", "paymentProof");
        await fs.mkdir(uploadDir, { recursive: true });

        const timestamp = Date.now();
        const originalName = paymentProofFile.name.replaceAll(" ", "_");
        const filename = `${session.user.id}_${timestamp}_${originalName}`;

        const arrayBuffer = await paymentProofFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const finalFilePath = path.join(uploadDir, filename);
        await fs.writeFile(finalFilePath, buffer);

        dbPaymentProofPath = `/upload/paymentProof/${filename}`;

        // Generate transaction code
        const transactionCode = generateTransactionCode("SUB");

        // Map payment method
        let mappedPaymentMethod;
        if (payment_method === 'ewallet') {
            mappedPaymentMethod = 'e-wallet';
        } else if (payment_method === 'qris') {
            mappedPaymentMethod = 'qris';
        } else if (payment_method === 'bank') {
            mappedPaymentMethod = 'bank_transfer';
        } else {
            mappedPaymentMethod = payment_method || 'bank_transfer';
        }

        // Insert payment record with status = 1 (pending)
        const insertSql = `
            INSERT INTO tr_payment_history (
                transaction_code,
                user_id,
                subscription_plan_id,
                payment_type,
                payment_method,
                payment_proof_url,
                total_payment,
                transaction_status_id
            ) VALUES (?, ?, ?, 'Subscription', ?, ?, ?, 1)
        `;

        console.log("transaction code:", transactionCode);
        console.log("user id:", session.user.id);
        console.log("subscription plan id:", subscription_plan_id);
        console.log("payment method:", mappedPaymentMethod);
        console.log("payment proof path:", dbPaymentProofPath);
        console.log("total payment:", plan.price);

        const insertResult = await query(insertSql, [
            transactionCode,
            session.user.id,
            subscription_plan_id,
            mappedPaymentMethod,
            dbPaymentProofPath,
            plan.price
        ]) as any;
        console.log("insertResult:", insertResult);

        return NextResponse.json({
            message: "SUCCESS",
            detail: "Payment submitted successfully. Please wait for admin verification.",
            data: {
                payment_id: insertResult.insertId,
                transaction_code: transactionCode,
                plan_name: plan.plan_name,
                total_payment: plan.price,
                payment_proof_url: dbPaymentProofPath,
                status: "pending"
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error("Error submitting payment:", error);
        return NextResponse.json(
            { error: "Failed to submit payment", detail: error.message },
            { status: 500 }
        );
    }
}
