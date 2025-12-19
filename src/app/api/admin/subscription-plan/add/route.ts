import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { plan_name, description, price, duration_days, pickup_frequency, max_weight, features, is_popular } = body;

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

        // Check for duplicate plan name
        const checkSql = `SELECT id FROM ms_subscription_plan WHERE plan_name = ?`;
        const existing = await query(checkSql, [plan_name]) as any[];
        if (existing.length > 0) {
            return NextResponse.json(
                { error: "Plan with this name already exists" },
                { status: 409 }
            );
        }

        const sql = `
            INSERT INTO ms_subscription_plan 
            (plan_name, description, price, duration_days, pickup_frequency, max_weight, features, is_popular)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await query(sql, [
            plan_name,
            description || null,
            price,
            duration_days,
            pickup_frequency || null,
            max_weight || null,
            features || null,
            is_popular || false
        ]);

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
