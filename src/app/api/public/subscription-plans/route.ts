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
                is_tentative_price
            FROM ms_subscription_plan
            WHERE is_active = 1
            ORDER BY is_tentative_price ASC, id ASC
        `;

        const plans = await query(sql);
        console.log(plans);

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
