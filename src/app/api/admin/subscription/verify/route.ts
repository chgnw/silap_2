import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
        const { payment_id, reference_number } = body;

        // Validate payment_id
        if (!payment_id) {
            return NextResponse.json(
                { error: "Payment ID is required" },
                { status: 400 }
            );
        }

        if (!reference_number) {
            return NextResponse.json(
                { error: "Reference number is required" },
                { status: 400 }
            );
        }

        const refPattern = /^[A-Za-z0-9\-_\/]{5,50}$/;
        if (!refPattern.test(reference_number)) {
            return NextResponse.json(
                {
                    error: "Invalid reference number format",
                    detail: "Reference number must be 5-50 characters, containing only letters, numbers, dashes, underscores, or slashes"
                },
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
                sp.duration_days
            FROM tr_payment_history ph
            LEFT JOIN ms_subscription_plan sp ON ph.subscription_plan_id = sp.id
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

        if (!payment.subscription_plan_id) {
            return NextResponse.json(
                { error: "Payment does not have a subscription plan" },
                { status: 400 }
            );
        }

        // Check if reference number already used
        const checkRefSql = `
            SELECT id FROM tr_payment_history 
            WHERE reference_number = ? AND id != ?
        `;
        const refResult = await query(checkRefSql, [reference_number, payment_id]) as any[];
        if (refResult.length > 0) {
            return NextResponse.json(
                { error: "Reference number already used for another payment" },
                { status: 409 }
            );
        }

        // Calculate subscription dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + (payment.duration_days || 30));

        // Format dates for MySQL
        const formatDate = (date: Date) => {
            return date.toISOString().split('T')[0];
        };

        // Create subscription record
        const createSubscriptionSql = `
            INSERT INTO tr_user_subscription (user_id, subscription_plan_id, start_date, end_date, status) 
            VALUES (?, ?, ?, ?, 'active')
        `;
        const subscriptionResult = await query(createSubscriptionSql, [
            payment.user_id,
            payment.subscription_plan_id,
            formatDate(startDate),
            formatDate(endDate)
        ]) as any;

        const subscriptionId = subscriptionResult.insertId;

        // Update payment history record
        const updatePaymentSql = `
            UPDATE tr_payment_history 
            SET 
                transaction_status_id = 4,
                subscription_plan_id = ?,
                reference_number = ?,
                verified_by = ?,
                verified_at = NOW()
            WHERE id = ?
        `;

        await query(updatePaymentSql, [
            subscriptionId,
            reference_number,
            session.user.id,
            payment_id
        ]);

        return NextResponse.json(
            {
                message: "SUCCESS",
                detail: "Payment verified and subscription activated",
                subscription_id: subscriptionId,
                start_date: formatDate(startDate),
                end_date: formatDate(endDate)
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error verifying payment:", error);
        return NextResponse.json(
            { error: "Failed to verify payment", detail: error.message },
            { status: 500 }
        );
    }
}
