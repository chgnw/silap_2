import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const email = formData.get("email") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const address = formData.get("address") as string;
    const postalCode = formData.get("postalCode") as string;
    const province = formData.get("province") as string;
    const regency = formData.get("regency") as string;
    const subdistrict = formData.get("subdistrict") as string;
    const village = formData.get("village") as string;
    const profilePictureFile = formData.get("profilePicture") as File | null;

    console.log("req update user: ", { email, firstName, lastName });
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
            FROM ms_users
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

    let profilePictureUrl = userExists.profile_picture;
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
    }

    const addressDB = userExists.address ?? "";
    const hasChanges =
      userExists.first_name !== firstName ||
      userExists.last_name !== lastName ||
      userExists.phone_number !== phoneNumber ||
      addressDB !== address ||
      userExists.village !== village ||
      userExists.postal_code !== postalCode ||
      userExists.province !== province ||
      userExists.regency !== regency ||
      userExists.subdistrict !== subdistrict ||
      userExists.profile_picture !== profilePictureUrl;

    if (!hasChanges) {
      return NextResponse.json(
        {
          updated: false,
          message: "No changes were made to the profile.",
        },
        { status: 200 }
      );
    }

    let updateSql = `
            UPDATE ms_users
            SET 
                first_name = ?,
                last_name = ?,
                phone_number = ?,
                address = ?,
                postal_code = ?,
                province = ?,
                regency = ?,
                subdistrict = ?,
                village = ?,
                profile_picture = ?
            WHERE email = ?;
        `;
    const updateUser = (await query(updateSql, [
      firstName,
      lastName,
      phoneNumber,
      address,
      postalCode,
      province,
      regency,
      subdistrict,
      village,
      profilePictureUrl,
      email,
    ])) as any;
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
        data: {
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          address: address,
          postal_code: postalCode,
          province: province,
          regency: regency,
          subdistrict: subdistrict,
          village: village,
          profile_picture: profilePictureUrl,
        },
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
