import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { vehicle_name, max_weight } = await req.json();

    if (!vehicle_name) {
      return NextResponse.json(
        { error: "Vehicle name is required" },
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO ms_vehicle (vehicle_name, max_weight)
      VALUES (?, ?)
    `;

    await query(sql, [vehicle_name, max_weight || null]);

    return NextResponse.json(
      {
        message: "SUCCESS",
        detail: "Vehicle added successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding vehicle:", error);
    return NextResponse.json(
      { error: "Failed to add vehicle", detail: error.message },
      { status: 500 }
    );
  }
}
