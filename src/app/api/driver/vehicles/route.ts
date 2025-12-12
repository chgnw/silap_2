import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db";

export async function GET() {
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
      WHERE v.status = 'inactive'
      ORDER BY vc.category_name ASC, v.brand ASC, v.model ASC
    `;

    const vehicles = await query(sql);
    console.log("vehicles: ", vehicles);

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
