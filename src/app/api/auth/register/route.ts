import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { first_name, last_name, email, password, phone_number, role } = await req.json();

    console.log('📥 Received:', { first_name, last_name, email, phone_number, role });

    if (!first_name || !last_name || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Cek apakah email sudah terdaftar
    const exists = await query('SELECT id FROM ms_users WHERE email = ?', [email]);
    if (exists.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Ambil role_id
    const roleResult = await query('SELECT id FROM ms_role WHERE role_name = ? LIMIT 1', [role]);
    if (roleResult.length === 0) {
      return NextResponse.json({ error: 'Invalid role name' }, { status: 400 });
    }

    const role_id = roleResult[0].id;

    // Insert user baru
    const insertUserResult = await query(
      `INSERT INTO ms_users (role_id, provider, first_name, last_name, email, password, phone_number)
       VALUES (?, 'local', ?, ?, ?, ?, ?)`,
      [role_id, first_name, last_name, email, hashed, phone_number || null]
    ) as any;

    // Nambah insert ke ms_driver disini
    const newUserId = insertUserResult.insertId;
    if (role.toLowerCase() === 'driver') {
      if (!newUserId) {
         throw new Error("Failed to retrieve new user ID");
      }

      // Insert ke ms_driver menggunakan newUserId
      await query(
        `INSERT INTO ms_driver (user_id, is_verified) VALUES (?, false)`,
        [newUserId]
      );
      
      console.log('🚚 Driver profile created for user ID:', newUserId);
    }

    console.log('✅ Registered user:', email);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err: any) {
    console.error('💥 Error /register:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
