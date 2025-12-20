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
                ph.payment_proof_url,
                ph.total_payment,
                ph.transaction_status_id,
                ph.payment_time,
                ph.created_at,
                u.first_name,
                u.last_name,
                u.email,
                u.phone_number,
                sp.plan_name,
                sp.price,
                sp.duration_days,
                sp.pickup_frequency,
                ts.transaction_status_name
            FROM tr_payment_history ph
            LEFT JOIN ms_user u ON ph.user_id = u.id
            LEFT JOIN ms_subscription_plan sp ON ph.subscription_plan_id = sp.id
            LEFT JOIN ms_transaction_status ts ON ph.transaction_status_id = ts.id
            WHERE ph.transaction_status_id = 1
                AND ph.subscription_plan_id IS NOT NULL
            ORDER BY ph.created_at DESC
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
        console.error("Error fetching pending payments:", error);
        return NextResponse.json(
            { error: "Failed to fetch pending payments", detail: error.message },
            { status: 500 }
        );
    }
}
