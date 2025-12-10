import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const sql = `
      SELECT 
        id,
        category_name,
        min_weight,
        max_weight,
        description,
        created_at,
        updated_at
      FROM ms_vehicle_category
      ORDER BY min_weight ASC
    `;

    const categories = await query(sql);

    return NextResponse.json(
      {
        message: "SUCCESS",
        data: categories,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching vehicle categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicle categories", detail: error.message },
      { status: 500 }
    );
  }
}
