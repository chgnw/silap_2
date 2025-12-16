import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db";

// GET: Fetch driver settings (operational area, assigned vehicle)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sql = `
      SELECT 
        d.id as driver_id,
        d.operational_area,
        d.assigned_vehicle_id,
        d.is_available,
        d.is_verified,
        v.brand as vehicle_brand,
        v.model as vehicle_model,
        v.license_plate as vehicle_license_plate,
        vc.category_name as vehicle_category,
        vc.id as vehicle_category_id
      FROM ms_user u
      JOIN ms_driver d ON u.id = d.user_id
      LEFT JOIN ms_vehicle v ON d.assigned_vehicle_id = v.id
      LEFT JOIN ms_vehicle_category vc ON v.vehicle_category_id = vc.id
      WHERE u.email = ?
    `;

    const results = (await query(sql, [session.user.email])) as any[];

    if (results.length === 0) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "SUCCESS",
        data: results[0],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching driver settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch driver settings", detail: error.message },
      { status: 500 }
    );
  }
}

// POST: Update driver settings (operational area)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { operational_area } = body;

    if (!operational_area) {
      return NextResponse.json(
        { error: "Operational area is required" },
        { status: 400 }
      );
    }

    // Get driver ID
    const driverSql = `
      SELECT d.id 
      FROM ms_user u
      JOIN ms_driver d ON u.id = d.user_id
      WHERE u.email = ?
    `;
    const drivers = (await query(driverSql, [session.user.email])) as any[];

    if (drivers.length === 0) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    const driverId = drivers[0].id;

    // Update operational area
    const updateSql = `
      UPDATE ms_driver
      SET operational_area = ?
      WHERE id = ?
    `;

    await query(updateSql, [operational_area, driverId]);

    return NextResponse.json(
      {
        message: "SUCCESS",
        data: {
          operational_area,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating driver settings:", error);
    return NextResponse.json(
      { error: "Failed to update driver settings", detail: error.message },
      { status: 500 }
    );
  }
}
