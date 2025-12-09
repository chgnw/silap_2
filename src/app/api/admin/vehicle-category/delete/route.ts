import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Vehicle category ID is required" },
        { status: 400 }
      );
    }

    // Check if any vehicles are using this category
    const checkSql = `
      SELECT COUNT(*) as count FROM ms_vehicle 
      WHERE vehicle_category_id = ?
    `;
    const result = (await query(checkSql, [id])) as any[];

    if (result[0].count > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete category that is being used by vehicles",
          detail: `${result[0].count} vehicle(s) are using this category`,
        },
        { status: 409 }
      );
    }

    const sql = `DELETE FROM ms_vehicle_category WHERE id = ?`;

    await query(sql, [id]);

    return NextResponse.json(
      {
        message: "SUCCESS",
        detail: "Vehicle category deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting vehicle category:", error);
    return NextResponse.json(
      { error: "Failed to delete vehicle category", detail: error.message },
      { status: 500 }
    );
  }
}
