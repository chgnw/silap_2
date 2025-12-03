import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import path from "path";
import fs from "fs/promises";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const id = formData.get('id');
    const reward_name = formData.get('reward_name');
    const vendor_name = formData.get('vendor_name');
    const category_id = formData.get('category_id');
    const points_required = formData.get('points_required');
    const stock = formData.get('stock');
    const imageFile = formData.get('image') as File | null;

    if (!id) {
      return NextResponse.json({
        message: "FAILED",
        detail: "ID tidak ditemukan!"
      }, { status: 400 });
    }

    const existingSql = `
      SELECT id, image_path FROM ms_rewards
      WHERE id = ?
      LIMIT 1;
    `;
    const existingResult = await query(existingSql, [id]) as any[];
    
    if (!existingResult || existingResult.length === 0) {
      return NextResponse.json({
        message: "FAILED",
        detail: "Reward tidak ditemukan!"
      }, { status: 404 });
    }

    const oldImagePath = existingResult[0].image_path;

    const checkSql = `
      SELECT id FROM ms_rewards
      WHERE reward_name = ? AND id != ?
      LIMIT 1;
    `;
    const checkResult = await query(checkSql, [reward_name, id]) as any[];
    
    if (checkResult && checkResult.length > 0) {
      return NextResponse.json({
        message: "DUPLICATE",
        detail: `Reward '${reward_name}' sudah ada!`
      }, { status: 409 });
    }

    let dbImagePath = oldImagePath;
    
    if (imageFile && imageFile.size > 0) {
      const uploadDir = path.join(process.cwd(), "public", "upload", "rewardImages");
      await fs.mkdir(uploadDir, { recursive: true });
      
      const timestamp = Date.now();
      const originalName = imageFile.name.replaceAll(" ", "_");
      const filename = `${timestamp}_${originalName}`;
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const finalFilePath = path.join(uploadDir, filename);
      await fs.writeFile(finalFilePath, buffer);
      
      dbImagePath = `/rewardImages/${filename}`;
      
      if (oldImagePath) {
        try {
          const oldFilePath = path.join(process.cwd(), "public", "upload", oldImagePath);
          await fs.unlink(oldFilePath);
        } catch (err) {
          console.log("Logo sebelumnya tidak ditemukan atau sudah dihapus");
        }
      }
    }

    let sql: string;
    let params: any[];
    if (imageFile && imageFile.size > 0) {
      sql = `
        UPDATE ms_rewards 
        SET category_id = ?, reward_name = ?, vendor_name = ?, 
            image_path = ?, points_required = ?, stock = ?
        WHERE id = ?;
      `;
      params = [category_id, reward_name, vendor_name, dbImagePath, points_required, stock, id];
    } else {
      sql = `
        UPDATE ms_rewards 
        SET category_id = ?, reward_name = ?, vendor_name = ?, 
            points_required = ?, stock = ?
        WHERE id = ?;
      `;
      params = [category_id, reward_name, vendor_name, points_required, stock, id];
    }

    const result = await query(sql, params) as any;
    if (result.affectedRows === 0) {
      return NextResponse.json({
        message: "FAILED",
        detail: "Gagal memperbaharui data reward!"
      }, { status: 400 });
    }

    return NextResponse.json({
      message: "SUCCESS",
      detail: "Berhasil memperbaharui data reward!",
      data: {
        id,
        reward_name,
        vendor_name,
        image_path: dbImagePath
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error in /reward-item/update:", error);
    return NextResponse.json({
      message: "FAILED",
      error: error.message
    }, { status: 500 });
  }
}