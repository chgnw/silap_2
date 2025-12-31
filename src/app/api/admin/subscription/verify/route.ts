import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendSubscriptionActivatedEmail } from "@/lib/email";

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
                sp.duration_days,
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

        // Format dates for MySQL
        const formatDate = (date: Date) => {
            return date.toISOString().split('T')[0];
        };

        // Check if user already has an active subscription for this plan (renewal scenario)
        const checkActiveSubSql = `
            SELECT id, start_date, end_date 
            FROM tr_user_subscription 
            WHERE user_id = ? 
                AND subscription_plan_id = ? 
                AND status = 'active' 
                AND end_date >= CURDATE()
            LIMIT 1
        `;
        const activeSubResult = await query(checkActiveSubSql, [
            payment.user_id,
            payment.subscription_plan_id
        ]) as any[];

        let subscriptionId;
        let finalStartDate;
        let finalEndDate;

        if (activeSubResult.length > 0) {
            // RENEWAL SCENARIO: Extend existing subscription
            const activeSub = activeSubResult[0];
            subscriptionId = activeSub.id;

            // Keep the original start_date
            finalStartDate = new Date(activeSub.start_date);

            // Extend end_date by 30 days from current end_date
            finalEndDate = new Date(activeSub.end_date);
            finalEndDate.setDate(finalEndDate.getDate() + 30);

            // Update existing subscription
            const updateSubscriptionSql = `
                UPDATE tr_user_subscription 
                SET end_date = ?, updated_at = NOW()
                WHERE id = ?
            `;
            await query(updateSubscriptionSql, [
                formatDate(finalEndDate),
                subscriptionId
            ]);

            console.log(`Renewal: Extended subscription ${subscriptionId} to ${formatDate(finalEndDate)}`);
        } else {
            // NEW SUBSCRIPTION SCENARIO: Create new record
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + (payment.duration_days || 30));

            finalStartDate = startDate;
            finalEndDate = endDate;

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

            subscriptionId = subscriptionResult.insertId;
            console.log(`New subscription: Created subscription ${subscriptionId}`);
        }


        // Update payment history record
        const updatePaymentSql = `
            UPDATE tr_payment_history 
            SET 
                transaction_status_id = 4,
                reference_number = ?,
                verified_by = ?,
                verified_at = NOW()
            WHERE id = ?
        `;

        await query(updatePaymentSql, [
            reference_number,
            session.user.id,
            payment_id
        ]);

        // Send email notification to customer (non-blocking)
        if (payment.customer_email) {
            sendSubscriptionActivatedEmail({
                customerName: payment.customer_name || "Pelanggan",
                customerEmail: payment.customer_email,
                planName: payment.plan_name || "Paket Langganan",
                planPrice: payment.plan_price || 0,
                startDate: formatDate(finalStartDate),
                endDate: formatDate(finalEndDate),
            }).catch((err) => {
                console.error("Failed to send subscription activation email:", err);
            });
        }

        return NextResponse.json(
            {
                message: "SUCCESS",
                detail: "Payment verified and subscription activated",
                subscription_id: subscriptionId,
                start_date: formatDate(finalStartDate),
                end_date: formatDate(finalEndDate)
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
