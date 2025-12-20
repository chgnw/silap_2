import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const sql = `
            SELECT * FROM ms_waste_category
            WHERE is_active = TRUE
        `
        const result = await query(sql);
        return NextResponse.json({
            message: "SUCCESS",
            data: result
        });
    } catch (error: any) {
        console.error("Error in /get-waste-cat: ", error);
        return NextResponse.json({
            message: "FAILED",
            detail: "Error in /get-waste-cat",
            error: error
        });
    }
}