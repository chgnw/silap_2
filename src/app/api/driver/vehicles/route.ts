import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sql = `
      SELECT 
        id,
        vehicle_name,
        brand,
        model,
        license_plate,
        vin,
        max_weight,
        status
      FROM ms_vehicle
      WHERE status = 'available'
      ORDER BY vehicle_name ASC, license_plate ASC
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
