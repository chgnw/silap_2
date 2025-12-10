import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { query } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed" },
        { status: 400 }
      );
    }

    const maxSize = 3 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 3MB" },
        { status: 400 }
      );
    }

    const userSql = "SELECT id FROM ms_users WHERE email = ?";
    const users = (await query(userSql, [session.user.email])) as any[];

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = users[0].id;

    const uploadDir = join(process.cwd(), "public", "upload", "profilePicture");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const filename = `profile-${userId}-${timestamp}.${extension}`;
    const filepath = join(uploadDir, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    const profilePictureUrl = `/upload/profilePicture/${filename}`;
    const updateSql = "UPDATE ms_users SET profile_picture = ? WHERE id = ?";
    await query(updateSql, [profilePictureUrl, userId]);

    return NextResponse.json(
      {
        message: "SUCCESS",
        data: {
          profile_picture: profilePictureUrl,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error uploading profile picture:", error);
    return NextResponse.json(
      { error: "Failed to upload profile picture", detail: error.message },
      { status: 500 }
    );
  }
}
