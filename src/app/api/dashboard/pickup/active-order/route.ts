import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        if (!userId) {
            return NextResponse.json(
                { message: "FAILED", detail: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get the closest active pickup request for today
        // Include completed orders so receipt modal can be shown
        // Exclude only cancelled orders (status 5)
        const sql = `
            SELECT 
                pe.id as event_id,
                pe.transaction_code,
                pe.pickup_address,
                pe.pickup_weight,
                pe.pickup_regency,
                pe.event_date,
                pe.pickup_time,
                pe.event_status,
                pe.user_notes,
                pe.created_at as event_created_at,
                pt.pickup_type_name,
                vc.category_name as vehicle_category,
                
                -- Pickup info (if driver accepted)
                p.id as pickup_id,
                p.transaction_status_id,
                ts.transaction_status_name,
                p.created_at as pickup_created_at,
                
                -- Driver info (if assigned)
                d.id as driver_id,
                du.first_name as driver_first_name,
                du.last_name as driver_last_name,
                du.phone_number as driver_phone,
                du.profile_picture as driver_image,

                -- Vehicle info (if assigned)
                v.id as vehicle_id,
                CONCAT(COALESCE(v.brand, ''), ' ', COALESCE(v.model, '')) as vehicle_name,
                v.license_plate,
                vcat.category_name as assigned_vehicle_category,
                vcat.image_path as vehicle_category_image
            FROM tr_pickup_event pe
            JOIN ms_pickup_type pt ON pe.pickup_type_id = pt.id
            LEFT JOIN ms_vehicle_category vc ON pe.vehicle_category_id = vc.id
            LEFT JOIN tr_pickup p ON pe.id = p.pickup_event_id
            LEFT JOIN ms_transaction_status ts ON p.transaction_status_id = ts.id
            LEFT JOIN ms_driver d ON p.driver_id = d.id
            LEFT JOIN ms_user du ON d.user_id = du.id
            LEFT JOIN ms_vehicle v ON d.assigned_vehicle_id = v.id
            LEFT JOIN ms_vehicle_category vcat ON v.vehicle_category_id = vcat.id
            WHERE pe.user_id = ?
                AND pe.event_date = CURDATE()
                AND pe.event_status != 'cancelled'
                AND (p.id IS NULL OR p.transaction_status_id NOT IN (5))
            ORDER BY 
                CASE WHEN p.transaction_status_id = 4 THEN 1 ELSE 0 END ASC,
                pe.pickup_time ASC
            LIMIT 1
        `;

        const result = (await query(sql, [userId])) as any[];

        if (result.length === 0) {
            return NextResponse.json(
                {
                    message: "SUCCESS",
                    data: null,
                },
                { status: 200 }
            );
        }

        const order = result[0];

        // Determine current step based on status
        let currentStep = 1; // Default: Pesanan Dibuat
        if (order.pickup_id) {
            // Has been accepted by driver
            switch (order.transaction_status_id) {
                case 2: // Accepted - waiting for pickup time
                    currentStep = 3; // Menunggu Waktu Penjemputan
                    break;
                case 6: // On the way
                    currentStep = 4; // Menuju Lokasi Penjemputan
                    break;
                case 7: // Arrived/Pickup
                    currentStep = 5; // Armada Pickup
                    break;
                case 4: // Completed
                    currentStep = 6; // Selesai
                    break;
                default:
                    currentStep = 2; // Pesanan Dikonfirmasi
            }
        } else {
            // Not yet accepted - still pending
            currentStep = 2; // Pesanan Dikonfirmasi (menunggu driver)
        }

        const response = {
            event_id: order.event_id,
            pickup_id: order.pickup_id,
            transaction_code: order.transaction_code,
            pickup_address: order.pickup_address,
            pickup_weight: order.pickup_weight,
            pickup_regency: order.pickup_regency,
            event_date: order.event_date,
            pickup_time: order.pickup_time,
            pickup_type: order.pickup_type_name,
            vehicle_category: order.vehicle_category,
            current_step: currentStep,
            is_completed: order.transaction_status_id === 4,
            has_driver: !!order.driver_id,
            driver: order.driver_id
                ? {
                    id: order.driver_id,
                    name: `${order.driver_first_name} ${order.driver_last_name || ""}`.trim(),
                    phone: order.driver_phone,
                    image: order.driver_image,
                }
                : null,
            vehicle: order.vehicle_id
                ? {
                    id: order.vehicle_id,
                    name: order.vehicle_name,
                    license_plate: order.license_plate,
                    category: order.assigned_vehicle_category,
                    image: order.vehicle_category_image,
                }
                : null,
        };

        return NextResponse.json(
            {
                message: "SUCCESS",
                data: response,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error fetching active order:", error);
        return NextResponse.json(
            { message: "FAILED", detail: error.message },
            { status: 500 }
        );
    }
}
