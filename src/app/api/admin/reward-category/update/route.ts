import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import path from "path";
import fs from "fs/promises";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const category_id = formData.get("category_id") as string;
    const category_name = formData.get("category_name") as string;
    const iconFile = formData.get("icon") as File | null;

    if (!category_id) {
      return NextResponse.json(
        {
          message: "FAILED",
          detail: "ID tidak ditemukan!",
        },
        { status: 400 }
      );
    }

    // Check if category exists and get current icon_path
    const sqlCheck = `
        SELECT id, icon_path FROM ms_reward_category
        WHERE id = ?
    `;
    const resultCheck = (await query(sqlCheck, [category_id])) as any[];
    if (!resultCheck || resultCheck.length === 0) {
      return NextResponse.json(
        {
          message: "ERR_NOT_FOUND",
          detail: "Data tidak ditemukan!",
        },
        { status: 404 }
      );
    }

    const oldIconPath = resultCheck[0].icon_path;

    // Handle icon file upload
    let dbIconPath = oldIconPath;
    if (iconFile && iconFile.size > 0) {
      const uploadDir = path.join(
        process.cwd(),
        "public",
        "upload",
        "rewardCatIcon"
      );
      await fs.mkdir(uploadDir, { recursive: true });

      const timestamp = Date.now();
      const originalName = iconFile.name.replaceAll(" ", "_");
      const filename = `${timestamp}_${originalName}`;

      const arrayBuffer = await iconFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const finalFilePath = path.join(uploadDir, filename);
      await fs.writeFile(finalFilePath, buffer);

      dbIconPath = `/rewardCatIcon/${filename}`;

      // Delete old icon if exists
      if (oldIconPath) {
        try {
          const oldFilePath = path.join(
            process.cwd(),
            "public",
            "upload",
            oldIconPath
          );
          await fs.unlink(oldFilePath);
        } catch (err) {
          console.log("Icon sebelumnya tidak ditemukan atau sudah dihapus");
        }
      }
    }

    let sql: string;
    let params: any[];
    if (iconFile && iconFile.size > 0) {
      sql = `
            UPDATE ms_reward_category
            SET category_name = ?, icon_path = ?
            WHERE id = ?
        `;
      params = [category_name, dbIconPath, category_id];
    } else {
      sql = `
            UPDATE ms_reward_category
            SET category_name = ?
            WHERE id = ?
        `;
      params = [category_name, category_id];
    }

    const result = (await query(sql, params)) as any;
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
        data: {
          category_id,
          category_name,
          icon_path: dbIconPath,
        },
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
