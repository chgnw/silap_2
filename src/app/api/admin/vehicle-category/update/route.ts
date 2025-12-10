import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { id, category_name, min_weight, max_weight, description } =
      await req.json();

    if (!id || !category_name) {
      return NextResponse.json(
        { error: "ID and category name are required" },
        { status: 400 }
      );
    }

    // Check if another category with the same name exists
    const checkSql = `
      SELECT id FROM ms_vehicle_category 
      WHERE category_name = ? AND id != ?
    `;
    const existing = (await query(checkSql, [category_name, id])) as any[];

    if (existing.length > 0) {
      return NextResponse.json(
        {
          error: "Another category with this name already exists",
        },
        { status: 409 }
      );
    }

    const sql = `
      UPDATE ms_vehicle_category
      SET 
        category_name = ?, 
        min_weight = ?, 
        max_weight = ?, 
        description = ?
      WHERE id = ?
    `;

    await query(sql, [
      category_name,
      min_weight || 0,
      max_weight || null,
      description || null,
      id,
    ]);

    return NextResponse.json(
      {
        message: "SUCCESS",
        detail: "Vehicle category updated successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating vehicle category:", error);
    return NextResponse.json(
      { error: "Failed to update vehicle category", detail: error.message },
      { status: 500 }
    );
  }
}
