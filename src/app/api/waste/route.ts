import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const sql = `
      SELECT 
        id,
        waste_category_name AS name,
        icon_name AS icon,
        unit,
        points_per_unit
      FROM ms_waste_category
      WHERE is_deleted = FALSE
      ORDER BY id
    `;
    const rows = await query(sql);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching waste data:", error);
    return NextResponse.json(
      { message: "Failed to fetch waste data" },
      { status: 500 }
    );
  }
}
