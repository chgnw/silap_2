import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const {
      id,
      vehicle_name,
      brand,
      model,
      license_plate,
      vin,
      max_weight,
      status,
    } = await req.json();

    if (!id || !vehicle_name) {
      return NextResponse.json(
        { error: "ID and vehicle name are required" },
        { status: 400 }
      );
    }

    if (license_plate || vin) {
      const checkSql = `
        SELECT id FROM ms_vehicle 
        WHERE (license_plate = ? OR vin = ?) AND id != ?
      `;
      const existing = (await query(checkSql, [
        license_plate || "",
        vin || "",
        id,
      ])) as any[];

      if (existing.length > 0) {
        return NextResponse.json(
          {
            error:
              "Another vehicle with this license plate or VIN already exists",
          },
          { status: 409 }
        );
      }
    }

    const sql = `
      UPDATE ms_vehicle
      SET 
        vehicle_name = ?, 
        brand = ?, 
        model = ?, 
        license_plate = ?, 
        vin = ?, 
        max_weight = ?,
        status = ?
      WHERE id = ?
    `;

    await query(sql, [
      vehicle_name,
      brand || null,
      model || null,
      license_plate || null,
      vin || null,
      max_weight || null,
      status || "available",
      id,
    ]);

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
