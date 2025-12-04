import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET - Fetch all drivers with driver-specific data
export async function GET() {
  try {
    const sql = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone_number,
        u.address,
        u.created_at,
        u.updated_at,
        d.license_number,
        d.id_card_number,
        d.is_verified,
        d.is_available,
        d.rating,
        d.total_deliveries,
        d.assigned_vehicle_id,
        v.vehicle_name as assigned_vehicle_name,
        d.notes
      FROM ms_users u
      INNER JOIN ms_role r ON u.role_id = r.id
      LEFT JOIN ms_driver d ON u.id = d.user_id
      LEFT JOIN ms_vehicle v ON d.assigned_vehicle_id = v.id
      WHERE r.role_name = 'driver'
      ORDER BY u.id DESC
    `;

    const drivers = await query(sql);

    return NextResponse.json(
      {
        message: "SUCCESS",
        data: drivers,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching drivers:", error);
    return NextResponse.json(
      { error: "Failed to fetch drivers", detail: error.message },
      { status: 500 }
    );
  }
}
