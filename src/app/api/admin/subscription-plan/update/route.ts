import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, plan_name, description, price, duration_days, pickup_frequency, max_weight } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Plan ID is required" },
                { status: 400 }
            );
        }

        if (!plan_name) {
            return NextResponse.json(
                { error: "Plan name is required" },
                { status: 400 }
            );
        }

        if (!price || price <= 0) {
            return NextResponse.json(
                { error: "Valid price is required" },
                { status: 400 }
            );
        }

        if (!duration_days || duration_days <= 0) {
            return NextResponse.json(
                { error: "Valid duration days is required" },
                { status: 400 }
            );
        }

        // Check for duplicate plan name (excluding current)
        const checkSql = `SELECT id FROM ms_subscription_plan WHERE plan_name = ? AND id != ?`;
        const existing = await query(checkSql, [plan_name, id]) as any[];
        if (existing.length > 0) {
            return NextResponse.json(
                { error: "Plan with this name already exists" },
                { status: 409 }
            );
        }

        const sql = `
            UPDATE ms_subscription_plan 
            SET plan_name = ?, 
                description = ?, 
                price = ?, 
                duration_days = ?, 
                pickup_frequency = ?, 
                max_weight = ?
            WHERE id = ?
        `;

        await query(sql, [
            plan_name,
            description || null,
            price,
            duration_days,
            pickup_frequency || null,
            max_weight || null,
            id
        ]);

        return NextResponse.json(
            {
                message: "SUCCESS",
                detail: "Subscription plan updated successfully",
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error updating subscription plan:", error);
        return NextResponse.json(
            { error: "Failed to update subscription plan", detail: error.message },
            { status: 500 }
        );
    }
}
