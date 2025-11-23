import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST (req: NextRequest) {
    try {
        const body = await req.json();
        const { user_id } = body;
        
        const sql = `
            SELECT 
                id,
                user_id,
                pickup_address,
                pickup_weight,
                pickup_type_id,
                DATE_FORMAT(event_date, '%Y-%m-%d') as event_date,
                pickup_time,
                vehicle_id,
                created_at,
                updated_at
            FROM tr_pickup_event 
            WHERE user_id = ?
        `
        const result = await query(sql, [user_id]);

        return NextResponse.json({
            message: "SUCCESS",
            data: result
        }, { status: 200 })
    } catch (error:any) {
        console.error('Error in /dashboard/get-events :', error);
        return NextResponse.json({
            message: "FAILED",
            error: 'Error in /dashboard/get-events : ', details: error.message 
        }, { status: 500 });
    }
}