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

        // Check if plan is in use by any subscription
        const checkSql = `
            SELECT COUNT(*) as count FROM tr_user_subscription 
            WHERE subscription_plan_id = ?
        `;
        const result = await query(checkSql, [id]) as any[];
        if (result[0].count > 0) {
            return NextResponse.json(
                { error: "Cannot delete plan that is in use by subscriptions" },
                { status: 400 }
            );
        }

        // Check if plan is referenced in pending payments
        const checkPaymentSql = `
            SELECT COUNT(*) as count FROM tr_payment_history 
            WHERE subscription_plan_id = ?
        `;
        const paymentResult = await query(checkPaymentSql, [id]) as any[];
        if (paymentResult[0].count > 0) {
            return NextResponse.json(
                { error: "Cannot delete plan that has pending payments" },
                { status: 400 }
            );
        }

        const sql = `DELETE FROM ms_subscription_plan WHERE id = ?`;
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
