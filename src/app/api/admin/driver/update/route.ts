import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { id, license_number, is_verified } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Driver ID is required" },
        { status: 400 }
      );
    }

    const existingDriver = await query(
      "SELECT id FROM ms_driver WHERE id = ?",
      [id]
    );

    if (existingDriver.length === 0) {
      return NextResponse.json(
        {
          error: "Driver not found",
          detail: "The specified driver does not exist",
        },
        { status: 404 }
      );
    }

    // Update ms_driver
    const driverSql = `
      UPDATE ms_driver
      SET 
        license_number = ?,
        is_verified = ?
      WHERE id = ?
    `;

    await query(driverSql, [
      license_number || null,
      is_verified !== undefined ? is_verified : false,
      id,
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
