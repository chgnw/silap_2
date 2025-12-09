import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { category_name, min_weight, max_weight, description } =
      await req.json();

    if (!category_name) {
      return NextResponse.json(
        {
          error: "Nama kategori tidak boleh kosong!",
        },
        { status: 400 }
      );
    }

    // Check if category name already exists
    const checkSql = `
      SELECT id FROM ms_vehicle_category 
      WHERE category_name = ?
    `;
    const existing = (await query(checkSql, [category_name])) as any[];
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 409 }
      );
    }

    const sql = `
      INSERT INTO ms_vehicle_category 
      (category_name, min_weight, max_weight, description)
      VALUES (?, ?, ?, ?)
    `;

    await query(sql, [
      category_name,
      min_weight || 0,
      max_weight || null,
      description || null,
    ]);

    return NextResponse.json(
      {
        message: "SUCCESS",
        detail: "Vehicle category added successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding vehicle category:", error);
    return NextResponse.json(
      { error: "Failed to add vehicle category", detail: error.message },
      { status: 500 }
    );
  }
}
