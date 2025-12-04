import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { id, vehicle_name, max_weight } = await req.json();

    if (!id || !vehicle_name) {
      return NextResponse.json(
        { error: "ID and vehicle name are required" },
        { status: 400 }
      );
    }

    const sql = `
      UPDATE ms_vehicle
      SET vehicle_name = ?, max_weight = ?
      WHERE id = ?
    `;

    await query(sql, [vehicle_name, max_weight || null, id]);

    return NextResponse.json(
      {
        message: "SUCCESS",
        detail: "Vehicle updated successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating vehicle:", error);
    return NextResponse.json(
      { error: "Failed to update vehicle", detail: error.message },
      { status: 500 }
    );
  }
}
