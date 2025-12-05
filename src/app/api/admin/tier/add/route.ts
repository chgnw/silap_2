import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const {
      tier_name,
      min_weight,
      max_weight,
      target_weight,
      description,
      benefit,
    } = await req.json();

    if (!tier_name) {
      return NextResponse.json(
        { error: "Tier name is required" },
        { status: 400 }
      );
    }

    if (min_weight === undefined || min_weight === null) {
      return NextResponse.json(
        { error: "Minimum weight is required" },
        { status: 400 }
      );
    }

    const checkSql = `
      SELECT id FROM ms_tier_list 
      WHERE tier_name = ?
    `;
    const existing = (await query(checkSql, [tier_name])) as any[];
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Tier with this name already exists" },
        { status: 409 }
      );
    }

    if (
      max_weight !== null &&
      max_weight !== undefined &&
      parseFloat(max_weight) <= parseFloat(min_weight)
    ) {
      return NextResponse.json(
        { error: "Maximum weight must be greater than minimum weight" },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO ms_tier_list 
      (tier_name, min_weight, max_weight, target_weight, description, benefit)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await query(sql, [
      tier_name,
      min_weight,
      max_weight || null,
      target_weight || null,
      description || null,
      benefit || null,
    ]);

    return NextResponse.json(
      {
        message: "SUCCESS",
        detail: "Tier added successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding tier:", error);
    return NextResponse.json(
      { error: "Failed to add tier", detail: error.message },
      { status: 500 }
    );
  }
}
