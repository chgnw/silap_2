import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({
        message: "ID is required"
      }, { status: 400 });
    }

    const checkSql = "SELECT id FROM ms_waste_category WHERE id = ? AND is_active = TRUE";
    const existingData = await query(checkSql, [id]) as any[];

    if (existingData.length === 0) {
      return NextResponse.json({
        message: "Item not found"
      }, { status: 404 });
    }

    // Soft delete - set is_active to FALSE
    const updateSql = "UPDATE ms_waste_category SET is_active = FALSE WHERE id = ?";
    await query(updateSql, [id]);

    return NextResponse.json({
      message: "Deleted successfully"
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error deleting item:", error);
    return NextResponse.json({
      message: "Internal Server Error",
      error: error.message
    }, { status: 500 });
  }
}