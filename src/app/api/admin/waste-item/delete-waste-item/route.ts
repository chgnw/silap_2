import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import path from "path";
import fs from "fs/promises";

export async function POST (req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ 
        message: "ID is required" 
      }, { status: 400 });
    }

    const checkSql = "SELECT * FROM ms_waste_item WHERE id = ? LIMIT 1";
    const existingData = await query(checkSql, [id]) as any[];
    if (existingData.length === 0) {
      return NextResponse.json({ 
        message: "Item not found" 
      }, { status: 404 });
    }

    const imageUrl = existingData[0].image_url;
    if (imageUrl) {
      const filePath = path.join(process.cwd(), "public", imageUrl);
      
      try {
        await fs.unlink(filePath);
        console.log("File deleted:", filePath);
      } catch (err) {
        console.warn("Gagal hapus file (mungkin file sudah hilang manual):", err);
      }
    }

    const deleteSql = "DELETE FROM ms_waste_item WHERE id = ?";
    await query(deleteSql, [id]);

    return NextResponse.json({ 
      message: "Deleted successfully" 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error deleting item:", error);
    return NextResponse.json({ 
      message: "Internal Server Error", 
      error: error.message 
    }, { status: 500 });
  }
}