import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";


type TotalWasteResult = {
  total: number
};

type UserDataResult = {
  points_current: number;
  points_last_earned: number;
  current_streak: number;
  last_streak_week: number | null;
  waste_target: number;
  total_monthly: number;
  tier_list_id: number | null;
  tier_name: string | null;
};

type CategoryDataResult = {
  category: string;
  total: number
};

type DailyDataResult = {
  date: string;
  total: number
};

/**
 * Menghasilkan range tanggal default (1 bulan terakhir)
 */
function getDefaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  return {
    start_date: start.toISOString().split("T")[0],
    end_date: end.toISOString().split("T")[0],
  };
}

/**
 * Helper untuk safely extract hasil dari Promise.allSettled
 */
function extractQueryResult<T>(
  result: PromiseSettledResult<T>,
  fallback: T
): T {
  return result.status === "fulfilled" ? result.value : fallback;
}

/**
 * Query 1: Total sampah yang dibuang dalam rentang waktu tertentu
 */
async function getTotalWasteInRange(
  user_id: number,
  rangeStart: string,
  rangeEnd: string
) {
  return query<TotalWasteResult>(
    `
      SELECT COALESCE(SUM(pi.weight), 0) AS total
      FROM tr_pickup p
      JOIN tr_pickup_item pi ON p.id = pi.pickup_id
      WHERE p.user_id = ? 
      AND DATE(p.created_at) BETWEEN ? AND ?
    `,
    [user_id, rangeStart, rangeEnd]
  );
}

/**
 * Query 2: Data user (poin, streak, tier, target, dll)
 */
async function getUserMetrics(user_id: number) {
  return query<UserDataResult>(
    `
      SELECT 
        u.points AS points_current,
        u.current_streak,
        u.last_streak_week,
        u.tier_list_id,
        t.tier_name,
        COALESCE(t.target_weight, 0) AS waste_target,
        
        -- Poin dari pickup TERAKHIR
        (
          SELECT COALESCE(points_change, 0)
          FROM tr_point_history
          WHERE user_id = ? AND pickup_id IS NOT NULL
          ORDER BY created_at DESC
          LIMIT 1
        ) AS points_last_earned,
        
        -- Total sampah bulan ini
        (
          SELECT COALESCE(SUM(pi.weight), 0)
          FROM tr_pickup p
          LEFT JOIN tr_pickup_item pi ON pi.pickup_id = p.id
          WHERE p.user_id = u.id
            AND MONTH(p.created_at) = MONTH(NOW())
            AND YEAR(p.created_at) = YEAR(NOW())
        ) AS total_monthly
        
      FROM ms_user u
      LEFT JOIN ms_tier_list t ON u.tier_list_id = t.id
      WHERE u.id = ?;
    `,
    [user_id, user_id]
  );
}

/**
 * Query 3: Data kategori sampah untuk Pie Chart
 */
async function getWasteCategoryBreakdown(
  user_id: number,
  rangeStart: string,
  rangeEnd: string
) {
  return query<CategoryDataResult>(
    `
      SELECT 
          c.waste_category_name AS category,
          COALESCE(SUM(pi.weight), 0) AS total
      FROM tr_pickup p
      JOIN tr_pickup_item pi ON p.id = pi.pickup_id
      JOIN ms_waste_category c ON pi.waste_category_id = c.id
      WHERE p.user_id = ?
      AND DATE(p.created_at) BETWEEN ? AND ?
      GROUP BY c.waste_category_name
      ORDER BY total DESC;
    `,
    [user_id, rangeStart, rangeEnd]
  );
}

/**
 * Query 4: Data harian sampah untuk Line Chart
 */
async function getDailyWasteData(
  user_id: number,
  rangeStart: string,
  rangeEnd: string
) {
  return query<DailyDataResult>(
    `
      SELECT 
          DATE(p.created_at) AS date,
          COALESCE(SUM(pi.weight), 0) AS total
      FROM tr_pickup p
      JOIN tr_pickup_item pi ON p.id = pi.pickup_id
      WHERE p.user_id = ?
      AND DATE(p.created_at) BETWEEN ? AND ?
      GROUP BY DATE(p.created_at)
      ORDER BY DATE(p.created_at);
    `,
    [user_id, rangeStart, rangeEnd]
  );
}

// ===== MAIN HANDLER =====

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, start_date, end_date } = body;

    // Validasi input
    if (!user_id) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }

    // Setup date range
    const { start_date: defaultStart, end_date: defaultEnd } = getDefaultDateRange();
    const rangeStart = start_date || defaultStart;
    const rangeEnd = end_date || defaultEnd;

    // Jalankan semua query secara PARALEL untuk performa maksimal
    const [
      totalWasteResult,
      userDataResult,
      categoryDataResult,
      dailyDataResult,
    ] = await Promise.allSettled([
      getTotalWasteInRange(user_id, rangeStart, rangeEnd),
      getUserMetrics(user_id),
      getWasteCategoryBreakdown(user_id, rangeStart, rangeEnd),
      getDailyWasteData(user_id, rangeStart, rangeEnd),
    ]);

    // Extract hasil query dengan fallback values
    const totalWaste = extractQueryResult(totalWasteResult, [{ total: 0 }]);

    const userData = extractQueryResult(userDataResult, [
      {
        points_current: 0,
        points_last_earned: 0,
        current_streak: 0,
        last_streak_week: null,
        waste_target: 0,
        total_monthly: 0,
        tier_list_id: null,
        tier_name: null,
      },
    ]);

    const categoryData = extractQueryResult(categoryDataResult, []);
    const dailyData = extractQueryResult(dailyDataResult, []);

    // Debug logging (bisa dihapus di production)
    // console.log("=== DEBUG START ===");
    // console.log("User ID:", user_id);
    // console.log("Date Range:", rangeStart, "to", rangeEnd);
    // console.log("Total Waste:", totalWaste);
    // console.log("Category Data:", categoryData);
    // console.log("Daily Data:", dailyData);
    // console.log("User Data RAW:", userData);
    // console.log("User Data Length:", userData.length);
    // console.log("User Data [0]:", userData[0]);
    // console.log("=== DEBUG END ===");

    // Calculate streak_active_this_week
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    const currentWeek = now.getFullYear() * 100 + weekNumber;
    const lastStreakWeek = userData[0]?.last_streak_week || null;
    const streakActiveThisWeek = lastStreakWeek === currentWeek;

    // Return response
    return NextResponse.json({
      success: true,
      data: {
        date_range: { start: rangeStart, end: rangeEnd },
        total_waste: totalWaste[0]?.total || 0,
        points_current: userData[0]?.points_current || 0,
        points_last_earned: userData[0]?.points_last_earned || 0,
        current_streak: userData[0]?.current_streak || 0,
        streak_active_this_week: streakActiveThisWeek,
        waste_target: userData[0]?.waste_target || 0,
        total_monthly: userData[0]?.total_monthly || 0,
        categories: categoryData,
        daily: dailyData,
      },
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
