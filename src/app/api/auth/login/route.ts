import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    console.log("email: ", email);
    console.log("password: ", password);

    // 1️⃣ Cek apakah user ada
    const rows = await query(
      'SELECT * FROM ms_users WHERE email = ? LIMIT 1',
      [email]
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = rows[0];
    console.log("user: ", user);

    // 2️⃣ Cek provider
    if (user.provider !== 'local') {
      return NextResponse.json(
        { error: `Login not allowed for ${user.provider} account` },
        { status: 403 }
      );
    }

    // 3️⃣ Validasi password (pastikan password-nya gak null)
    const valid = await bcrypt.compare(password, user.password || '');
    if (!valid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // 4️⃣ Generate JWT token
    const token = signToken({
      id: user.id,
      email: user.email,
      role_id: user.role_id,
    });

    // 5️⃣ Response sukses
    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role_id: user.role_id,
      },
    });
  } catch (err: any) {
    console.error('❌ Login error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
