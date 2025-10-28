import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const sql = `
      SELECT 
        c.id AS category_id,
        c.uuid AS category_uuid,
        c.waste_category_name AS category_name,
        c.icon_name,
        i.id AS item_id,
        i.uuid AS item_uuid,
        i.waste_item_name AS item_name,
        i.image_url,
        i.unit
      FROM ms_waste_category c
      LEFT JOIN ms_waste_item i ON i.waste_category_id = c.id
      WHERE c.is_deleted = FALSE
      ORDER BY c.id, i.id
    `;
    const rows = await query(sql);

    const categoryMap: Record<number, any> = {};
    for (const row of rows) {
      if (!categoryMap[row.category_id]) {
        categoryMap[row.category_id] = {
          id: row.category_id,
          uuid: row.category_uuid,
          name: row.category_name,
          icon: row.icon_name,
          SubCategory: [],
        };
      }
      if (row.item_id) {
        categoryMap[row.category_id].SubCategory.push({
          id: row.item_id,
          uuid: row.item_uuid,
          name: row.item_name,
          imageUrl: row.image_url,
          unit: row.unit,
        });
      }
    }

    return NextResponse.json(Object.values(categoryMap));
  } catch (error) {
    console.error('Error fetching waste data:', error);
    return NextResponse.json(
      { message: 'Failed to fetch waste data' },
      { status: 500 }
    );
  }
}
