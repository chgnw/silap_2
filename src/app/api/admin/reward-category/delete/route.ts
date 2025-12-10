import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    const sqlCheck = `
            SELECT id FROM ms_reward_category
            WHERE id = ?
        `;
    const resultCheck = (await query(sqlCheck, [id])) as any;
    if (resultCheck.length === 0) {
      return NextResponse.json(
        {
          message: "ERR_NOT_FOUND",
          detail: "Data tidak ditemukan!",
        },
        { status: 404 }
      );
    }

    const sql = `
            DELETE FROM ms_reward_category
            WHERE id = ?
        `;
    const result = (await query(sql, [id])) as any;
    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          message: "FAILED",
          detail: "Gagal menghapus data!",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "SUCCESS",
        detail: "Data berhasil di hapus!",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in /reward-category/delete: ", error);
    return NextResponse.json(
      {
        message: "Error in /reward-category/delete",
        error: error,
      },
      { status: 500 }
    );
  }
}
