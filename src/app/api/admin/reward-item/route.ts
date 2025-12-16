import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const sql = `
            SELECT
                re.*,
                rc.category_name
            FROM ms_reward re
            JOIN ms_reward_category rc ON rc.id = re.category_id
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
