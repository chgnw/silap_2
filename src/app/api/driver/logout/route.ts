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

    const userId = session.user.id;

    // Get driver info with assigned vehicle
    const driverSql = `
      SELECT id, assigned_vehicle_id 
      FROM ms_driver 
      WHERE user_id = ?
    `;
    const driverData = (await query(driverSql, [userId])) as any[];

    if (driverData.length === 0) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    const driver = driverData[0];

    // If driver has assigned vehicle, make it available
    if (driver.assigned_vehicle_id) {
      await query(`UPDATE ms_vehicle SET status = 'available' WHERE id = ?`, [
        driver.assigned_vehicle_id,
      ]);
    }

    // Set driver as inactive and unassign vehicle
    await query(
      `UPDATE ms_driver 
       SET is_available = FALSE, assigned_vehicle_id = NULL 
       WHERE user_id = ?`,
      [userId]
    );

    return NextResponse.json(
      {
        message: "SUCCESS",
        detail: "Driver logged out successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error logging out driver:", error);
    return NextResponse.json(
      { error: "Failed to logout driver", detail: error.message },
      { status: 500 }
    );
  }
}
