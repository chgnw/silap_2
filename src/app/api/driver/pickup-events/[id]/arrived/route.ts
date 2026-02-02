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
      SELECT id FROM ms_driver WHERE user_id = ? AND is_deleted = FALSE
    `;
        const driverData = (await query(driverSql, [userId])) as any[];

        if (driverData.length === 0) {
            return NextResponse.json(
                { message: "FAILED", detail: "Driver tidak ditemukan" },
                { status: 404 }
            );
        }

        const driverId = driverData[0].id;

        // Check if this pickup belongs to this driver and has correct status
        const checkSql = `
      SELECT p.id, p.transaction_status_id
      FROM tr_pickup p
      WHERE p.pickup_event_id = ?
        AND p.driver_id = ?
    `;
        const pickupData = (await query(checkSql, [eventId, driverId])) as any[];

        if (pickupData.length === 0) {
            return NextResponse.json(
                { message: "FAILED", detail: "Order tidak ditemukan atau bukan milik Anda" },
                { status: 404 }
            );
        }

        const pickup = pickupData[0];

        // Check if status is "Menuju Lokasi" (6)
        if (pickup.transaction_status_id !== 6) {
            return NextResponse.json(
                {
                    message: "FAILED",
                    detail: "Status order tidak valid untuk aksi ini. Status harus 'Menuju Lokasi'"
                },
                { status: 400 }
            );
        }

        // Update status to "Sampai di Lokasi" (7)
        const updateSql = `
      UPDATE tr_pickup
      SET transaction_status_id = 7
      WHERE id = ?
    `;
        await query(updateSql, [pickup.id]);

        return NextResponse.json(
            {
                message: "SUCCESS",
                detail: "Status berhasil diupdate ke 'Sampai di Lokasi'",
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error updating status to arrived:", error);
        return NextResponse.json(
            { message: "FAILED", detail: "Terjadi kesalahan" },
            { status: 500 }
        );
    }
}
