import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const email = formData.get("email") as string;
    if (!email) {
      return NextResponse.json(
        {
          message: "Email is required",
        },
        { status: 400 }
      );
    }

    let checkSql = `
            SELECT *
            FROM ms_user
            WHERE email = ? 
            LIMIT 1;
        `;
    const [userExists] = await query(checkSql, [email]);
    console.log("userExists: ", userExists);
    if (!userExists) {
      return NextResponse.json(
        {
          message: "Error checking user",
        },
        { status: 500 }
      );
    }

    const updateFields: { [key: string]: any } = {};
    const responseData: { [key: string]: any } = {};

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const address = formData.get("address") as string;
    const postalCode = formData.get("postalCode") as string;
    const province = formData.get("province") as string;
    const regency = formData.get("regency") as string;
    const subdistrict = formData.get("subdistrict") as string;
    const village = formData.get("village") as string;

    if (firstName !== null) {
      updateFields.first_name = firstName;
      responseData.first_name = firstName;
    }
    if (lastName !== null) {
      updateFields.last_name = lastName;
      responseData.last_name = lastName;
    }
    if (phoneNumber !== null) {
      updateFields.phone_number = phoneNumber;
      responseData.phone_number = phoneNumber;
    }
    if (address !== null) {
      updateFields.address = address;
      responseData.address = address;
    }
    if (postalCode !== null) {
      updateFields.postal_code = postalCode;
      responseData.postal_code = postalCode;
    }
    if (province !== null) {
      updateFields.province = province;
      responseData.province = province;
    }
    if (regency !== null) {
      updateFields.regency = regency;
      responseData.regency = regency;
    }
    if (subdistrict !== null) {
      updateFields.subdistrict = subdistrict;
      responseData.subdistrict = subdistrict;
    }
    if (village !== null) {
      updateFields.village = village;
      responseData.village = village;
    }

    let profilePictureUrl = userExists.profile_picture;
    const profilePictureFile = formData.get("profilePicture") as File | null;
    if (profilePictureFile && profilePictureFile.size > 0) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];

      if (!allowedTypes.includes(profilePictureFile.type)) {
        return NextResponse.json(
          { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed" },
          { status: 400 }
        );
      }

      const maxSize = 3 * 1024 * 1024;
      if (profilePictureFile.size > maxSize) {
        return NextResponse.json(
          { error: "File size too large. Maximum size is 3MB" },
          { status: 400 }
        );
      }

      const uploadDir = join(
        process.cwd(),
        "public",
        "upload",
        "profilePicture"
      );
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      const timestamp = Date.now();
      const extension = profilePictureFile.name.split(".").pop();
      const filename = `profile-${userExists.id}-${timestamp}.${extension}`;
      const filepath = join(uploadDir, filename);

      const bytes = await profilePictureFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      profilePictureUrl = `/upload/profilePicture/${filename}`;
      updateFields.profile_picture = profilePictureUrl;
      responseData.profile_picture = profilePictureUrl;
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        {
          updated: false,
          message: "No changes were made to the profile.",
        },
        { status: 200 }
      );
    }

    const setClause = Object.keys(updateFields)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updateFields);

    let updateSql = `
            UPDATE ms_user
            SET ${setClause}
            WHERE email = ?;
        `;

    const updateUser = (await query(updateSql, [...values, email])) as any;

    if (!updateUser || updateUser.affectedRows == 0) {
      return NextResponse.json(
        {
          message: "Error updating user",
        },
        { status: 500 }
      );
    }
    console.log("updateUser: ", updateUser);

    return NextResponse.json(
      {
        updated: true,
        message: "Profile updated successfully!",
        data: responseData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("error in /profile: ", error);
    return NextResponse.json(
      {
        message: "FAILED",
        error: error,
      },
      { status: 500 }
    );
  }
}
