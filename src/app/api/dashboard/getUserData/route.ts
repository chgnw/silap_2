import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

function getDefaultDateRange() {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    return {
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0],
    };
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('Dashboard API Body:', body);
        const { user_id, start_date, end_date } = body;

        if (!user_id) {
        return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
        }

        const { start_date: defaultStart, end_date: defaultEnd } = getDefaultDateRange();
        const rangeStart = start_date || defaultStart;
        const rangeEnd = end_date || defaultEnd;

        // Semua query dijalankan paralel
        const results = await Promise.allSettled([
            // Total sampah dibuang
            query<{ total: number }>(
                `SELECT COALESCE(SUM(pi.quantity), 0) AS total
                FROM tr_pickups p
                JOIN tr_pickup_items pi ON p.id = pi.pickups_id
                WHERE p.users_id = ? 
                AND p.created_at BETWEEN ? AND ?`,
                [user_id, rangeStart, rangeEnd]
            ),

            // Jumlah poin dikumpulkan
            query<{ current_points: number; earned_points: number }>(
                `SELECT 
                (SELECT points FROM ms_users WHERE id = ?) AS current_points,
                (
                    SELECT COALESCE(SUM(pi.points_earned), 0)
                    FROM tr_pickups p
                    JOIN tr_pickup_items pi ON p.id = pi.pickups_id
                    WHERE p.users_id = ?
                ) AS earned_points`,
                [user_id, user_id]
            ),

            // Streak harian
            query<{ current_streak: number }>(
                `SELECT current_streak FROM ms_users WHERE id = ?`,
                [user_id]
            ),

            // Kategori sampah (Pie chart)
            query<{ category: string; total: number }>(
                `SELECT w.name AS category, COALESCE(SUM(pi.quantity), 0) AS total
                FROM tr_pickups p
                JOIN tr_pickup_items pi ON p.id = pi.pickups_id
                JOIN ms_waste_items w ON pi.waste_item_id = w.id
                WHERE p.users_id = ? 
                AND p.created_at BETWEEN ? AND ?
                GROUP BY w.name`,
                [user_id, rangeStart, rangeEnd]
            ),

            // Detail harian (Line chart)
            query<{ date: string; total: number }>(
                `SELECT DATE(p.created_at) AS date, COALESCE(SUM(pi.quantity), 0) AS total
                FROM tr_pickups p
                JOIN tr_pickup_items pi ON p.id = pi.pickups_id
                WHERE p.users_id = ?
                AND p.created_at BETWEEN ? AND ?
                GROUP BY DATE(p.created_at)
                ORDER BY DATE(p.created_at)`,
                [user_id, rangeStart, rangeEnd]
            ),
        ]);

        // Assign hasil query masing-masing
        const safe = <T>(i: number, fallback: T): T =>
            results[i].status === "fulfilled" ? (results[i].value as T) : fallback;

        // Ambil hasil query sesuai urutan
        const totalWaste = safe<{ total: number }[]>(0, [{ total: 0 }]);
        const pointsChange = safe<{ current_points: number; earned_points: number }[]>(1, [{ current_points: 0, earned_points: 0 }]);
        const streakData = safe<{ current_streak: number }[]>(2, [{ current_streak: 0 }]);
        const categoryData = safe<{ category: string; total: number }[]>(3, []);
        const dailyData = safe<{ date: string; total: number }[]>(4, []);

        console.log('Total Waste:', totalWaste);
        console.log('Points Change:', pointsChange);
        console.log('Streak Data:', streakData);
        console.log('Category Data:', categoryData);
        console.log('Daily Data:', dailyData);

        return NextResponse.json({
            success: true,
            data: {
                date_range: { start: rangeStart, end: rangeEnd },
                total_waste: totalWaste[0]?.total || 0,
                points_earned: pointsChange[0]?.earned_points || 0,
                points_current: pointsChange[0]?.current_points || 0,
                points_change: (pointsChange[0]?.current_points || 0) - (pointsChange[0]?.earned_points || 0),
                current_streak: streakData[0]?.current_streak || 0,
                categories: categoryData,
                daily: dailyData,
            },
        });
    } catch (error: any) {
        console.error('Dashboard API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}
