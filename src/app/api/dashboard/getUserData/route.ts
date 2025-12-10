import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

function getDefaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  return {
    start_date: start.toISOString().split("T")[0],
    end_date: end.toISOString().split("T")[0],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // console.log('Dashboard API Body:', body);
    const { user_id, start_date, end_date } = body;

    if (!user_id) {
      return NextResponse.json(
        {
          error: "user_id is required",
        },
        { status: 400 }
      );
    }

    const { start_date: defaultStart, end_date: defaultEnd } =
      getDefaultDateRange();
    const rangeStart = start_date || defaultStart;
    const rangeEnd = end_date || defaultEnd;
    // console.log('Dashboard API Range:', rangeStart, rangeEnd);

    // Semua query dijalankan paralel
    const results = await Promise.allSettled([
      // Total sampah dibuang sesuai range (filter)
      query<{ total: number }>(
        `
          SELECT COALESCE(SUM(pi.quantity), 0) AS total
          FROM tr_pickups p
          JOIN tr_pickup_items pi ON p.id = pi.pickup_id
          WHERE p.user_id = ? 
          AND DATE(p.created_at) BETWEEN ? AND ?
        `,
        [user_id, rangeStart, rangeEnd]
      ),

      // Poin current & last earned + streak + waste target & monthly total (GABUNG JADI 1 QUERY)
      query<{
        points_current: number;
        points_last_earned: number;
        current_streak: number;
        waste_target: number;
        total_monthly: number;
        tier_list_id: number | null;
        tier_name: string | null;
      }>(
        `
          SELECT 
            u.points AS points_current,
            u.current_streak,
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
      ),

      // Kategori sampah (Pie chart)
      query<{ category: string; total: number }>(
        `
          SELECT 
              c.waste_category_name AS category,
              COALESCE(SUM(pi.quantity), 0) AS total
          FROM tr_pickups p
          JOIN tr_pickup_items pi ON p.id = pi.pickup_id
          JOIN ms_waste_item i ON pi.waste_item_id = i.id
          JOIN ms_waste_category c ON i.waste_category_id = c.id
          WHERE p.user_id = ?
          AND DATE(p.created_at) BETWEEN ? AND ?
          GROUP BY c.waste_category_name
          ORDER BY total DESC;
        `,
        [user_id, rangeStart, rangeEnd]
      ),

      // Detail harian (Line chart)
      query<{ date: string; total: number }>(
        `
          SELECT 
              DATE(p.created_at) AS date,
              COALESCE(SUM(pi.quantity), 0) AS total
          FROM tr_pickups p
          JOIN tr_pickup_items pi ON p.id = pi.pickup_id
          WHERE p.user_id = ?
          AND DATE(p.created_at) BETWEEN ? AND ?
          GROUP BY DATE(p.created_at)
          ORDER BY DATE(p.created_at);
        `,
        [user_id, rangeStart, rangeEnd]
      ),
    ]);

    // Assign hasil query masing-masing
    const safe = <T>(i: number, fallback: T): T =>
      results[i].status === "fulfilled" ? (results[i].value as T) : fallback;

    // Ambil hasil query sesuai urutan
    const totalWaste = safe<{ total: number }[]>(0, [{ total: 0 }]);
    const userData = safe<
      {
        points_current: number;
        points_last_earned: number;
        current_streak: number;
        waste_target: number;
        total_monthly: number;
        tier_list_id: number | null;
        tier_name: string | null;
      }[]
    >(1, [
      {
        points_current: 0,
        points_last_earned: 0,
        current_streak: 0,
        waste_target: 0,
        total_monthly: 0,
        tier_list_id: null,
        tier_name: null,
      },
    ]);
    const categoryData = safe<{ category: string; total: number }[]>(2, []);
    const dailyData = safe<{ date: string; total: number }[]>(3, []);

    // console.log("=== DEBUG START ===");
    // console.log("User ID:", user_id);
    // console.log("Total Waste:", totalWaste);
    // console.log("User Data RAW:", userData);
    // console.log("User Data Length:", userData.length);
    // console.log("User Data [0]:", userData[0]);
    // console.log("=== DEBUG END ===");

    return NextResponse.json({
      success: true,
      data: {
        date_range: { start: rangeStart, end: rangeEnd },
        total_waste: totalWaste[0]?.total || 0,
        points_current: userData[0]?.points_current || 0,
        points_last_earned: userData[0]?.points_last_earned || 0,
        current_streak: userData[0]?.current_streak || 0,
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
