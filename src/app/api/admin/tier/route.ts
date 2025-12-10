import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const sql = `
      SELECT 
        id,
        tier_name,
        min_weight,
        max_weight,
        target_weight,
        description,
        benefit,
        created_at,
        updated_at
      FROM ms_tier_list
      ORDER BY min_weight ASC
    `;

    const tiers = await query(sql);

    return NextResponse.json(
      {
        message: "SUCCESS",
        data: tiers,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching tiers:", error);
    return NextResponse.json(
      { error: "Failed to fetch tiers", detail: error.message },
      { status: 500 }
    );
  }
}
