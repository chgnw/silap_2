import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { id, first_name, last_name, phone_number, address } =
      await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Admin ID is required" },
        { status: 400 }
      );
    }

    if (!first_name) {
      return NextResponse.json(
        { error: "First name is required" },
        { status: 400 }
      );
    }

    const checkSql = `
      SELECT id, role_id FROM ms_users 
      WHERE id = ? AND role_id = 3
    `;
    const existing = (await query(checkSql, [id])) as any[];
    if (existing.length === 0) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const sql = `
      UPDATE ms_users 
      SET first_name = ?, 
          last_name = ?, 
          phone_number = ?, 
          address = ?
      WHERE id = ? AND role_id = 3
    `;

    await query(sql, [
      first_name,
      last_name || null,
      phone_number || null,
      address || null,
      id,
    ]);

    return NextResponse.json(
      {
        message: "SUCCESS",
        detail: "Profile updated successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating admin:", error);
    return NextResponse.json(
      { error: "Failed to update admin", detail: error.message },
      { status: 500 }
    );
  }
}
