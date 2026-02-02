import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    // console.log("userId: ", userId);

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Get driver info with assigned vehicle, vehicle category, and operational area
    const driverSql = `
      SELECT 
        d.id as driver_id,
        d.assigned_vehicle_id,
        d.operational_area,
        v.vehicle_category_id,
        vc.category_name,
        vc.min_weight as category_min_weight,
        vc.max_weight as category_max_weight
      FROM ms_driver d
      LEFT JOIN ms_vehicle v ON d.assigned_vehicle_id = v.id
      LEFT JOIN ms_vehicle_category vc ON v.vehicle_category_id = vc.id
      WHERE d.user_id = ? AND d.is_deleted = FALSE
    `;
    const driverData = (await query(driverSql, [userId])) as any[];
    if (driverData.length === 0) {
      return NextResponse.json(
        {
          error: "Driver not found",
        },
        { status: 404 }
      );
    }

    const driver = driverData[0];

    if (
      !driver.assigned_vehicle_id ||
      !driver.vehicle_category_id ||
      !driver.operational_area
    ) {
      return NextResponse.json(
        {
          message: "SUCCESS",
          data: {
            driver_info: driver,
            pickup_events: [],
            today_stats: {
              total_orders: 0,
              completed: 0,
              pending: 0,
            },
            setup_required: {
              vehicle: !driver.assigned_vehicle_id,
              operational_area: !driver.operational_area,
            },
          },
        },
        { status: 200 }
      );
    }

    // Get pickups that are currently on-progress for this driver
    // Status 2 = Accepted, 6 = On the way, 7 = Arrived
    const onProgressSql = `
      SELECT 
        pe.id,
        pe.transaction_code,
        pe.user_id,
        pe.pickup_address,
        pe.pickup_regency,
        pe.pickup_weight,
        pe.pickup_type_id,
        pe.event_date,
        pe.pickup_time,
        pe.vehicle_category_id,
        pe.event_status,
        pe.user_notes,
        pe.image_url,
        pe.created_at,
        u.first_name,
        u.last_name,
        u.phone_number,
        pt.pickup_type_name,
        vc.category_name,
        ts.transaction_status_name as status
      FROM tr_pickup p
      JOIN tr_pickup_event pe ON p.pickup_event_id = pe.id
      JOIN ms_user u ON pe.user_id = u.id
      JOIN ms_pickup_type pt ON pe.pickup_type_id = pt.id
      LEFT JOIN ms_vehicle_category vc ON pe.vehicle_category_id = vc.id
      JOIN ms_transaction_status ts ON p.transaction_status_id = ts.id
      WHERE p.driver_id = ?
        AND p.transaction_status_id IN (2, 6, 7)
      ORDER BY p.created_at DESC
    `;

    const onProgressPickups = await query(onProgressSql, [driver.driver_id]);

    // Get pickup events for today that match driver's vehicle CATEGORY, weight range, and operational area
    // Only show events that haven't been accepted (not in tr_pickup yet) and not completed/cancelled
    const eventsSql = `
      SELECT 
        pe.id,
        pe.transaction_code,
        pe.user_id,
        pe.pickup_address,
        pe.pickup_regency,
        pe.pickup_weight,
        pe.pickup_type_id,
        pe.event_date,
        pe.pickup_time,
        pe.vehicle_category_id,
        pe.event_status,
        pe.user_notes,
        pe.image_url,
        pe.created_at,
        u.first_name,
        u.last_name,
        u.phone_number,
        pt.pickup_type_name,
        vc.category_name,
        vc.min_weight as category_min_weight,
        vc.max_weight as category_max_weight
      FROM tr_pickup_event pe
      JOIN ms_user u ON pe.user_id = u.id
      JOIN ms_pickup_type pt ON pe.pickup_type_id = pt.id
      LEFT JOIN ms_vehicle_category vc ON pe.vehicle_category_id = vc.id
      WHERE pe.event_date = CURDATE()
        AND pe.vehicle_category_id = ?
        AND pe.pickup_weight >= ?
        AND pe.pickup_weight <= ?
        AND UPPER(pe.pickup_regency) = UPPER(?)
        AND pe.event_status = 'pending'
        AND NOT EXISTS (
          SELECT 1 FROM tr_pickup tp 
          WHERE tp.pickup_event_id = pe.id
        )
      ORDER BY pe.pickup_time ASC
    `;

    // Debug: Check query parameters
    // console.log("=== QUERY PARAMETERS ===");
    // console.log("driver.vehicle_category_id:", driver.vehicle_category_id);
    // console.log("driver.category_name:", driver.category_name);
    // console.log("driver.category_min_weight:", driver.category_min_weight);
    // console.log("driver.category_max_weight:", driver.category_max_weight);
    // console.log("driver.operational_area:", driver.operational_area);

    const pickupEvents = await query(eventsSql, [
      driver.vehicle_category_id,
      driver.category_min_weight,
      driver.category_max_weight,
      driver.operational_area,
    ]);
    // console.log("=== PICKUP EVENTS RESULT ===");
    // console.log("pickup events count:", pickupEvents.length);
    // console.log("pickup events: ", pickupEvents);

    // Debug: Check all events without filters
    const debugSql = `
      SELECT 
        pe.id,
        pe.event_date,
        pe.pickup_weight,
        pe.vehicle_category_id,
        vc.category_name,
        vc.min_weight as cat_min,
        vc.max_weight as cat_max,
        CURDATE() as today,
        CASE 
          WHEN pe.event_date = CURDATE() THEN 'MATCH'
          ELSE 'NO MATCH'
        END as date_check,
        CASE
          WHEN pe.vehicle_category_id = ? THEN 'MATCH'
          ELSE 'NO MATCH'
        END as category_check,
        CASE
          WHEN pe.pickup_weight >= ? AND pe.pickup_weight <= ? THEN 'MATCH'
          ELSE 'NO MATCH'
        END as weight_check
      FROM tr_pickup_event pe
      LEFT JOIN ms_vehicle_category vc ON pe.vehicle_category_id = vc.id
      ORDER BY pe.id DESC
      LIMIT 5
    `;
    const debugEvents = await query(debugSql, [
      driver.vehicle_category_id,
      driver.category_min_weight,
      driver.category_max_weight,
    ]);
    // console.log("=== DEBUG: ALL EVENTS (LATEST 5) ===");
    // console.log(debugEvents);

    // Get today's stats
    // total_orders: pickup events available today (not yet accepted and not cancelled/completed)
    // completed: pickups completed by this driver today
    const statsSql = `
      SELECT 
        (SELECT COUNT(*) 
         FROM tr_pickup_event pe
         WHERE pe.event_date = CURDATE()
           AND pe.vehicle_category_id = ?
           AND pe.pickup_weight >= ?
           AND pe.pickup_weight <= ?
           AND UPPER(pe.pickup_regency) = UPPER(?)
           AND pe.event_status = 'pending'
           AND NOT EXISTS (
             SELECT 1 FROM tr_pickup tp 
             WHERE tp.pickup_event_id = pe.id
           )
        ) as total_orders,
        (SELECT COUNT(*) 
         FROM tr_pickup tp
         WHERE tp.driver_id = ?
           AND DATE(tp.created_at) = CURDATE()
           AND tp.transaction_status_id = 4
        ) as completed
    `;
    const stats = (await query(statsSql, [
      driver.vehicle_category_id,
      driver.category_min_weight,
      driver.category_max_weight,
      driver.operational_area,
      driver.driver_id,
    ])) as any[];
    // console.log("=== STATS RESULT ===");
    // console.log("stats: ", stats[0]);

    return NextResponse.json(
      {
        message: "SUCCESS",
        data: {
          driver_info: driver,
          on_progress_pickups: onProgressPickups,
          pickup_events: pickupEvents,
          today_stats: stats[0],
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching pickup events:", error);
    return NextResponse.json(
      { error: "Failed to fetch pickup events", detail: error.message },
      { status: 500 }
    );
  }
}
