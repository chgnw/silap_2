import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { toWIBDateString } from "@/lib/dateHelper";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { user_id, event_date } = body;

        if (!user_id) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        // Count pickups in the same week as the event_date (or current week if not provided)
        const dateToCheck = event_date || toWIBDateString();

        const countSql = `
      SELECT COUNT(*) as count
      FROM tr_pickup_event
      WHERE user_id = ?
        AND YEARWEEK(event_date, 1) = YEARWEEK(?, 1)
    `;

        const result = await query(countSql, [user_id, dateToCheck]) as any[];

        return NextResponse.json({
            message: "SUCCESS",
            count: result[0]?.count || 0
        });

    } catch (error: any) {
        console.error("Error fetching weekly pickup count:", error);
        return NextResponse.json(
            { error: "Failed to fetch weekly pickup count", detail: error.message },
            { status: 500 }
        );
    }
}
