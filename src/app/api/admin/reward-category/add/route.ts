import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category_name } = body;

    const sqlCheck = `
            SELECT id FROM ms_reward_category
            WHERE category_name LIKE ?
        `;
    const resultCheck = (await query(sqlCheck, [category_name])) as any;
    if (resultCheck.length > 0) {
      return NextResponse.json(
        {
          message: "DUPLICATE",
          detail: `Category '${category_name}' sudah ada!`,
        },
        { status: 409 }
      );
    }

    const sql = `
            INSERT INTO ms_reward_category (category_name)
            VALUE (?)
        `;
    const result = (await query(sql, [category_name])) as any;
    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          message: "FAILED",
          detail: "Gagal menambahkan kategori baru",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "SUCCESS",
        detail: "Berhasil menambahkan kategori baru",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in /reward-category/add: ", error);
    return NextResponse.json(
      {
        message: "Error in /reward-category/add",
        error: error,
      },
      { status: 500 }
    );
  }
}
