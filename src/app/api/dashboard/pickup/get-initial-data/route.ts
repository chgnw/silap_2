import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    let pickupTypeSql = `
            SELECT 
                id,
                pickup_type_name AS name
            FROM ms_pickup_type
        `;
    const pickupTypeData = await query(pickupTypeSql);

    // Get vehicle categories instead of specific vehicles
    let vehicleTypeSql = `
            SELECT 
                id,
                category_name AS name,
                min_weight,
                max_weight,
                description
            FROM ms_vehicle_category
            ORDER BY min_weight ASC
        `;
    const vehicleTypeData = await query(vehicleTypeSql);

    return NextResponse.json(
      {
        message: "SUCCESS",
        data: {
          pickupType: pickupTypeData,
          vehicleType: vehicleTypeData,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in /dashboard/get-initial-data :", error);
    return NextResponse.json(
      {
        error: "Error in /dashboard/get-initial-data : ",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
