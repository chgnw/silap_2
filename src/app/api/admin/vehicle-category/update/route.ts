import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const id = formData.get("id") as string;
    const category_name = formData.get("category_name") as string;
    const min_weight = formData.get("min_weight") as string;
    const max_weight = formData.get("max_weight") as string;
    const description = formData.get("description") as string;
    const imageFile = formData.get("image") as File | null;

    if (!id || !category_name) {
      return NextResponse.json(
        { error: "ID and category name are required" },
        { status: 400 }
      );
    }

    // Check if another category with the same name exists
    const checkSql = `
      SELECT id FROM ms_vehicle_category 
      WHERE category_name = ? AND id != ?
    `;
    const existing = (await query(checkSql, [category_name, id])) as any[];

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Another category with this name already exists" },
        { status: 409 }
      );
    }

    // Handle image upload
    let imagePath: string | null = null;
    let shouldUpdateImage = false;

    if (imageFile && imageFile.size > 0) {
      // Get old image path to delete
      const oldImageSql = `SELECT image_path FROM ms_vehicle_category WHERE id = ?`;
      const oldResult = (await query(oldImageSql, [id])) as any[];
      const oldImagePath = oldResult[0]?.image_path;

      // Delete old image if exists
      if (oldImagePath) {
        try {
          const oldFilePath = path.join(process.cwd(), "public", oldImagePath);
          await unlink(oldFilePath);
        } catch (err) {
          console.log("Old image not found, skipping delete");
        }
      }

      // Save new image
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = imageFile.name.split(".").pop();
      const filename = `${Date.now()}-${category_name.replace(/\s+/g, "-").toLowerCase()}.${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "upload", "vehicle-category");

      await mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);

      imagePath = `/upload/vehicle-category/${filename}`;
      shouldUpdateImage = true;
    }

    // Build SQL based on whether image is being updated
    let sql: string;
    let params: any[];

    if (shouldUpdateImage) {
      sql = `
        UPDATE ms_vehicle_category
        SET 
          category_name = ?, 
          min_weight = ?, 
          max_weight = ?, 
          description = ?,
          image_path = ?
        WHERE id = ?
      `;
      params = [
        category_name,
        min_weight ? parseFloat(min_weight) : 0,
        max_weight ? parseFloat(max_weight) : null,
        description || null,
        imagePath,
        id,
      ];
    } else {
      sql = `
        UPDATE ms_vehicle_category
        SET 
          category_name = ?, 
          min_weight = ?, 
          max_weight = ?, 
          description = ?
        WHERE id = ?
      `;
      params = [
        category_name,
        min_weight ? parseFloat(min_weight) : 0,
        max_weight ? parseFloat(max_weight) : null,
        description || null,
        id,
      ];
    }

    await query(sql, params);

    return NextResponse.json(
      {
        message: "SUCCESS",
        detail: "Vehicle category updated successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating vehicle category:", error);
    return NextResponse.json(
      { error: "Failed to update vehicle category", detail: error.message },
      { status: 500 }
    );
  }
}
