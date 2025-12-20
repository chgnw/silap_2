import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Plan ID is required" },
                { status: 400 }
            );
        }

        // Check if plan exists and is active
        const checkSql = `SELECT id FROM ms_subscription_plan WHERE id = ? AND is_active = TRUE`;
        const existingData = await query(checkSql, [id]) as any[];

        if (existingData.length === 0) {
            return NextResponse.json(
                { error: "Subscription plan not found" },
                { status: 404 }
            );
        }

        // Soft delete - set is_active to FALSE
        const sql = `UPDATE ms_subscription_plan SET is_active = FALSE WHERE id = ?`;
        await query(sql, [id]);

        return NextResponse.json(
            {
                message: "SUCCESS",
                detail: "Subscription plan deleted successfully",
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error deleting subscription plan:", error);
        return NextResponse.json(
            { error: "Failed to delete subscription plan", detail: error.message },
            { status: 500 }
        );
    }
}
