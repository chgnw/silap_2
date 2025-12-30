import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { plan_name, description, price, duration_days, pickup_frequency, max_weight, features, is_popular, is_tentative_price } = body;

        if (!plan_name) {
            return NextResponse.json(
                { error: "Plan name is required" },
                { status: 400 }
            );
        }

        // Price is required only if is_tentative_price is false
        if (!is_tentative_price && (!price || price <= 0)) {
            return NextResponse.json(
                { error: "Valid price is required (or mark as tentative price)" },
                { status: 400 }
            );
        }

        if (!duration_days || duration_days <= 0) {
            return NextResponse.json(
                { error: "Valid duration days is required" },
                { status: 400 }
            );
        }

        // Check for existing plan with same name
        const checkSql = `SELECT id, is_active FROM ms_subscription_plan WHERE plan_name = ?`;
        const existing = await query(checkSql, [plan_name]) as any[];

        if (existing.length > 0) {
            const existingPlan = existing[0];

            // If active plan exists, return error
            if (existingPlan.is_active) {
                return NextResponse.json(
                    { error: "Plan with this name already exists" },
                    { status: 409 }
                );
            }

            // If inactive plan exists, reactivate and update it
            const updateSql = `
                UPDATE ms_subscription_plan 
                SET is_active = TRUE,
                    description = ?,
                    price = ?,
                    duration_days = ?,
                    pickup_frequency = ?,
                    max_weight = ?,
                    features = ?,
                    is_popular = ?,
                    is_tentative_price = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            await query(updateSql, [
                description || null,
                is_tentative_price ? null : price,
                duration_days,
                pickup_frequency || null,
                max_weight || null,
                features || null,
                is_popular || false,
                is_tentative_price || false,
                existingPlan.id
            ]);
        } else {
            // No existing plan, insert new one
            const insertSql = `
                INSERT INTO ms_subscription_plan 
                (plan_name, description, price, duration_days, pickup_frequency, max_weight, features, is_popular, is_tentative_price)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            await query(insertSql, [
                plan_name,
                description || null,
                is_tentative_price ? null : price,
                duration_days,
                pickup_frequency || null,
                max_weight || null,
                features || null,
                is_popular || false,
                is_tentative_price || false
            ]);
        }

        return NextResponse.json(
            {
                message: "SUCCESS",
                detail: "Subscription plan added successfully",
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Error adding subscription plan:", error);
        return NextResponse.json(
            { error: "Failed to add subscription plan", detail: error.message },
            { status: 500 }
        );
    }
}
