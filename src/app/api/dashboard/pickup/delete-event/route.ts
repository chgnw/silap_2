import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST (req: NextRequest) {
    try {
        const body = await req.json();
        const { event_id, user_id } = body;

        const sql = `
            DELETE FROM tr_pickup_event
            WHERE id = ?
            AND user_id = ?;
        `
        const result = await query(sql, [event_id, user_id]) as any;
        if(result.affectedRows == 0) {
            return NextResponse.json({
                message: "FAILED",
                detail: "Gagal menghapus event"
            }, { status: 500 });
        }

        return NextResponse.json({
            message: "SUCCESS",
            detail: "Event berhasil di hapus"
        }, { status: 200 });
    } catch (error:any) {
        console.error("Error in /delete-event: ", error);
        return NextResponse.json({
            message: "FAILED",
            detail: "Terjadi kesalahan pada server"
        }, { status: 500 });
    }
}