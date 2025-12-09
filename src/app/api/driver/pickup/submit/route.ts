import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { query } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: "FAILED", detail: "Anda harus login terlebih dahulu" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { pickup_event_id, is_sorted, total_weight, categories } = body;

    // Validate input
    if (!pickup_event_id) {
      return NextResponse.json(
        { message: "FAILED", detail: "Pickup event ID diperlukan" },
        { status: 400 }
      );
    }

    if (total_weight <= 0) {
      return NextResponse.json(
        { message: "FAILED", detail: "Total berat harus lebih dari 0" },
        { status: 400 }
      );
    }

    // Get driver info
    const userSql = `
      SELECT id FROM ms_users 
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
      WHERE d.user_id = ?
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

    // Check if pickup already exists (should exist from accept)
    const checkPickupSql = `
      SELECT id FROM tr_pickups 
      WHERE pickup_event_id = ? AND partner_id = ?
    `;
    const existingPickup = (await query(checkPickupSql, [
      pickup_event_id,
      driverId,
    ])) as any[];

    if (existingPickup.length === 0) {
      return NextResponse.json(
        {
          message: "FAILED",
          detail:
            "Pickup belum di-accept. Silakan accept order terlebih dahulu.",
        },
        { status: 400 }
      );
    }

    const pickupId = existingPickup[0].id;

    // Update tr_pickups to completed status
    const notes = is_sorted
      ? `Sampah sudah dipilah - Total: ${total_weight} kg`
      : `Sampah belum dipilah - Total: ${total_weight} kg`;

    const updatePickupSql = `
      UPDATE tr_pickups
      SET 
        transaction_status_id = 4,
        notes = ?,
        completion_time = NOW()
      WHERE id = ?
    `;

    await query(updatePickupSql, [notes, pickupId]);

    // Update tr_pickup_event to mark as completed
    const updateEventSql = `
      UPDATE tr_pickup_event
      SET 
        event_status = 'completed',
        completed_at = NOW()
      WHERE id = ?
    `;

    await query(updateEventSql, [pickup_event_id]);

    // Calculate total points and prepare pickup items data
    let totalPoints = 0;

    if (is_sorted && categories && categories.length > 0) {
      // Get points_per_unit for each category from ms_waste_category
      const categoryIds = categories.map((cat: any) => cat.category_id);
      const getCategoriesSql = `
        SELECT id, points_per_unit 
        FROM ms_waste_category 
        WHERE id IN (?)
      `;
      const categoriesData = (await query(getCategoriesSql, [
        categoryIds,
      ])) as any[];

      // Create map for quick lookup of points per category
      const categoryPointsMap = new Map(
        categoriesData.map((cat: any) => [cat.id, cat.points_per_unit])
      );

      // Calculate points for each category (for updating user points)
      const itemsData = categories.map((cat: any) => {
        const pointsPerUnit = categoryPointsMap.get(cat.category_id) || 0;
        const pointsEarned = Math.floor(cat.weight * pointsPerUnit);
        totalPoints += pointsEarned;

        return {
          pickup_id: pickupId,
          waste_category_id: cat.category_id,
          weight: cat.weight,
          points_earned: pointsEarned,
        };
      });

      // Try to insert into tr_pickup_items
      // Handle both old structure (with waste_item_id) and new structure (with waste_category_id)
      try {
        // Try new structure first (after migration 015 & 017)
        const insertItemsSql = `
          INSERT INTO tr_pickup_items (
            pickup_id,
            waste_category_id,
            weight,
            points_earned
          )
          VALUES ?
        `;

        const values = itemsData.map((item: any) => [
          item.pickup_id,
          item.waste_category_id,
          item.weight,
          item.points_earned,
        ]);

        await query(insertItemsSql, [values]);
      } catch (error: any) {
        try {
          const insertItemsFallbackSql = `
            INSERT INTO tr_pickup_items (
              pickup_id,
              waste_item_id,
              waste_category_id,
              quantity,
              weight,
              points_earned
            )
            VALUES ?
          `;

          const valuesFallback = itemsData.map((item: any) => [
            item.pickup_id,
            item.waste_category_id, // Use category_id as dummy waste_item_id
            item.waste_category_id,
            item.weight, // quantity = weight for now
            item.weight,
            item.points_earned,
          ]);

          await query(insertItemsFallbackSql, [valuesFallback]);
        } catch (fallbackError: any) {
          // If both fail, log error but continue (points already calculated)
          console.error(
            "Failed to insert tr_pickup_items:",
            fallbackError.message
          );
          console.log("Continuing without tr_pickup_items insert...");
        }
      }
    }

    // Get user_id from pickup event
    const getUserFromEventSql = `
      SELECT user_id FROM tr_pickup_event WHERE id = ?
    `;
    const eventUserResult = (await query(getUserFromEventSql, [
      pickup_event_id,
    ])) as any[];

    if (eventUserResult.length === 0) {
      return NextResponse.json(
        { message: "FAILED", detail: "Pickup event tidak ditemukan" },
        { status: 404 }
      );
    }

    const customerId = eventUserResult[0].user_id;

    // Update user points in ms_users
    if (totalPoints > 0) {
      const updateUserPointsSql = `
        UPDATE ms_users 
        SET points = points + ? 
        WHERE id = ?
      `;
      await query(updateUserPointsSql, [totalPoints, customerId]);
    }

    // Get transaction code for response
    const getTransactionSql = `
      SELECT transaction_code FROM tr_pickups WHERE id = ?
    `;
    const transactionResult = (await query(getTransactionSql, [
      pickupId,
    ])) as any[];
    const transactionCode =
      transactionResult[0]?.transaction_code || "Tidak Diketahui";

    // Insert into tr_point_history (HANYA kolom yang ada di DB!)
    if (totalPoints > 0) {
      const insertPointHistorySql = `
        INSERT INTO tr_point_history (
          user_id,
          points_change,
          pickup_id,
          description
        )
        VALUES (?, ?, ?, ?)
      `;

      const description = `Poin dari pickup sampah - ${total_weight} kg (${transactionCode})`;
      await query(insertPointHistorySql, [
        customerId,
        totalPoints,
        pickupId,
        description,
      ]);
    }

    return NextResponse.json(
      {
        message: "SUCCESS",
        detail: "Pickup berhasil disubmit dan diselesaikan",
        data: {
          transaction_code: transactionCode,
          pickup_id: pickupId,
          total_weight,
          points_earned: totalPoints,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error submitting pickup:", error);
    return NextResponse.json(
      {
        message: "FAILED",
        detail: "Terjadi kesalahan saat memproses pickup. Silakan coba lagi.",
      },
      { status: 500 }
    );
  }
}
