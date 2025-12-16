import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const {
      id,
      vehicle_category_id,
      brand,
      model,
      license_plate,
      vin,
      status,
    } = await req.json();

    if (!id || !vehicle_category_id) {
      return NextResponse.json(
        {
          message: "FAILED",
          detail: "ID and vehicle category are required",
        },
        { status: 400 }
      );
    }

    if (vin && vin.length !== 17) {
      return NextResponse.json(
        {
          message: "FAILED",
          detail: "VIN harus 17 karakter!",
        },
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
        vehicle_category_id = ?, 
        brand = ?, 
        model = ?, 
        license_plate = ?, 
        vin = ?, 
        status = ?
      WHERE id = ?
    `;

    await query(sql, [
      vehicle_category_id,
      brand || null,
      model || null,
      license_plate || null,
      vin || null,
      status || "active",
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
