import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET () {
    try {
        const sql = `
            SELECT 
                wi.*,
                wc.waste_category_name
            FROM ms_waste_item wi
            JOIN ms_waste_category wc ON wc.id = wi.waste_category_id
        `
        const result = await query(sql);
        return NextResponse.json({
            message: "SUCCESS",
            data: result
        });
    } catch (error:any) {
        console.error("Error in /get-waste-items: ", error);
        return NextResponse.json({
            message: "FAILED",
            detail: "Error in /get-waste-items",
            error: error
        });
    }
}