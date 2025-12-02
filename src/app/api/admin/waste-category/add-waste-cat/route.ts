import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import path from "path";
import fs from "fs/promises";

export async function POST (req: NextRequest) {
    try {
        const formData = await req.formData();
        const wasteCategoryName = formData.get('waste_category_name');
        const imageFile = formData.get('image') as File | null;

        if (!wasteCategoryName) {
            return NextResponse.json({ 
                message: "Category name is required" 
            }, { status: 400 });
        }
        let dbImagePath = null;

        if (imageFile && imageFile.size > 0) {
            const uploadDir = path.join(process.cwd(), "public", "wasteCatIcon");
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
            INSERT INTO ms_waste_category (waste_category_name, icon_name)
            VALUES (?, ?);
        `
        const result = await query(sql, [wasteCategoryName, dbImagePath]) as any;
        if(result.affectedRows == 0) {
            return NextResponse.json({
                message: "FAILED",
                detail: "Failed inserting new waste category"
            }, { status: 400 });
        }
        
        return NextResponse.json({
            message: "SUCCESS",
            detail: "New waste category added",
            data: {
                waste_category_name: wasteCategoryName,
                icon_name: dbImagePath
            }
        }, { status: 200 });
    } catch (error: any) {
        console.error("Error upload category:", error);
        return NextResponse.json({
            message: "FAILED",
            error: error.message
        }, { status: 500 });
    }
}