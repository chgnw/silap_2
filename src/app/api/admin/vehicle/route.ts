import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const sql = `
      SELECT 
        v.id,
        v.vehicle_category_id,
        v.brand,
        v.model,
        v.license_plate,
        v.vin,
        v.status,
        v.created_at,
        v.updated_at,
        vc.category_name,
        vc.min_weight,
        vc.max_weight as category_max_weight
      FROM ms_vehicle v
      LEFT JOIN ms_vehicle_category vc ON v.vehicle_category_id = vc.id
      WHERE v.is_active = TRUE
      ORDER BY v.id ASC
    `;

    const vehicles = await query(sql);

    // Transform to include category object
    const transformedVehicles = (vehicles as any[]).map((v) => ({
      id: v.id,
      vehicle_category_id: v.vehicle_category_id,
      brand: v.brand,
      model: v.model,
      license_plate: v.license_plate,
      vin: v.vin,
      status: v.status,
      created_at: v.created_at,
      updated_at: v.updated_at,
      category: v.category_name
        ? {
          category_name: v.category_name,
          min_weight: v.min_weight,
          max_weight: v.category_max_weight,
        }
        : null,
    }));

    return NextResponse.json(
      {
        message: "SUCCESS",
        data: transformedVehicles,
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
