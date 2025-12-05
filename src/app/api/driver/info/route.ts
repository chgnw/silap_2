import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userSql = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone_number as phone,
        r.role_name as role_name,
        d.is_verified,
        d.is_available as is_active,
        d.assigned_vehicle_id,
        d.active_since
      FROM ms_users u
      LEFT JOIN ms_role r ON u.role_id = r.id
      LEFT JOIN ms_driver d ON u.id = d.user_id
      WHERE u.email = ?
    `;

    const users = (await query(userSql, [session.user.email])) as any[];

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];

    return NextResponse.json(
      {
        message: "SUCCESS",
        data: user,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching driver info:", error);
    return NextResponse.json(
      { error: "Failed to fetch driver info", detail: error.message },
      { status: 500 }
    );
  }
}
