import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { vehicle_category_id, brand, model, license_plate, vin, status } =
      await req.json();

    if (!vehicle_category_id) {
      return NextResponse.json(
        {
          message: "FAILED",
          detail: "Kategori kendaraan tidak boleh kosong!",
        },
        { status: 400 }
      );
    }

    if (vin) {
      if (vin.length !== 17) {
        return NextResponse.json(
          {
            message: "FAILED",
            detail: "VIN harus 17 karakter!",
          },
          { status: 400 }
        );
      }
      if (/[IOQioq]/.test(vin)) {
        return NextResponse.json(
          {
            message: "FAILED",
            detail: "VIN tidak boleh mengandung huruf I, O, atau Q!",
          },
          { status: 400 }
        );
      }
    }

    if (license_plate || vin) {
      const checkSql = `
        SELECT id, is_active FROM ms_vehicle 
        WHERE LOWER(license_plate) = LOWER(?) OR LOWER(vin) = LOWER(?)
      `;
      const existing = (await query(checkSql, [
        license_plate || "",
        vin || "",
      ])) as any[];

      if (existing.length > 0) {
        const existingVehicle = existing[0];

        // If active vehicle exists, return error
        if (existingVehicle.is_active) {
          return NextResponse.json(
            { error: "Vehicle with this license plate or VIN already exists" },
            { status: 409 }
          );
        }

        // If inactive vehicle exists, reactivate and update it
        const updateSql = `
          UPDATE ms_vehicle 
          SET is_active = TRUE,
              vehicle_category_id = ?,
              brand = ?,
              model = ?,
              license_plate = ?,
              vin = ?,
              status = ?
          WHERE id = ?
        `;

        await query(updateSql, [
          vehicle_category_id,
          brand || null,
          model || null,
          license_plate || null,
          vin || null,
          status || "active",
          existingVehicle.id
        ]);

        return NextResponse.json(
          {
            message: "SUCCESS",
            detail: "Vehicle reactivated successfully",
          },
          { status: 200 }
        );
      }
    }

    // No existing vehicle, insert new one
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
      status || "active",
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
