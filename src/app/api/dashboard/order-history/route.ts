import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id } = body;

    const sql = `
      SELECT * FROM (
        SELECT 
          p.id AS ref_id,
          'PICKUP' AS category,
          'Setor Sampah' AS title,
          p.created_at AS date,
          CASE 
            WHEN p.transaction_status_id = 1 THEN 'Pending'
            WHEN p.transaction_status_id = 2 THEN 'Diterima'
            WHEN p.transaction_status_id = 3 THEN 'Proses'
            WHEN p.transaction_status_id = 4 THEN 'Berhasil'
            WHEN p.transaction_status_id = 5 THEN 'Dibatalkan'
            WHEN p.transaction_status_id = 6 THEN 'Menuju Lokasi'
            WHEN p.transaction_status_id = 7 THEN 'Pickup'
            ELSE 'Unknown'
          END AS status,
          JSON_OBJECT(
            'address', p.pickup_address,
            'notes', p.notes,
            'weight', (SELECT SUM(weight) FROM tr_pickup_item WHERE pickup_id = p.id)
          ) AS details,
          CONCAT('+', COALESCE((SELECT SUM(points_earned) FROM tr_pickup_item WHERE pickup_id = p.id), 0), ' Pts') AS amount_display
        FROM tr_pickup p
        WHERE user_id = ?

        UNION ALL

        SELECT 
          r.id AS ref_id,
          'REDEEM' AS category,
          m.reward_name AS title,
          r.created_at AS date,
          'Berhasil' AS status,
          JSON_OBJECT(
              'code', r.transaction_code,
              'vendor', m.vendor_name,
              'image', m.image_path
          ) AS details,
          CONCAT('-', r.total_points_spent, ' points') AS amount_display
        FROM tr_redemption r
        JOIN ms_reward m ON r.reward_id = m.id
        WHERE user_id = ?

        UNION ALL
        
        SELECT 
          py.id AS ref_id,
          'PAYMENT' AS category,
          CONCAT('Bayar ', py.payment_type) AS title,
          py.payment_time AS date,
          CASE 
              WHEN py.transaction_status_id = 1 THEN 'Pending'
              WHEN py.transaction_status_id = 2 THEN 'Berhasil'
              WHEN py.transaction_status_id = 3 THEN 'Dibatalkan'
              ELSE 'Proses'
          END AS status,
          JSON_OBJECT(
              'method', py.payment_method,
              'inv_id', py.id
          ) AS details,
          CONCAT('Rp ', FORMAT(py.total_payment, 0)) AS amount_display
        FROM tr_payment_history py
        WHERE user_id = ?
      ) AS all_transactions
      ORDER BY date DESC;
    `;
    const rows = (await query(sql, [user_id, user_id, user_id])) as any;
    if (!rows) {
      console.log("Error saat query");
      return NextResponse.json(
        {
          message: "SUCCESS",
          detail: "Tidak ada data yang tersedia",
        },
        { status: 400 }
      );
    }

    if (rows.length === 0) {
      console.log("Tidak ada data yang tersedia");
      return NextResponse.json(
        {
          message: "SUCCESS",
          detail: "Tidak ada data yang tersedia",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        message: "SUCCESS",
        data: rows,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("error in /order-history: ", error);
    return NextResponse.json(
      {
        message: "FAILED",
        error: error,
      },
      { status: 500 }
    );
  }
}
