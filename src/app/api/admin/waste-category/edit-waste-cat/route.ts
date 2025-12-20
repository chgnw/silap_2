import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import path from "path";
import fs from "fs/promises";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const id = formData.get("id");
    const wasteCategoryName = formData.get("waste_category_name");
    const unit = formData.get("unit");
    const pointsPerUnit = formData.get("point_per_unit");
    const imageFile = formData.get("image") as File | null;

    if (!id || !wasteCategoryName || !unit || !pointsPerUnit) {
      return NextResponse.json(
        {
          message: "ID, Category Name, Unit, and Points per Unit are required",
        },
        { status: 400 }
      );
    }

    let dataToUpdate: any = {
      waste_category_name: wasteCategoryName.toString(),
      unit: unit.toString(),
      point_per_unit: parseFloat(pointsPerUnit.toString()),
    };

    if (imageFile && imageFile.size > 0) {
      const uploadDir = path.join(process.cwd(), "public", "upload" ,"wasteCatIcon");
      await fs.mkdir(uploadDir, { recursive: true });

      const timestamp = Date.now();
      const originalName = imageFile.name.replaceAll(" ", "_");
      const filename = `${timestamp}_${originalName}`;

      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      await fs.writeFile(path.join(uploadDir, filename), buffer);

      dataToUpdate.icon_name = `/wasteCatIcon/${filename}`;
    }

    const keys = Object.keys(dataToUpdate);
    const values = Object.values(dataToUpdate);

    const setClause = keys.map((key) => `${key} = ?`).join(", ");
    const sql = `
      UPDATE ms_waste_category
      SET ${setClause}
      WHERE id = ?
    `;

    const queryParams = [...values, id];
    const result = (await query(sql, queryParams)) as any;
    if (result.affectedRows == 0) {
      return NextResponse.json(
        {
          message: "Failed Updating Category",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        message: "Category Updated Successfully",
        data: dataToUpdate,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
