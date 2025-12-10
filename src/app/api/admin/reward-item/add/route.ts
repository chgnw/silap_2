import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import path from "path";
import fs from "fs/promises";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const reward_name = formData.get("reward_name");
    const vendor_name = formData.get("vendor_name");
    const category_id = formData.get("category_id");
    const point_required = formData.get("point_required");
    const stock = formData.get("stock");
    const imageFile = formData.get("image") as File | null;

    if (!reward_name) {
      return NextResponse.json(
        {
          message: "FAILED",
          detail: "Nama reward tidak ditemukan!",
        },
        { status: 400 }
      );
    }
    if (!vendor_name) {
      return NextResponse.json(
        {
          message: "FAILED",
          detail: "Nama vendor tidak ditemukan!",
        },
        { status: 400 }
      );
    }
    if (!category_id) {
      return NextResponse.json(
        {
          message: "FAILED",
          detail: "Kategori tidak ditemukan!",
        },
        { status: 400 }
      );
    }
    if (!point_required) {
      return NextResponse.json(
        {
          message: "FAILED",
          detail: "Data poin tidak ditemukan!",
        },
        { status: 400 }
      );
    }
    if (!stock) {
      return NextResponse.json(
        {
          message: "FAILED",
          detail: "Data stock tidak ditemukan!",
        },
        { status: 400 }
      );
    }

    const checkSql = `
      SELECT id FROM ms_reward
      WHERE reward_name = ?
      LIMIT 1;
    `;
    const checkResult = (await query(checkSql, [reward_name])) as any[];

    if (checkResult && checkResult.length > 0) {
      return NextResponse.json(
        {
          message: "DUPLICATE",
          detail: `Reward '${reward_name}' sudah ada!`,
        },
        { status: 409 }
      );
    }

    let dbImagePath = null;
    if (imageFile && imageFile.size > 0) {
      const uploadDir = path.join(
        process.cwd(),
        "public",
        "upload",
        "rewardImages"
      );
      await fs.mkdir(uploadDir, { recursive: true });

      const timestamp = Date.now();
      const originalName = imageFile.name.replaceAll(" ", "_");
      const filename = `${timestamp}_${originalName}`;

      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const finalFilePath = path.join(uploadDir, filename);
      await fs.writeFile(finalFilePath, buffer);

      dbImagePath = `/rewardImages/${filename}`;
    }

    let sql: string;
    let params: any[];
    if (dbImagePath) {
      sql = `
        INSERT INTO ms_reward (category_id, reward_name, vendor_name, image_path, point_required, stock)
        VALUES (?, ?, ?, ?, ?, ?);
      `;
      params = [
        category_id,
        reward_name,
        vendor_name,
        dbImagePath,
        point_required,
        stock,
      ];
    } else {
      sql = `
        INSERT INTO ms_reward (category_id, reward_name, vendor_name, point_required, stock)
        VALUES (?, ?, ?, ?, ?);
      `;
      params = [category_id, reward_name, vendor_name, point_required, stock];
    }

    const result = (await query(sql, params)) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          message: "FAILED",
          detail: "Gagal memasukkan data reward baru!",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "SUCCESS",
        detail: "Data reward berhasil ditambahkan!",
        data: {
          reward_name,
          vendor_name,
          image_path: dbImagePath,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in /reward-item/add:", error);
    return NextResponse.json(
      {
        message: "FAILED",
        error: error,
      },
      { status: 500 }
    );
  }
}
