import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const sql = `
            SELECT
                re.*,
                rc.category_name,
                rc.icon_path AS category_icon_path
            FROM ms_reward re
            JOIN ms_reward_category rc ON rc.id = re.category_id
            WHERE re.is_active = TRUE AND rc.is_active = TRUE
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
