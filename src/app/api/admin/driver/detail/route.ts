import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Driver ID is required" },
        { status: 400 }
      );
    }

    const driverId = parseInt(id);

    if (isNaN(driverId)) {
      return NextResponse.json({ error: "Invalid driver ID" }, { status: 400 });
    }

    const sql = `
      SELECT 
        d.id,
        d.user_id,
        d.license_number,
        d.is_verified,
        d.is_available,
        d.active_since,
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
      INNER JOIN ms_users u ON d.user_id = u.id
      WHERE d.id = ?
    `;

    const results = await query(sql, [driverId]);

    if (!results || results.length === 0) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    const row = results[0];
    const driver = {
      id: row.id,
      user_id: row.user_id,
      license_number: row.license_number,
      is_verified: row.is_verified,
      is_available: row.is_available,
      active_since: row.active_since,
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
    };

    return NextResponse.json(
      {
        message: "SUCCESS",
        data: driver,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching driver:", error);
    return NextResponse.json(
      { error: "Failed to fetch driver", detail: error.message },
      { status: 500 }
    );
  }
}
