import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const {
      id,
      first_name,
      last_name,
      email,
      password,
      phone_number,
      address,
      license_number,
      id_card_number,
      is_verified,
      is_available,
      assigned_vehicle_id,
      notes,
    } = await req.json();

    if (!id || !first_name || !email) {
      return NextResponse.json(
        { error: "ID, first name, and email are required" },
        { status: 400 }
      );
    }

    // Check if email exists for another user
    const existingUser = await query(
      "SELECT id FROM ms_users WHERE email = ? AND id != ?",
      [email, id]
    );

    if (existingUser.length > 0) {
      return NextResponse.json(
        {
          error: "Email already exists",
          detail: "This email is already registered to another user",
        },
        { status: 409 }
      );
    }

    // Update ms_users
    let userSql: string;
    let userParams: any[];

    if (password && password.trim() !== "") {
      // Update with new password
      const hashedPassword = await bcrypt.hash(password, 10);
      userSql = `
        UPDATE ms_users
        SET first_name = ?, last_name = ?, email = ?, password = ?, phone_number = ?, address = ?
        WHERE id = ?
      `;
      userParams = [
        first_name,
        last_name || null,
        email,
        hashedPassword,
        phone_number || null,
        address || null,
        id,
      ];
    } else {
      // Update without changing password
      userSql = `
        UPDATE ms_users
        SET first_name = ?, last_name = ?, email = ?, phone_number = ?, address = ?
        WHERE id = ?
      `;
      userParams = [
        first_name,
        last_name || null,
        email,
        phone_number || null,
        address || null,
        id,
      ];
    }

    await query(userSql, userParams);

    // Update ms_driver
    const driverSql = `
      INSERT INTO ms_driver (
        user_id,
        license_number,
        id_card_number,
        is_verified,
        is_available,
        assigned_vehicle_id,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        license_number = VALUES(license_number),
        id_card_number = VALUES(id_card_number),
        is_verified = VALUES(is_verified),
        is_available = VALUES(is_available),
        assigned_vehicle_id = VALUES(assigned_vehicle_id),
        notes = VALUES(notes)
    `;

    await query(driverSql, [
      id,
      license_number || null,
      id_card_number || null,
      is_verified !== undefined ? is_verified : false,
      is_available !== undefined ? is_available : true,
      assigned_vehicle_id || null,
      notes || null,
    ]);

    return NextResponse.json(
      {
        message: "SUCCESS",
        detail: "Driver updated successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating driver:", error);
    return NextResponse.json(
      { error: "Failed to update driver", detail: error.message },
      { status: 500 }
    );
  }
}
