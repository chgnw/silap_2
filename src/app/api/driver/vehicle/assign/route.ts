import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vehicle_id } = await req.json();

    if (!vehicle_id) {
      return NextResponse.json(
        { error: "Vehicle ID is required" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Check if vehicle is available
    const checkVehicleSql = `
      SELECT id, status FROM ms_vehicle 
      WHERE id = ? AND status = 'available'
    `;
    const vehicleCheck = (await query(checkVehicleSql, [vehicle_id])) as any[];

    if (vehicleCheck.length === 0) {
      return NextResponse.json(
        { error: "Vehicle not available" },
        { status: 400 }
      );
    }

    // Check if driver exists
    const checkDriverSql = `
      SELECT id, assigned_vehicle_id FROM ms_driver 
      WHERE user_id = ?
    `;
    const driverCheck = (await query(checkDriverSql, [userId])) as any[];

    if (driverCheck.length === 0) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    const driver = driverCheck[0];

    // If driver has assigned vehicle, unassign it first
    if (driver.assigned_vehicle_id) {
      await query(`UPDATE ms_vehicle SET status = 'available' WHERE id = ?`, [
        driver.assigned_vehicle_id,
      ]);
    }

    // Assign new vehicle
    await query(
      `UPDATE ms_driver SET assigned_vehicle_id = ?, is_available = TRUE WHERE user_id = ?`,
      [vehicle_id, userId]
    );

    // Update vehicle status to in_use
    await query(`UPDATE ms_vehicle SET status = 'in_use' WHERE id = ?`, [
      vehicle_id,
    ]);

    return NextResponse.json(
      {
        message: "SUCCESS",
        detail: "Vehicle assigned successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error assigning vehicle:", error);
    return NextResponse.json(
      { error: "Failed to assign vehicle", detail: error.message },
      { status: 500 }
    );
  }
}
