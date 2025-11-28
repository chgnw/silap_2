import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST (req: NextRequest) {
    try {
        const body = await req.json();
        const { 
            page = 1, 
            limit, 
            categoryId = null, 
            search = '' 
        } = body;
        const pageInt = parseInt(page.toString());
        const limitInt = parseInt(limit.toString());
        const offset = (pageInt - 1) * limitInt;

        let whereConditions = [];
        let queryParams: any[] = [];

        if (categoryId) {
            whereConditions.push(`category_id = ?`);
            queryParams.push(categoryId);
        }

        if (search) {
            whereConditions.push(`(reward_name LIKE ? OR vendor_name LIKE ?)`);
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        const whereClause = whereConditions.length > 0 
            ? `WHERE ${whereConditions.join(' AND ')}` 
            : '';

        const countSql = `
            SELECT COUNT(*) as total
            FROM ms_rewards
            ${whereClause}
        `;

        const countResult = await query(countSql, queryParams);
        const totalItems = parseInt(countResult[0].total);
        const startEntry = totalItems === 0 ? 0 : (pageInt - 1) * limitInt + 1;
        const endEntry = Math.min(pageInt * limitInt, totalItems);

        const sql = `
            SELECT *
            FROM ms_rewards
            ${whereClause}
            ORDER BY id DESC
            LIMIT ?, ?
        `;
        const finalParams = [...queryParams, offset, limitInt];
        const rewardItems = await query(sql, finalParams);

        return NextResponse.json({
            message: "SUCCESS",
            data: rewardItems,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                totalItems: totalItems,
                itemsPerPage: limit,
                hasNextPage: page < Math.ceil(totalItems / limit),
                hasPrevPage: page > 1,
                entryFrom: startEntry,
                entryTo: endEntry
            }
        }, { status: 200 });
    } catch (error:any) {
        console.error("Error in /get-reward-items: ", error);
        return NextResponse.json({
            message: "FAILED",
            detail: "Terjadi kesalahan pada server.",
            error: error
        }, { status: 500 });
    }
}