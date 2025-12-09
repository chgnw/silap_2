import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { vehicle_category_id, brand, model, license_plate, vin, status } =
      await req.json();

    if (!vehicle_category_id) {
      return NextResponse.json({
        message: "FAILED",
        detail: "Kategori kendaraan tidak boleh kosong!",
        },
        { status: 400 }
      );
    }

    if (vin && vin.length !== 17) {
      return NextResponse.json({
        message: "FAILED",
        detail: "VIN harus 17 karakter!",
      },{ status: 400 });
    }

    if (license_plate || vin) {
      const checkSql = `
        SELECT id FROM ms_vehicle 
        WHERE license_plate = ? OR vin = ?
      `;
      const existing = (await query(checkSql, [
        license_plate || "",
        vin || "",
      ])) as any[];
      if (existing.length > 0) {
        return NextResponse.json(
          { error: "Vehicle with this license plate or VIN already exists" },
          { status: 409 }
        );
      }
    }

    const sql = `
      INSERT INTO ms_vehicle 
      (vehicle_category_id, brand, model, license_plate, vin, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await query(sql, [
      vehicle_category_id,
      brand || null,
      model || null,
      license_plate || null,
      vin || null,
      status || "available",
    ]);

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
