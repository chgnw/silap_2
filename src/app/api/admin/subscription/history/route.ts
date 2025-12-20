import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
    try {
        const sql = `
            SELECT 
                ph.id,
                ph.transaction_code,
                ph.user_id,
                ph.subscription_plan_id,
                ph.payment_type,
                ph.payment_method,
                ph.reference_number,
                ph.total_payment,
                ph.payment_time,
                ph.verified_at,
                ph.created_at,
                u.first_name,
                u.last_name,
                u.email,
                u.phone_number,
                sp.plan_name,
                sp.price,
                sp.duration_days,
                sp.pickup_frequency,
                admin.first_name as verified_by_name
            FROM tr_payment_history ph
            LEFT JOIN ms_user u ON ph.user_id = u.id
            LEFT JOIN ms_subscription_plan sp ON ph.subscription_plan_id = sp.id
            LEFT JOIN ms_user admin ON ph.verified_by = admin.id
            WHERE ph.transaction_status_id = 4
                AND ph.subscription_plan_id IS NOT NULL
            ORDER BY ph.verified_at DESC, ph.created_at DESC
        `;

        const payments = await query(sql);

        return NextResponse.json(
            {
                message: "SUCCESS",
                data: payments,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error fetching payment history:", error);
        return NextResponse.json(
            { error: "Failed to fetch payment history", detail: error.message },
            { status: 500 }
        );
    }
}
