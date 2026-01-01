import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: eventId } = await params;

    const sql = `
      SELECT 
        pe.id,
        pe.transaction_code,
        pe.user_id,
        pe.pickup_address,
        pe.pickup_weight,
        pe.pickup_type_id,
        pe.event_date,
        pe.pickup_time,
        pe.vehicle_category_id,
        pe.user_notes,
        pe.image_url,
        pe.created_at,
        u.first_name,
        u.last_name,
        u.email,
        u.phone_number,
        pt.pickup_type_name,
        vc.category_name,
        vc.min_weight as category_min_weight,
        vc.max_weight as category_max_weight,
        p.id as pickup_id,
        CASE 
          WHEN p.id IS NOT NULL THEN ts.transaction_status_name
          ELSE NULL
        END as status
      FROM tr_pickup_event pe
      JOIN ms_user u ON pe.user_id = u.id
      JOIN ms_pickup_type pt ON pe.pickup_type_id = pt.id
      LEFT JOIN ms_vehicle_category vc ON pe.vehicle_category_id = vc.id
      LEFT JOIN tr_pickup p ON pe.id = p.pickup_event_id
      LEFT JOIN ms_transaction_status ts ON p.transaction_status_id = ts.id
      WHERE pe.id = ?
    `;

    const result = (await query(sql, [eventId])) as any[];

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Pickup event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "SUCCESS",
        data: result[0],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching pickup event detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch pickup event detail", detail: error.message },
      { status: 500 }
    );
  }
}
