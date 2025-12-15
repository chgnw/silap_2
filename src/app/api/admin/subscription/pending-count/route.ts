import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
    try {
        const sql = `
            SELECT COUNT(*) as count 
            FROM tr_payment_history 
            WHERE transaction_status_id = 1 
            AND subscription_plan_id IS NOT NULL
        `;

        const result = await query(sql) as any[];
        const count = result[0]?.count || 0;

        return NextResponse.json(
            {
                message: "SUCCESS",
                count: count,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error fetching pending payments count:", error);
        return NextResponse.json(
            { error: "Failed to fetch pending payments count", detail: error.message },
            { status: 500 }
        );
    }
}
