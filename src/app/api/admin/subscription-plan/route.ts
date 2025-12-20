import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
    try {
        const sql = `
            SELECT 
                id,
                plan_name,
                description,
                price,
                duration_days,
                pickup_frequency,
                max_weight,
                features,
                is_popular,
                created_at,
                updated_at
            FROM ms_subscription_plan
            WHERE is_active = TRUE
            ORDER BY price ASC
        `;

        const plans = await query(sql);

        return NextResponse.json(
            {
                message: "SUCCESS",
                data: plans,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error fetching subscription plans:", error);
        return NextResponse.json(
            { error: "Failed to fetch subscription plans", detail: error.message },
            { status: 500 }
        );
    }
}
