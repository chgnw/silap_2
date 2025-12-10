import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const sql = `
      SELECT 
        id,
        vehicle_name,
        brand,
        model,
        license_plate,
        vin,
        max_weight,
        status,
        created_at,
        updated_at
      FROM ms_vehicle
      ORDER BY id ASC
    `;

    const vehicles = await query(sql);

    return NextResponse.json(
      {
        message: "SUCCESS",
        data: vehicles,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicles", detail: error.message },
      { status: 500 }
    );
  }
}
