import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const sql = `
      SELECT 
        d.id,
        d.user_id,
        d.id_card_number,
        d.license_number,
        d.is_verified,
        d.is_available,
        d.total_deliveries,
        d.assigned_vehicle_id,
        d.created_at,
        d.updated_at,
        u.first_name,
        u.last_name,
        u.email,
        u.phone_number,
        u.address
      FROM ms_driver d
      INNER JOIN ms_user u ON d.user_id = u.id
      WHERE u.role_id = 3 AND d.is_deleted = FALSE
      ORDER BY d.id DESC
    `;

    const results = await query(sql);

    const drivers = results.map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      id_card_number: row.id_card_number,
      license_number: row.license_number,
      is_verified: row.is_verified,
      is_available: row.is_available,
      total_deliveries: row.total_deliveries,
      assigned_vehicle_id: row.assigned_vehicle_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user: {
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        phone_number: row.phone_number,
        address: row.address,
      },
    }));

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
