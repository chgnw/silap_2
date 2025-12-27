import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendPaymentCancelledEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { payment_id, cancel_reason } = body;

        // Validate payment_id
        if (!payment_id) {
            return NextResponse.json(
                { error: "Payment ID is required" },
                { status: 400 }
            );
        }

        if (!cancel_reason || cancel_reason.trim() === "") {
            return NextResponse.json(
                { error: "Cancel reason is required" },
                { status: 400 }
            );
        }

        // Check if payment exists and is pending
        const checkPaymentSql = `
            SELECT 
                ph.id,
                ph.user_id,
                ph.subscription_plan_id,
                ph.transaction_status_id,
                ph.total_payment,
                sp.plan_name as plan_name,
                sp.price as plan_price,
                u.email as customer_email,
                CONCAT(u.first_name, ' ', u.last_name) as customer_name
            FROM tr_payment_history ph
            LEFT JOIN ms_subscription_plan sp ON ph.subscription_plan_id = sp.id
            LEFT JOIN ms_user u ON ph.user_id = u.id
            WHERE ph.id = ?
        `;
        const paymentResult = await query(checkPaymentSql, [payment_id]) as any[];

        if (paymentResult.length === 0) {
            return NextResponse.json(
                { error: "Payment not found" },
                { status: 404 }
            );
        }

        const payment = paymentResult[0];

        if (payment.transaction_status_id !== 1) {
            return NextResponse.json(
                { error: "Payment is not in pending status" },
                { status: 400 }
            );
        }

        // Update payment history to cancelled status (status_id = 5)
        const updatePaymentSql = `
            UPDATE tr_payment_history 
            SET 
                transaction_status_id = 5,
                cancel_reason = ?,
                verified_by = ?,
                verified_at = NOW()
            WHERE id = ?
        `;

        await query(updatePaymentSql, [
            cancel_reason.trim(),
            session.user.id,
            payment_id
        ]);

        // Send cancellation email notification to customer (non-blocking)
        if (payment.customer_email) {
            sendPaymentCancelledEmail({
                customerName: payment.customer_name || "Pelanggan",
                customerEmail: payment.customer_email,
                planName: payment.plan_name || "Paket Langganan",
                planPrice: payment.total_payment || payment.plan_price || 0,
                cancelReason: cancel_reason.trim(),
            }).catch((err) => {
                console.error("Failed to send payment cancellation email:", err);
            });
        }

        return NextResponse.json(
            {
                message: "SUCCESS",
                detail: "Payment cancelled successfully",
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error cancelling payment:", error);
        return NextResponse.json(
            { error: "Failed to cancel payment", detail: error.message },
            { status: 500 }
        );
    }
}
