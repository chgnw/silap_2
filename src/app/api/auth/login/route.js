import { getConnection } from '@/lib/db';
import bcrypt from 'bcrypt';
import { signToken } from '@/lib/jwt';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const conn = await getConnection();

    const [rows] = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password || '');
    if (!valid) return Response.json({ error: 'Invalid password' }, { status: 401 });

    const token = signToken({ id: user.id, email: user.email });
    return Response.json({ token, user });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
