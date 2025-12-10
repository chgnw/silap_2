import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Tier ID is required" },
        { status: 400 }
      );
    }

    const sql = `DELETE FROM ms_tier_list WHERE id = ?`;
    await query(sql, [id]);

    return NextResponse.json(
      {
        message: "SUCCESS",
        detail: "Tier deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting tier:", error);
    return NextResponse.json(
      { error: "Failed to delete tier", detail: error.message },
      { status: 500 }
    );
  }
}
