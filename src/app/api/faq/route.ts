import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
    try {
        const sql = `
            SELECT 
                question,
                answer
            FROM ms_faq
            WHERE is_active = 1
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
        console.error("Error fetching public FAQs:", error);
        return NextResponse.json(
            { error: "Failed to fetch FAQs", detail: error.message },
            { status: 500 }
        );
    }
}
