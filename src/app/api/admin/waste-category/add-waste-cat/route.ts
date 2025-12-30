import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import path from "path";
import fs from "fs/promises";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const wasteCategoryName = formData.get("waste_category_name");
    const unit = formData.get("unit");
    const pointsPerUnit = formData.get("point_per_unit");
    const imageFile = formData.get("image") as File | null;

    if (!wasteCategoryName || !unit || !pointsPerUnit) {
      return NextResponse.json(
        {
          message: "Category name, unit, and points per unit are required!",
        },
        { status: 400 }
      );
    }

    const checkSql = `
            SELECT id, is_active FROM ms_waste_category 
            WHERE LOWER(waste_category_name) = LOWER(?) 
            LIMIT 1;
        `;
    const checkResult = (await query(checkSql, [wasteCategoryName])) as any[];

    if (checkResult && checkResult.length > 0) {
      const existingCategory = checkResult[0];

      // If active category exists, return error
      if (existingCategory.is_active) {
        return NextResponse.json(
          {
            message: "DUPLICATE",
            detail: `Category '${wasteCategoryName}' sudah ada.`,
          },
          { status: 409 }
        );
      }

      // If inactive category exists, reactivate and update it
      let dbImagePath = null;
      if (imageFile && imageFile.size > 0) {
        const uploadDir = path.join(
          process.cwd(),
          "public",
          "upload",
          "wasteCatIcon"
        );
        await fs.mkdir(uploadDir, { recursive: true });

        const timestamp = Date.now();
        const originalName = imageFile.name.replaceAll(" ", "_");
        const filename = `${timestamp}_${originalName}`;

        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const finalFilePath = path.join(uploadDir, filename);
        await fs.writeFile(finalFilePath, buffer);

        dbImagePath = `/wasteCatIcon/${filename}`;
      }

      const updateSql = `
        UPDATE ms_waste_category 
        SET is_active = TRUE,
            waste_category_name = ?,
            icon_name = COALESCE(?, icon_name),
            unit = ?,
            point_per_unit = ?
        WHERE id = ?
      `;

      await query(updateSql, [
        wasteCategoryName,
        dbImagePath,
        unit,
        pointsPerUnit,
        existingCategory.id
      ]);
    } else {
      // No existing category, insert new one
      var dbImagePath = null;
      if (imageFile && imageFile.size > 0) {
        const uploadDir = path.join(
          process.cwd(),
          "public",
          "upload",
          "wasteCatIcon"
        );
        await fs.mkdir(uploadDir, { recursive: true });

        const timestamp = Date.now();
        const originalName = imageFile.name.replaceAll(" ", "_");
        const filename = `${timestamp}_${originalName}`;

        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const finalFilePath = path.join(uploadDir, filename);
        await fs.writeFile(finalFilePath, buffer);

        dbImagePath = `/wasteCatIcon/${filename}`;
      }

      const sql = `
          INSERT INTO ms_waste_category (waste_category_name, icon_name, unit, point_per_unit)
          VALUES (?, ?, ?, ?);
      `;
      const result = (await query(sql, [
        wasteCategoryName,
        dbImagePath,
        unit,
        pointsPerUnit,
      ])) as any;
      if (result.affectedRows == 0) {
        return NextResponse.json(
          {
            message: "FAILED",
            detail: "Gagal menambahkan kategori sampah!",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        message: "SUCCESS",
        detail: "Berhasil menambahkan kategori sampah!",
        data: {
          waste_category_name: wasteCategoryName,
          icon_name: dbImagePath,
          unit: unit,
          point_per_unit: pointsPerUnit,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error upload category:", error);
    return NextResponse.json(
      {
        message: "FAILED",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
