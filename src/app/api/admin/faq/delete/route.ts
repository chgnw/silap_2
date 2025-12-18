import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { id } = body;

        // Validate required fields
        if (!id) {
            return NextResponse.json(
                { error: "FAQ ID is required" },
                { status: 400 }
            );
        }

        // Check if FAQ exists
        const checkSql = `SELECT id FROM ms_faq WHERE id = ?`;
        const existing = await query(checkSql, [id]) as any[];

        if (existing.length === 0) {
            return NextResponse.json(
                { error: "FAQ not found" },
                { status: 404 }
            );
        }

        const sql = `DELETE FROM ms_faq WHERE id = ?`;
        await query(sql, [id]);

        return NextResponse.json(
            {
                message: "SUCCESS",
                data: { id }
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error deleting FAQ:", error);
        return NextResponse.json(
            { error: "Failed to delete FAQ", detail: error.message },
            { status: 500 }
        );
    }
}
