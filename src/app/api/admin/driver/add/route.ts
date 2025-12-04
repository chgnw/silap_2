import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      phone_number,
      address,
      license_number,
      id_card_number,
      is_verified,
      assigned_vehicle_id,
      notes,
    } = await req.json();

    if (!first_name || !email || !password) {
      return NextResponse.json(
        { error: "First name, email, and password are required" },
        { status: 400 }
      );
    }

    const checkUserSql = "SELECT id FROM ms_users WHERE email = ?";
    const existingUser = await query(checkUserSql, [email]);
    if (existingUser.length > 0) {
      return NextResponse.json(
        {
          error: "Email already exists",
          detail: "This email is already registered",
        },
        { status: 409 }
      );
    }

    const roleSql = "SELECT id FROM ms_role WHERE role_name = ?";
    const roleResult = await query(roleSql, ["driver"]);
    if (roleResult.length === 0) {
      return NextResponse.json(
        { error: "Driver role not found" },
        { status: 500 }
      );
    }

    const role_id = roleResult[0].id;
    const hashedPassword = await bcrypt.hash(password, 10);

    const userSql = `
      INSERT INTO ms_users (role_id, provider, first_name, last_name, email, password, phone_number, address)
      VALUES (?, 'local', ?, ?, ?, ?, ?, ?)
    `;

    const userResult = (await query(userSql, [
      role_id,
      first_name,
      last_name || null,
      email,
      hashedPassword,
      phone_number || null,
      address || null,
    ])) as any;

    const newUserId = userResult.insertId;

    // Insert into ms_driver
    const driverSql = `
      INSERT INTO ms_driver (
        user_id, 
        license_number, 
        id_card_number, 
        is_verified, 
        is_available,
        assigned_vehicle_id,
        notes
      )
      VALUES (?, ?, ?, ?, true, ?, ?)
    `;

    await query(driverSql, [
      newUserId,
      license_number || null,
      id_card_number || null,
      is_verified || false,
      assigned_vehicle_id || null,
      notes || null,
    ]);

    return NextResponse.json(
      {
        message: "SUCCESS",
        detail: "Driver added successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding driver:", error);
    return NextResponse.json(
      { error: "Failed to add driver", detail: error.message },
      { status: 500 }
    );
  }
}
