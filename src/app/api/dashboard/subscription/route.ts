import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

interface SubscriptionRow {
    id: number;
    plan_name: string;
    start_date: string;
    end_date: string;
    status: string;
}

interface PendingPaymentRow {
    id: number;
    transaction_code: string;
    plan_name: string;
    created_at: string;
    total_payment: number;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { user_id } = body;

        if (!user_id) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        // Check for active subscription
        const subscriptionSql = `
            SELECT 
                us.id,
                sp.plan_name,
                us.start_date,
                us.end_date,
                us.status
            FROM tr_user_subscription us
            JOIN ms_subscription_plan sp ON us.subscription_plan_id = sp.id
            WHERE us.user_id = ?
                AND us.status = 'active'
                AND us.end_date >= CURDATE()
            ORDER BY us.end_date DESC
            LIMIT 1
        `;

        const subscriptionRows = (await query(subscriptionSql, [user_id])) as SubscriptionRow[];

        if (subscriptionRows && subscriptionRows.length > 0) {
            const subscription = subscriptionRows[0];
            const endDate = new Date(subscription.end_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const timeDiff = endDate.getTime() - today.getTime();
            const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

            return NextResponse.json({
                message: "SUCCESS",
                status: "subscribed",
                subscription: {
                    id: subscription.id,
                    plan_name: subscription.plan_name,
                    start_date: subscription.start_date,
                    end_date: subscription.end_date,
                    days_remaining: daysRemaining,
                },
            });
        }

        // Check for pending payment (transaction_status_id = 1 means pending)
        const pendingPaymentSql = `
            SELECT 
                ph.id,
                ph.transaction_code,
                sp.plan_name,
                ph.created_at,
                ph.total_payment
            FROM tr_payment_history ph
            JOIN ms_subscription_plan sp ON ph.subscription_plan_id = sp.id
            WHERE ph.user_id = ?
                AND ph.transaction_status_id = 1
                AND ph.subscription_plan_id IS NOT NULL
            ORDER BY ph.created_at DESC
            LIMIT 1
        `;

        const pendingRows = (await query(pendingPaymentSql, [user_id])) as PendingPaymentRow[];

        if (pendingRows && pendingRows.length > 0) {
            const pending = pendingRows[0];

            return NextResponse.json({
                message: "SUCCESS",
                status: "pending_payment",
                pending_payment: {
                    id: pending.id,
                    transaction_code: pending.transaction_code,
                    plan_name: pending.plan_name,
                    created_at: pending.created_at,
                    total_payment: pending.total_payment,
                },
            });
        }

        // No subscription and no pending payment
        return NextResponse.json({
            message: "SUCCESS",
            status: "not_subscribed",
        });

    } catch (error: any) {
        console.error("Error checking subscription status:", error);
        return NextResponse.json(
            { error: "Failed to check subscription status", detail: error.message },
            { status: 500 }
        );
    }
}
