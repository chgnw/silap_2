import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Vehicle ID is required" },
        { status: 400 }
      );
    }

    const sql = `DELETE FROM ms_vehicle WHERE id = ?`;

    await query(sql, [id]);

    return NextResponse.json(
      {
        message: "SUCCESS",
        detail: "Vehicle deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting vehicle:", error);
    return NextResponse.json(
      { error: "Failed to delete vehicle", detail: error.message },
      { status: 500 }
    );
  }
}
