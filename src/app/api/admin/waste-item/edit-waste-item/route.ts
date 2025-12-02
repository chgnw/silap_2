import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import path from "path";
import fs from "fs/promises";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const id = formData.get('id');
    const waste_item_name = formData.get('waste_item_name');
    const waste_category_id = formData.get('waste_category_id');
    const unit = formData.get('unit');
    const points_per_unit = formData.get('points_per_unit');
    const imageFile = formData.get('image') as File | null;

    if (!id || !waste_item_name || !waste_category_id || !unit || !points_per_unit) {
      return NextResponse.json({ 
        message: "Fields not complete!" 
      }, { status: 400 });
    }

    let dataToUpdate: any = {
      waste_item_name: waste_item_name.toString(),
      waste_category_id: parseInt(waste_category_id.toString()),
      unit: unit.toString(),
      points_per_unit: parseFloat(points_per_unit.toString()),
    };

    if (imageFile && imageFile.size > 0) {
      const uploadDir = path.join(process.cwd(), "public", "wasteItemIcon");
      await fs.mkdir(uploadDir, { recursive: true });

      const timestamp = Date.now();
      const originalName = imageFile.name.replaceAll(" ", "_");
      const filename = `${timestamp}_${originalName}`;

      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      await fs.writeFile(path.join(uploadDir, filename), buffer);

      dataToUpdate.image_url = `/wasteItemIcon/${filename}`;
    }

    const keys = Object.keys(dataToUpdate);
    const values = Object.values(dataToUpdate);

    const setClause = keys.map((key) => `${key} = ?`).join(", ");
    const sql = `
      UPDATE ms_waste_item
      SET ${setClause}
      WHERE id = ?
    `;

    const queryParams = [...values, id]; 
    const result = await query(sql, queryParams) as any;
    if(result.affectedRows == 0) {
      return NextResponse.json({
        message: "Failed Updating Item"
      }, { status: 200 });
    }
    
    return NextResponse.json({
      message: "Item Updated Successfully",
      data: dataToUpdate
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating item:", error);
    return NextResponse.json({ 
      message: "Internal Server Error", 
      error: error.message 
    }, { status: 500 });
  }
}