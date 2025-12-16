import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const checkSql = `
      SELECT id, role_id, first_name, last_name, email 
      FROM ms_user 
      WHERE email = ?
    `;
    const existing = (await query(checkSql, [email])) as any[];

    if (existing.length === 0) {
      return NextResponse.json(
        {
          error: "Email tidak ditemukan. Silahkan registrasi terlebih dahulu.",
        },
        { status: 404 }
      );
    }

    const user = existing[0];

    if (user.role_id === 1) {
      return NextResponse.json(
        { error: "This user is already an admin" },
        { status: 409 }
      );
    }

    const updateSql = `
      UPDATE ms_user 
      SET role_id = 1
      WHERE id = ?
    `;

    await query(updateSql, [user.id]);

    return NextResponse.json(
      {
        message: "SUCCESS",
        detail: `${user.first_name} ${
          user.last_name || ""
        } berhasil dijadikan admin`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error adding admin:", error);
    return NextResponse.json(
      { error: "Failed to add admin", detail: error.message },
      { status: 500 }
    );
  }
}
