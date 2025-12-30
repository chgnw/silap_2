import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import path from "path";
import fs from "fs/promises";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const category_name = formData.get("category_name") as string;
    const iconFile = formData.get("icon") as File | null;

    if (!category_name) {
      return NextResponse.json(
        {
          message: "FAILED",
          detail: "Nama kategori tidak ditemukan!",
        },
        { status: 400 }
      );
    }

    const sqlCheck = `
            SELECT id, is_active FROM ms_reward_category
            WHERE LOWER(category_name) = LOWER(?)
        `;
    const resultCheck = (await query(sqlCheck, [category_name])) as any;

    if (resultCheck.length > 0) {
      const existingCategory = resultCheck[0];

      // If active category exists, return error
      if (existingCategory.is_active) {
        return NextResponse.json(
          {
            message: "DUPLICATE",
            detail: `Category '${category_name}' sudah ada!`,
          },
          { status: 409 }
        );
      }

      // If inactive category exists, reactivate and update it
      // Handle icon file upload
      let dbIconPath = null;
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
      }

      const updateSql = `
        UPDATE ms_reward_category 
        SET is_active = TRUE,
            category_name = ?,
            icon_path = COALESCE(?, icon_path)
        WHERE id = ?
      `;

      await query(updateSql, [
        category_name,
        dbIconPath,
        existingCategory.id
      ]);
    } else {
      // No existing category, insert new one
      // Handle icon file upload
      var dbIconPath = null;
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
      }

      let sql: string;
      let params: any[];
      if (dbIconPath) {
        sql = `
            INSERT INTO ms_reward_category (category_name, icon_path)
            VALUES (?, ?)
        `;
        params = [category_name, dbIconPath];
      } else {
        sql = `
            INSERT INTO ms_reward_category (category_name)
            VALUE (?)
        `;
        params = [category_name];
      }

      const result = (await query(sql, params)) as any;
      if (result.affectedRows === 0) {
        return NextResponse.json(
          {
            message: "FAILED",
            detail: "Gagal menambahkan kategori baru",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        message: "SUCCESS",
        detail: "Berhasil menambahkan kategori baru",
        data: {
          category_name,
          icon_path: dbIconPath,
        },
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
