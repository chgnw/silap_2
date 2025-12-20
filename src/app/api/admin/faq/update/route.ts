import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, question, answer, is_active, sort_order } = body;

        // Validate required fields
        if (!id) {
            return NextResponse.json(
                { error: "FAQ ID is required" },
                { status: 400 }
            );
        }

        if (!question || !answer) {
            return NextResponse.json(
                { error: "Question and answer are required" },
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

        const sql = `
            UPDATE ms_faq 
            SET question = ?, answer = ?, is_active = ?, sort_order = ?
            WHERE id = ?
        `;

        await query(sql, [
            question,
            answer,
            is_active !== undefined ? is_active : true,
            sort_order || 0,
            id
        ]);

        return NextResponse.json(
            {
                message: "SUCCESS",
                data: { id }
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error updating FAQ:", error);
        return NextResponse.json(
            { error: "Failed to update FAQ", detail: error.message },
            { status: 500 }
        );
    }
}
