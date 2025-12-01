import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST (req: NextRequest) {
    try {
        const body = await req.json();
        const { event_id, user_id, new_address, new_date, new_time } = body;
        // console.log("req body /update-event-detail: ", body);

        const sql = `
            UPDATE tr_pickup_event
            SET pickup_address = ?,
            event_date = ?,
            pickup_time = ?
            WHERE id = ? 
            AND user_id = ?;
        `
        const result = await query(sql, [new_address, new_date, new_time, event_id, user_id]) as any;
        if(result.affectedRows == 0) {
            return NextResponse.json({
                message: "FAILED",
                detail: "Event gagal diperbaharui"
            }, { status: 500 });
        }

        return NextResponse.json({
            message: "SUCCESS",
            detail: "Event berhasil diperbaharui"
        }, { status: 200 });
    } catch (error:any) {
        console.error("error in /update-event-detail: ", error);
        return NextResponse.json({
            message: "FAILED",
            detail: "Terjadi kesalahan pada server."
        }, { status: 500 });
    }
}