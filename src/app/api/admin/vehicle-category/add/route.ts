import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const category_name = formData.get("category_name") as string;
    const min_weight = formData.get("min_weight") as string;
    const max_weight = formData.get("max_weight") as string;
    const description = formData.get("description") as string;
    const imageFile = formData.get("image") as File | null;

    if (!category_name) {
      return NextResponse.json(
        { error: "Nama kategori tidak boleh kosong!" },
        { status: 400 }
      );
    }

    // Check if category name already exists
    const checkSql = `
      SELECT id FROM ms_vehicle_category 
      WHERE category_name = ?
    `;
    const existing = (await query(checkSql, [category_name])) as any[];
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 409 }
      );
    }

    // Handle image upload
    let imagePath: string | null = null;
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create unique filename
      const ext = imageFile.name.split(".").pop();
      const filename = `${Date.now()}-${category_name.replace(/\s+/g, "-").toLowerCase()}.${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "upload", "vehicle-category");

      // Ensure directory exists
      await mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);

      imagePath = `/upload/vehicle-category/${filename}`;
    }

    const sql = `
      INSERT INTO ms_vehicle_category 
      (category_name, min_weight, max_weight, description, image_path)
      VALUES (?, ?, ?, ?, ?)
    `;

    await query(sql, [
      category_name,
      min_weight ? parseFloat(min_weight) : 0,
      max_weight ? parseFloat(max_weight) : null,
      description || null,
      imagePath,
    ]);

    return NextResponse.json(
      {
        message: "SUCCESS",
        detail: "Vehicle category added successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding vehicle category:", error);
    return NextResponse.json(
      { error: "Failed to add vehicle category", detail: error.message },
      { status: 500 }
    );
  }
}
