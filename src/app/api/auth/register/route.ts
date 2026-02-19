import { NextResponse } from "next/server";
import { getPool, query } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const pool = await getPool();
  const connection = await pool.getConnection();

  try {
    const { first_name, last_name, email, password, phone_number, role } = await req.json();

    console.log("📥 Received Registration Request:", {
      first_name,
      last_name,
      email,
      phone_number,
      role,
    });

    if (!first_name || !last_name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Start Transaction
    await connection.beginTransaction();

    // 1. Check if user already exists
    const [existingUsers] = await connection.query(
      "SELECT id FROM ms_user WHERE email = ? LIMIT 1",
      [email]
    ) as any[];

    if (existingUsers.length > 0) {
      await connection.rollback();
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // 2. Validate Role
    // Normalize role name to match "Customer" or "Driver" in DB (seed data)
    const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    const [roles] = await connection.query(
      "SELECT id FROM ms_role WHERE role_name = ? LIMIT 1",
      [normalizedRole]
    ) as any[];

    if (roles.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { error: `Invalid role name: ${role}` },
        { status: 400 }
      );
    }

    const role_id = roles[0].id;

    // 3. Hash Password
    const hashed = await bcrypt.hash(password, 10);

    // 4. Insert User
    // Default tier_list_id = 1 (Sprout)
    const insertUserSql = `
      INSERT INTO ms_user (role_id, provider, first_name, last_name, email, password, phone_number, tier_list_id) 
      VALUES (?, 'local', ?, ?, ?, ?, ?, 1)
    `;
    const [insertUserResult] = await connection.query(insertUserSql, [
      role_id,
      first_name,
      last_name,
      email,
      hashed,
      phone_number || null,
    ]) as any;

    const newUserId = insertUserResult.insertId;

    // 5. If role is Driver, insert into ms_driver
    if (normalizedRole === "Driver") {
      const insertDriverSql = `INSERT INTO ms_driver (user_id, is_verified, is_available) VALUES (?, false, false)`;
      await connection.query(insertDriverSql, [newUserId]);
      console.log("🚚 Created driver record for:", email);
    }

    // Commit Transaction
    await connection.commit();
    console.log("✅ Successfully registered:", email);

    return NextResponse.json({ ok: true }, { status: 201 });

  } catch (err: any) {
    if (connection) await connection.rollback();
    console.error("❌ Error in /auth/register:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}
