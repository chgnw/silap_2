import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { question, answer, is_active, sort_order } = body;

        // Validate required fields
        if (!question || !answer) {
            return NextResponse.json(
                { error: "Question and answer are required" },
                { status: 400 }
            );
        }

        const sql = `
            INSERT INTO ms_faq (question, answer, is_active, sort_order)
            VALUES (?, ?, ?, ?)
        `;

        const result = await query(sql, [
            question,
            answer,
            is_active !== undefined ? is_active : true,
            sort_order || 0
        ]) as any;

        return NextResponse.json(
            {
                message: "SUCCESS",
                data: { id: result.insertId }
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Error adding FAQ:", error);
        return NextResponse.json(
            { error: "Failed to add FAQ", detail: error.message },
            { status: 500 }
        );
    }
}
