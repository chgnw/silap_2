import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const sql = `
            SELECT id, category_name, icon_path, created_at, updated_at
            FROM ms_reward_category
            WHERE is_active = TRUE
        `;
    const result = await query(sql);

    return NextResponse.json(
      {
        message: "SUCCESS",
        data: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in /reward-category: ", error);
    return NextResponse.json(
      {
        message: "Error in /reward-category",
        error: error,
      },
      { status: 500 }
    );
  }
}
