import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category_id, category_name } = body;

    const sqlCheck = `
            SELECT id FROM ms_reward_category
            WHERE id = ?
        `;
    const resultCheck = (await query(sqlCheck, [category_id])) as any;
    if (resultCheck === 0) {
      return NextResponse.json(
        {
          message: "ERR_NOT_FOUND",
          detail: "Data tidak ditemukan!",
        },
        { status: 404 }
      );
    }

    const sql = `
            UPDATE ms_reward_category
            SET category_name = ?
            WHERE id = ?
        `;
    const result = (await query(sql, [category_name, category_id])) as any;
    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          message: "FAILED",
          detail: "Gagal memperbaharui data!",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "SUCCESS",
        detail: "Data berhasil diperbaharui!",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in /reward-category/update: ", error);
    return NextResponse.json(
      {
        message: "Error in /reward-category/update",
        error: error,
      },
      { status: 500 }
    );
  }
}
