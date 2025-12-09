import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sql = `
      SELECT 
        v.id,
        v.brand,
        v.model,
        v.license_plate,
        v.vin,
        v.status,
        v.vehicle_category_id,
        vc.category_name,
        vc.min_weight as category_min_weight,
        vc.max_weight as category_max_weight,
        vc.max_weight as max_weight,
        vc.description as category_description
      FROM ms_vehicle v
      LEFT JOIN ms_vehicle_category vc ON v.vehicle_category_id = vc.id
      WHERE v.id = ?
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
