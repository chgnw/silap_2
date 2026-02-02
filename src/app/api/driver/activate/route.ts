import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { vehicle_id, activate } = body;

    const userSql = "SELECT id FROM ms_user WHERE email = ?";
    const users = (await query(userSql, [session.user.email])) as any[];

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = users[0].id;

    const checkDriverSql = "SELECT id FROM ms_driver WHERE user_id = ? AND is_deleted = FALSE";
    const drivers = (await query(checkDriverSql, [userId])) as any[];

    if (drivers.length === 0) {
      return NextResponse.json(
        { error: "Driver record not found" },
        { status: 404 }
      );
    }

    if (activate) {
      if (!vehicle_id) {
        return NextResponse.json(
          { error: "Vehicle ID is required" },
          { status: 400 }
        );
      }

      const vehicleSql = "SELECT status FROM ms_vehicle WHERE id = ?";
      const vehicles = (await query(vehicleSql, [vehicle_id])) as any[];

      if (vehicles.length === 0) {
        return NextResponse.json(
          { error: "Vehicle not found" },
          { status: 404 }
        );
      }

      if (vehicles[0].status !== "available") {
        return NextResponse.json(
          { error: "Vehicle is not available" },
          { status: 400 }
        );
      }

      const updateDriverSql = `
        UPDATE ms_driver 
        SET is_available = TRUE, 
            assigned_vehicle_id = ?,
            active_since = NOW()
        WHERE user_id = ?
      `;
      await query(updateDriverSql, [vehicle_id, userId]);

      const updateVehicleSql = `
        UPDATE ms_vehicle 
        SET status = 'in_use' 
        WHERE id = ?
      `;
      await query(updateVehicleSql, [vehicle_id]);

      return NextResponse.json(
        {
          message: "SUCCESS",
          data: { is_active: true, vehicle_id },
        },
        { status: 200 }
      );
    } else {
      const getAssignedVehicleSql = `
        SELECT assigned_vehicle_id 
        FROM ms_driver 
        WHERE user_id = ?
      `;
      const driverData = (await query(getAssignedVehicleSql, [
        userId,
      ])) as any[];
      const assignedVehicleId = driverData[0]?.assigned_vehicle_id;

      const updateDriverSql = `
        UPDATE ms_driver 
        SET is_available = FALSE, 
            assigned_vehicle_id = NULL,
            active_since = NULL
        WHERE user_id = ?
      `;
      await query(updateDriverSql, [userId]);

      if (assignedVehicleId) {
        const updateVehicleSql = `
          UPDATE ms_vehicle 
          SET status = 'available' 
          WHERE id = ?
        `;
        await query(updateVehicleSql, [assignedVehicleId]);
      }

      return NextResponse.json(
        {
          message: "SUCCESS",
          data: { is_active: false },
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error("Error activating/deactivating driver:", error);
    return NextResponse.json(
      { error: "Failed to update driver status", detail: error.message },
      { status: 500 }
    );
  }
}
