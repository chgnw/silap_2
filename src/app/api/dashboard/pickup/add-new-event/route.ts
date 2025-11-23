import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST (req: NextRequest) {
    try {
        const body = await req.json();

        const { userData, pickupType, date, time, vehicle, weight} = body;
        const user_id = userData.user_id;
        const pickup_address = userData.address;
        const pickup_type_id = pickupType.id;
        const eventDateTime = new Date(`${date}T${time}:00+07:00`);
        const event_date = eventDateTime.toISOString().split('T')[0];
        const pickup_time = time;
        const vehicle_id = vehicle.id;
        const pickup_weight = parseFloat(weight);

        const checkSql = `
            SELECT id FROM tr_pickup_event 
            WHERE user_id = ? 
            AND event_date = ? 
            AND pickup_time = ? 
            AND pickup_address = ?
            LIMIT 1
        `;

        const existingEvent = await query(checkSql, [
            user_id,
            event_date,
            pickup_time,
            pickup_address
        ]);

        if (Array.isArray(existingEvent) && existingEvent.length > 0) {
            return NextResponse.json({
                message: "DUPLICATE_EVENT",
                error: "Jadwal penjemputan duplikat ditemukan.",
                details: "Anda sudah memiliki jadwal penjemputan di waktu dan lokasi yang sama persis."
            }, { status: 409 });
        }
        
        const sql = `
            INSERT INTO tr_pickup_event (user_id, pickup_address, pickup_weight, pickup_type_id, event_date, pickup_time, vehicle_id)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        `
        
        const result = await query(sql, [
            user_id,
            pickup_address,
            pickup_weight,
            pickup_type_id,
            event_date,
            pickup_time,
            vehicle_id
        ]);

        return NextResponse.json({
            message: "SUCCESS",
            data: result
        }, { status: 200 });
    } catch (error:any) {
        console.error('Error in /dashboard/add-new-event :', error);
        return NextResponse.json({
            message: "FAILED",
            error: 'Error in /dashboard/add-new-event : ', details: error.message 
        }, { status: 500 });
    }
}