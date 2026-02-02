import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        {
          error: "Driver ID is required",
        },
        { status: 400 }
      );
    }

    const driverCheckSql = `
      SELECT user_id 
      FROM ms_driver
      WHERE id = ? AND is_deleted = FALSE
    `;
    const driverCheck = await query(driverCheckSql, [id]);
    if (driverCheck.length === 0) {
      return NextResponse.json(
        {
          error: "Driver not found",
        },
        { status: 404 }
      );
    }

    const userId = driverCheck[0].user_id;

    // Soft delete: set is_deleted = TRUE instead of hard delete
    await query("UPDATE ms_driver SET is_deleted = TRUE WHERE id = ?", [id]);

    return NextResponse.json({
      message: "SUCCESS",
      detail: "Driver deleted successfully",
    }, { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting driver:", error);
    return NextResponse.json({
      error: "Failed to delete driver", detail: error.message
    }, { status: 500 }
    );
  }
}
