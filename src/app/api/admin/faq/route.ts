import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
    try {
        const sql = `
            SELECT 
                id,
                question,
                answer,
                is_active,
                sort_order,
                created_at,
                updated_at
            FROM ms_faq
            ORDER BY sort_order ASC, created_at DESC
        `;

        const faqs = await query(sql);

        return NextResponse.json(
            {
                message: "SUCCESS",
                data: faqs,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error fetching FAQs:", error);
        return NextResponse.json(
            { error: "Failed to fetch FAQs", detail: error.message },
            { status: 500 }
        );
    }
}
