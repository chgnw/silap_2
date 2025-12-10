import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { query } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      WHERE id = ?
    `;

    const vehicles = (await query(sql, [params.id])) as any[];

    if (vehicles.length === 0) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "SUCCESS",
        data: vehicles[0],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching vehicle:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicle", detail: error.message },
      { status: 500 }
    );
  }
}
