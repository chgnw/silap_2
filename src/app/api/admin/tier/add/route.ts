import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const tier_name = formData.get("tier_name") as string;
    const min_weight = formData.get("min_weight") as string;
    const max_weight = formData.get("max_weight") as string;
    const target_weight = formData.get("target_weight") as string;
    const description = formData.get("description") as string;
    const file = formData.get("tier_icon") as File | null;

    if (!tier_name) {
      return NextResponse.json(
        { error: "Tier name is required" },
        { status: 400 }
      );
    }

    if (!min_weight) {      
      return NextResponse.json(
        { error: "Minimum weight is required" },
        { status: 400 }
      );
    }

    const checkSql = `
      SELECT id FROM ms_tier_list 
      WHERE tier_name = ?
    `;
    const existing = (await query(checkSql, [tier_name])) as any[];
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Tier with this name already exists" },
        { status: 409 }
      );
    }

    const minWeightNum = parseFloat(min_weight);
    const maxWeightNum = max_weight ? parseFloat(max_weight) : null;

    if (maxWeightNum !== null && maxWeightNum <= minWeightNum) {
      return NextResponse.json(
        { error: "Maximum weight must be greater than minimum weight" },
        { status: 400 }
      );
    }

    // Handle file upload
    let tierIconUrl: string | null = null;
    if (file && file.size > 0) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/svg+xml",
      ];

      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          {
            error:
              "Invalid file type. Only JPEG, PNG, WebP, and SVG are allowed",
          },
          { status: 400 }
        );
      }

      const maxSize = 3 * 1024 * 1024; // 3MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: "File size too large. Maximum size is 3MB" },
          { status: 400 }
        );
      }

      const uploadDir = join(process.cwd(), "public", "upload", "tierIcon");
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      const timestamp = Date.now();
      const extension = file.name.split(".").pop();
      const filename = `tier-icon-${timestamp}.${extension}`;
      const filepath = join(uploadDir, filename);

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      tierIconUrl = `/upload/tierIcon/${filename}`;
    }

    const sql = `
      INSERT INTO ms_tier_list 
      (tier_name, tier_icon, min_weight, max_weight, target_weight, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await query(sql, [
      tier_name,
      tierIconUrl,
      minWeightNum,
      maxWeightNum,
      target_weight ? parseFloat(target_weight) : null,
      description || null,
    ]);

    return NextResponse.json(
      {
        message: "SUCCESS",
        detail: "Tier added successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding tier:", error);
    return NextResponse.json(
      { error: "Failed to add tier", detail: error.message },
      { status: 500 }
    );
  }
}
