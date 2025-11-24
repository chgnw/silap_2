import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST (req: NextRequest) {
    try {
        const body = await req.json();
        const { user_id } = body;
        
        const sql = `
            SELECT 
                tr_pickup_event.id,
                user_id,
                ms_users.first_name,
                ms_users.last_name,
                pickup_address,
                pickup_weight,
                pickup_type_id,
                pickup_type_name,
                DATE_FORMAT(event_date, '%Y-%m-%d') as event_date,
                pickup_time,
                vehicle_id,
                tr_pickup_event.created_at,
                tr_pickup_event.updated_at
            FROM tr_pickup_event
            JOIN ms_users ON ms_users.id = tr_pickup_event.user_id
            JOIN ms_pickup_type ON ms_pickup_type.id = tr_pickup_event.pickup_type_id
            WHERE tr_pickup_event.user_id = ?
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