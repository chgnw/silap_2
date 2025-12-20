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

    // Check if category exists and is active
    const checkSql = `SELECT id FROM ms_vehicle_category WHERE id = ? AND is_active = TRUE`;
    const existingData = await query(checkSql, [id]) as any[];

    if (existingData.length === 0) {
      return NextResponse.json(
        { error: "Vehicle category not found" },
        { status: 404 }
      );
    }

    // Soft delete - set is_active to FALSE
    const sql = `UPDATE ms_vehicle_category SET is_active = FALSE WHERE id = ?`;
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
