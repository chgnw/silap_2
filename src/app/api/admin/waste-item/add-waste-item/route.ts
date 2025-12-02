import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import path from "path";
import fs from "fs/promises";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const waste_item_name = formData.get('waste_item_name');
        const waste_category_id = formData.get('waste_category_id');
        const unit = formData.get('unit');
        const points_per_unit = formData.get('points_per_unit');
        const imageFile = formData.get('image') as File | null;

        if (!waste_item_name || !waste_category_id || !unit || !points_per_unit) {
            return NextResponse.json({ 
                message: "Data is not complete!" 
            }, { status: 400 });
        }
        let dbImagePath = null;
        
        if (imageFile && imageFile.size > 0) {
            const uploadDir = path.join(process.cwd(), "public", "wasteItemIcon");
            await fs.mkdir(uploadDir, { recursive: true });
            
            const originalName = imageFile.name.replaceAll(" ", "_");
            const filename = originalName;

            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const finalFilePath = path.join(uploadDir, filename);
            await fs.writeFile(finalFilePath, buffer);

            dbImagePath = `/wasteItemIcon/${filename}`;
        }

        const sql = `
            INSERT INTO ms_waste_item (waste_category_id, waste_item_name, unit, points_per_unit, image_url)
            VALUES (?, ?, ?, ?, ?);
        `
        const result = await query(sql, [
            waste_category_id, 
            waste_item_name, 
            unit, 
            points_per_unit,
            dbImagePath
        ]) as any;
        console.log("result add item: ", result);
        if(result.affectedRows == 0) {
            return NextResponse.json({
                message: "FAILED",
                detail: "Failed inserting new waste item"
            }, { status: 400 });
        }
        
        return NextResponse.json({
            message: "SUCCESS",
            detail: "New waste item added",
            data: {
                waste_categoru_id: waste_category_id,
                waste_item_name: waste_item_name,
                unit: unit,
                points_per_unit: points_per_unit,
                icon_name: dbImagePath
            }
        }, { status: 200 });
    } catch (error:any) {
        console.error("Error in /add-waste-item: ", error);
        return NextResponse.json({
            message: "FAILED",
            detail: "error in /add-waste-item",
            error: error
        }, { status: 500 });
    }
}