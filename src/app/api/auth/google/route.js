import oauth2Client from '@/lib/google';
import { getConnection } from '@/lib/db';
import { signToken } from '@/lib/jwt';
import { google } from 'googleapis';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['profile', 'email'],
    });
    return Response.redirect(authUrl);
  }

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const { data: profile } = await oauth2.userinfo.get();

  const conn = await getConnection();
  const [rows] = await conn.query('SELECT * FROM users WHERE email = ?', [profile.email]);

  let user = rows[0];
  if (!user) {
    await conn.query(
      'INSERT INTO users (name, email, google_id, avatar) VALUES (?, ?, ?, ?)',
      [profile.name, profile.email, profile.id, profile.picture]
    );
    const [newUser] = await conn.query('SELECT * FROM users WHERE email = ?', [profile.email]);
    user = newUser[0];
  }

  const token = signToken({ id: user.id, email: user.email });
  return Response.redirect(`/auth/success?token=${token}`);
}
