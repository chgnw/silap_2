import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { full_name, email, password, phone_number, role } = await req.json();
    if (!full_name || !email || !password) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    const exists = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length > 0) {
      return new Response(JSON.stringify({ error: 'Email already registered' }), { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const resInsert = await query(
      'INSERT INTO users (full_name, email, password, phone_number, role, provider) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name, email, hashed, phone_number || null, role || 'customer', 'local']
    );

    return new Response(JSON.stringify({ ok: true, id: resInsert.insertId }), { status: 201 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
