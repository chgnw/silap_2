import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { message: "FAILED", detail: "Anda harus login terlebih dahulu" },
        { status: 401 }
      );
    }

    const { id: eventId } = await params;

    // Get driver info
    const driverSql = `
      SELECT id, assigned_vehicle_id 
      FROM ms_driver 
      WHERE user_id = ?
    `;
    const driverData = (await query(driverSql, [userId])) as any[];

    if (driverData.length === 0) {
      return NextResponse.json(
        { message: "FAILED", detail: "Driver tidak ditemukan" },
        { status: 404 }
      );
    }

    const driver = driverData[0];

    if (!driver.assigned_vehicle_id) {
      return NextResponse.json(
        {
          message: "FAILED",
          detail:
            "Belum ada kendaraan yang ditugaskan. Silakan pilih kendaraan terlebih dahulu.",
        },
        { status: 400 }
      );
    }

    // Check if pickup event exists
    const eventSql = `
      SELECT id, transaction_code, user_id, pickup_address, event_date, pickup_time
      FROM tr_pickup_event 
      WHERE id = ?
    `;
    const eventData = (await query(eventSql, [eventId])) as any[];

    if (eventData.length === 0) {
      return NextResponse.json(
        { message: "FAILED", detail: "Pickup event tidak ditemukan" },
        { status: 404 }
      );
    }

    const event = eventData[0];

    // Check if already accepted
    const checkSql = `
      SELECT id FROM tr_pickup 
      WHERE pickup_event_id = ?
    `;
    const existingPickup = (await query(checkSql, [eventId])) as any[];

    if (existingPickup.length > 0) {
      return NextResponse.json(
        {
          message: "FAILED",
          detail: "Pickup ini sudah di-accept oleh driver lain",
        },
        { status: 409 }
      );
    }

    // Use the same transaction_code from tr_pickup_event
    const transactionCode = event.transaction_code;

    // Insert to tr_pickup with status 2 (Pending/Accepted)
    const insertSql = `
      INSERT INTO tr_pickup 
      (transaction_code, user_id, pickup_event_id, partner_id, transaction_status_id, 
       pickup_address, request_time, pickup_schedule)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)
    `;

    // Format datetime for MySQL (YYYY-MM-DD HH:MM:SS)
    const eventDate = new Date(event.event_date);
    const dateStr = eventDate.toISOString().split("T")[0]; // YYYY-MM-DD
    const pickupSchedule = `${dateStr} ${event.pickup_time}`;

    await query(insertSql, [
      transactionCode,
      event.user_id,
      eventId,
      driver.id,
      2,
      event.pickup_address,
      pickupSchedule,
    ]);

    // Update tr_pickup_event status to 'accepted'
    const updateEventSql = `
      UPDATE tr_pickup_event
      SET event_status = 'accepted'
      WHERE id = ?
    `;
    await query(updateEventSql, [eventId]);

    return NextResponse.json(
      {
        message: "SUCCESS",
        detail: "Order berhasil di-accept",
        data: {
          transaction_code: transactionCode,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error accepting pickup event:", error);
    return NextResponse.json(
      {
        message: "FAILED",
        detail: "Terjadi kesalahan saat menerima order. Silakan coba lagi.",
      },
      { status: 500 }
    );
  }
}
