import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, phoneNumber } = body;

    // Validate required fields
    if (!firstName) {
      return NextResponse.json(
        { error: "First name is required" },
        { status: 400 }
      );
    }

    // Get user ID
    const userSql = "SELECT id FROM ms_users WHERE email = ?";
    const users = (await query(userSql, [session.user.email])) as any[];

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = users[0].id;

    // Update user profile
    const updateSql = `
      UPDATE ms_users 
      SET 
        first_name = ?,
        last_name = ?,
        phone_number = ?
      WHERE id = ?
    `;

    await query(updateSql, [
      firstName,
      lastName || null,
      phoneNumber || null,
      userId,
    ]);

    return NextResponse.json(
      {
        message: "SUCCESS",
        data: {
          firstName,
          lastName,
          phoneNumber,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating driver profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile", detail: error.message },
      { status: 500 }
    );
  }
}



