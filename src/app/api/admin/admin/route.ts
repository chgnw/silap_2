import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const sql = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone_number,
        u.address,
        u.created_at,
        u.updated_at,
        r.role_name
      FROM ms_users u
      JOIN ms_role r ON u.role_id = r.id
      WHERE u.role_id = 3
      ORDER BY u.created_at DESC
    `;

    const admins = await query(sql);

    return NextResponse.json(
      {
        message: "SUCCESS",
        data: admins,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching admins:", error);
    return NextResponse.json(
      { error: "Failed to fetch admins", detail: error.message },
      { status: 500 }
    );
  }
}
