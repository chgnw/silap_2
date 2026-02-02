import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { query } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        {
          message: "FAILED",
          detail: "Anda harus login terlebih dahulu",
        },
        { status: 401 }
      );
    }

    const eventId = parseInt(params.id);
    const body = await req.json();
    const { reason } = body;

    if (!reason || reason.trim() === "") {
      return NextResponse.json(
        {
          message: "FAILED",
          detail: "Alasan pembatalan harus diisi",
        },
        { status: 400 }
      );
    }

    // Get driver info
    const userSql = `
      SELECT id FROM ms_user
      WHERE email = ?
    `;
    const userResult = (await query(userSql, [session.user.email])) as any[];

    if (!userResult || userResult.length === 0) {
      return NextResponse.json(
        { message: "FAILED", detail: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    const userId = userResult[0].id;

    const driverSql = `
      SELECT d.id as driver_id
      FROM ms_driver d
      WHERE d.user_id = ? AND d.is_deleted = FALSE
    `;
    const driverResult = (await query(driverSql, [userId])) as any[];

    if (!driverResult || driverResult.length === 0) {
      return NextResponse.json(
        {
          message: "FAILED",
          detail: "Driver tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const driverId = driverResult[0].driver_id;

    // Check if event exists and driver has accepted it
    const checkEventSql = `
      SELECT pe.id, pe.event_status, p.id as pickup_id
      FROM tr_pickup_event pe
      LEFT JOIN tr_pickup p ON pe.id = p.pickup_event_id AND p.driver_id = ?
      WHERE pe.id = ?
    `;
    const eventResult = (await query(checkEventSql, [
      driverId,
      eventId,
    ])) as any[];

    if (eventResult.length === 0) {
      return NextResponse.json(
        {
          message: "FAILED",
          detail: "Event tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const event = eventResult[0];

    // Check if event already completed or cancelled
    if (event.event_status === "completed") {
      return NextResponse.json(
        {
          message: "FAILED",
          detail: "Event sudah diselesaikan",
        },
        { status: 400 }
      );
    }

    if (event.event_status === "cancelled") {
      return NextResponse.json(
        {
          message: "FAILED",
          detail: "Event sudah dibatalkan",
        },
        { status: 400 }
      );
    }

    // Check if driver has accepted this event
    if (!event.pickup_id) {
      return NextResponse.json(
        {
          message: "FAILED",
          detail: "Anda belum accept event ini",
        },
        { status: 400 }
      );
    }

    // Update tr_pickup_event to cancelled
    const updateEventSql = `
      UPDATE tr_pickup_event
      SET 
        event_status = 'cancelled',
        cancelled_reason = ?,
        cancelled_at = NOW(),
        cancelled_by = ?
      WHERE id = ?
    `;

    await query(updateEventSql, [reason, driverId, eventId]);

    // Update tr_pickup to cancelled status (status 5)
    const updatePickupSql = `
      UPDATE tr_pickup
      SET 
        transaction_status_id = 5,
        notes = ?,
        completion_time = NOW()
      WHERE id = ?
    `;

    const cancelNote = `Pickup dibatalkan - Alasan: ${reason}`;
    await query(updatePickupSql, [cancelNote, event.pickup_id]);

    return NextResponse.json(
      {
        message: "SUCCESS",
        detail: "Event berhasil dibatalkan",
        data: {
          event_id: eventId,
          cancelled_at: new Date().toISOString(),
          reason: reason,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error cancelling event:", error);
    return NextResponse.json(
      {
        message: "FAILED",
        detail: "Terjadi kesalahan saat membatalkan order. Silakan coba lagi.",
      },
      { status: 500 }
    );
  }
}
