import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

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
        u.profile_picture,
        u.province,
        u.regency,
        u.subdistrict,
        u.village,
        u.address,
        u.postal_code,
        r.role_name as role_name,
        d.is_verified,
        d.is_available as is_active,
        d.total_deliveries,
        d.id_card_number,
        d.license_number,
        d.assigned_vehicle_id,
        d.operational_area,
        v.brand as vehicle_brand,
        v.model as vehicle_model,
        v.license_plate as vehicle_license_plate,
        v.status as vehicle_status,
        vc.category_name as vehicle_category,
        vc.max_weight as vehicle_max_weight,
        vc.id as vehicle_category_id
      FROM ms_user u
      LEFT JOIN ms_role r ON u.role_id = r.id
      LEFT JOIN ms_driver d ON u.id = d.user_id
      LEFT JOIN ms_vehicle v ON d.assigned_vehicle_id = v.id
      LEFT JOIN ms_vehicle_category vc ON v.vehicle_category_id = vc.id
      WHERE u.email = ?
    `;

    const users = (await query(userSql, [session.user.email])) as any[];

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];

    // Construct full name
    const fullName = user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.first_name;

    return NextResponse.json(
      {
        message: "SUCCESS",
        data: {
          ...user,
          name: fullName,
        },
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
