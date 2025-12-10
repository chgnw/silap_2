import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Admin ID is required" },
        { status: 400 }
      );
    }

    const checkSql = `
      SELECT id, role_id FROM ms_user 
      WHERE id = ? AND role_id = 1
    `;
    const existing = (await query(checkSql, [id])) as any[];
    if (existing.length === 0) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const sql = `
      UPDATE ms_user SET role_id = 2 WHERE id = ?
    `;
    await query(sql, [id]);

    return NextResponse.json(
      {
        message: "SUCCESS",
        detail: "Admin deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting admin:", error);
    return NextResponse.json(
      { error: "Failed to delete admin", detail: error.message },
      { status: 500 }
    );
  }
}
