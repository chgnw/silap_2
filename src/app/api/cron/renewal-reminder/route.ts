import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { sendRenewalReminderEmail } from "@/lib/email";
import { redis } from "@/lib/redis";

// Secret key for cron job authentication
const CRON_SECRET = process.env.CRON_SECRET || "testing-cron-secret";

interface ExpiringSubscription {
    user_id: number;
    email: string;
    first_name: string;
    last_name: string | null;
    plan_name: string;
    price: number;
    end_date: string;
}

/**
 * Cron job endpoint for sending subscription renewal reminders
 * Called daily at 1 AM to notify users whose subscription expires tomorrow (H-1)
 * 
 * Usage with cron-job.org:
 * POST /api/cron/renewal-reminder
 * Headers: { "x-cron-secret": "your-cron-secret-key" }
 */
export async function POST(request: NextRequest) {
    try {
        // Verify cron secret for security
        const cronSecret = request.headers.get("x-cron-secret");
        if (cronSecret !== CRON_SECRET) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get today's date key for Redis tracking (to prevent duplicate emails)
        const today = new Date();
        const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

        // Find subscriptions expiring tomorrow (H-1)
        // If cron runs at 1 AM, we check for subscriptions expiring the next day
        const sql = `
            SELECT 
                us.user_id,
                u.email,
                u.first_name,
                u.last_name,
                sp.plan_name,
                sp.price,
                us.end_date
            FROM tr_user_subscription us
            JOIN ms_user u ON us.user_id = u.id
            JOIN ms_subscription_plan sp ON us.subscription_plan_id = sp.id
            WHERE us.status = 'active'
                AND DATE(us.end_date) = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
        `;

        const expiringSubscriptions = (await query(sql)) as ExpiringSubscription[];

        if (!expiringSubscriptions || expiringSubscriptions.length === 0) {
            return NextResponse.json({
                message: "SUCCESS",
                detail: "No subscriptions expiring tomorrow",
                emails_sent: 0,
                emails_skipped: 0,
            });
        }

        let emailsSent = 0;
        let emailsSkipped = 0;
        const results: { email: string; status: string; reason?: string }[] = [];

        for (const sub of expiringSubscriptions) {
            const redisKey = `renewal-reminder:${sub.user_id}:${dateKey}`;

            // Check if reminder was already sent today
            const alreadySent = await redis.get(redisKey);
            if (alreadySent) {
                emailsSkipped++;
                results.push({
                    email: sub.email,
                    status: "skipped",
                    reason: "Already sent today",
                });
                continue;
            }

            // Check if user has pending renewal payment
            const pendingPaymentSql = `
                SELECT id FROM tr_payment_history
                WHERE user_id = ?
                    AND transaction_status_id = 1
                    AND subscription_plan_id IS NOT NULL
                LIMIT 1
            `;
            const pendingPayments = await query(pendingPaymentSql, [sub.user_id]);

            if (pendingPayments && (pendingPayments as any[]).length > 0) {
                emailsSkipped++;
                results.push({
                    email: sub.email,
                    status: "skipped",
                    reason: "Has pending renewal payment",
                });
                continue;
            }

            // Send renewal reminder email
            const customerName = sub.last_name
                ? `${sub.first_name} ${sub.last_name}`
                : sub.first_name;

            const success = await sendRenewalReminderEmail({
                customerName,
                customerEmail: sub.email,
                planName: sub.plan_name,
                planPrice: sub.price,
                expiryDate: sub.end_date,
            });

            if (success) {
                // Mark as sent in Redis (expires after 24 hours)
                await redis.set(redisKey, "1", "EX", 86400);
                emailsSent++;
                results.push({
                    email: sub.email,
                    status: "sent",
                });
            } else {
                results.push({
                    email: sub.email,
                    status: "failed",
                    reason: "Email sending failed",
                });
            }
        }

        return NextResponse.json({
            message: "SUCCESS",
            detail: `Processed ${expiringSubscriptions.length} expiring subscriptions`,
            emails_sent: emailsSent,
            emails_skipped: emailsSkipped,
            results,
        });

    } catch (error: any) {
        console.error("Error in renewal reminder cron:", error);
        return NextResponse.json(
            { error: "Failed to process renewal reminders", detail: error.message },
            { status: 500 }
        );
    }
}

// Also support GET for easy testing (but still requires secret)
export async function GET(request: NextRequest) {
    return POST(request);
}
