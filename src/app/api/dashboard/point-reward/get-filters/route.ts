import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET () {
    try {
        const sql = `
            SELECT *
            FROM ms_reward_categories
        `
        const filterCategory = await query(sql);

        return NextResponse.json({
            message: "SUCCESS",
            data: filterCategory
        }, { status: 200 });
    } catch (error:any) {
        return NextResponse.json({
            message: "FAILED",
            detail: "Terjadi kesalahan pada server.",
            error: error
        }, { status: 500 });
    }
}