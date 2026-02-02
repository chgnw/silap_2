import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { id, id_card_number, license_number, is_verified } =
      await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Driver ID is required" },
        { status: 400 }
      );
    }

    // Get existing driver data
    const existingDriverResult = (await query(
      "SELECT id, is_verified, assigned_vehicle_id FROM ms_driver WHERE id = ? AND is_deleted = FALSE",
      [id]
    )) as any[];

    if (existingDriverResult.length === 0) {
      return NextResponse.json(
        {
          error: "Driver not found",
          detail: "The specified driver does not exist",
        },
        { status: 404 }
      );
    }

    const existingDriver = existingDriverResult[0];
    const wasVerified = existingDriver.is_verified === 1;
    const isBeingUnverified = wasVerified && !is_verified;

    // Validate: if is_verified is true, both id_card_number and license_number must be provided
    if (is_verified && (!id_card_number || !license_number)) {
      return NextResponse.json(
        {
          error: "Verification requires complete data",
          detail:
            "Both ID Card Number (KTP) and License Number (SIM) are required to verify a driver",
        },
        { status: 400 }
      );
    }

    // If un-verifying, check for active orders
    if (isBeingUnverified) {
      // Check if driver has any active pickups (status: Pending=1, Accepted=2, Processing=3)
      const activePickupsSql = `
        SELECT COUNT(*) as count
        FROM tr_pickup tp
        WHERE tp.driver_id = ?
          AND tp.transaction_status_id IN (1, 2, 3)
      `;
      const activePickupsResult = (await query(activePickupsSql, [
        id,
      ])) as any[];
      const activePickupsCount = activePickupsResult[0]?.count || 0;

      if (activePickupsCount > 0) {
        return NextResponse.json(
          {
            error: "Driver has active orders",
            detail: `Driver masih memiliki ${activePickupsCount} order aktif. Driver harus menyelesaikan semua order terlebih dahulu sebelum bisa di-unverify.`,
          },
          { status: 400 }
        );
      }

      // No active orders, proceed to reset driver data
      // Release assigned vehicle (set status back to inactive)
      if (existingDriver.assigned_vehicle_id) {
        await query("UPDATE ms_vehicle SET status = 'inactive' WHERE id = ?", [
          existingDriver.assigned_vehicle_id,
        ]);
      }

      // Reset driver data: unverify, set unavailable, remove assigned vehicle, reset operational area
      const resetDriverSql = `
        UPDATE ms_driver
        SET 
          id_card_number = ?,
          license_number = ?,
          is_verified = 0,
          is_available = 0,
          assigned_vehicle_id = NULL,
          operational_area = NULL
        WHERE id = ?
      `;

      await query(resetDriverSql, [
        id_card_number || null,
        license_number || null,
        id,
      ]);

      return NextResponse.json(
        {
          message: "SUCCESS",
          detail:
            "Driver berhasil di-unverify. Status, kendaraan, dan area operasional telah direset.",
          reset: true,
        },
        { status: 200 }
      );
    }

    // Normal update (not un-verifying)
    const driverSql = `
      UPDATE ms_driver
      SET 
        id_card_number = ?,
        license_number = ?,
        is_verified = ?
      WHERE id = ?
    `;

    await query(driverSql, [
      id_card_number || null,
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
