import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { query } from '../../../src/lib/db';
import bcrypt from 'bcryptjs';

const options = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const { email, password } = credentials || {};
        if (!email || !password) return null;
        const rows = await query('SELECT * FROM users WHERE email = ?', [email]);
        if (!rows || rows.length === 0) return null;
        const user = rows[0];
        if (!user.password) return null; // no local password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;
        // return user object that will be encoded in JWT
        return {
          id: user.id,
          email: user.email,
          name: user.full_name,
          role: user.role,
          avatar: user.avatar || null
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  },

  jwt: {
    // NEXTAUTH_SECRET is used automatically
  },

  callbacks: {
    // called when using providers (including Google). We can upsert Google user in DB here.
    async signIn({ user, account, profile, email, credentials }) {
      // If provider is google, upsert user into DB
      if (account?.provider === 'google') {
        try {
          // profile fields: profile.email, profile.name, profile.picture, profile.sub (id)
          const exists = await query('SELECT * FROM users WHERE email = ?', [profile.email]);
          if (exists.length === 0) {
            await query(
              'INSERT INTO users (full_name, email, provider, provider_id, avatar, role) VALUES (?, ?, ?, ?, ?, ?)',
              [profile.name || profile.email, profile.email, 'google', profile.sub || profile.id, profile.picture || null, 'customer']
            );
          } else {
            // update provider info if needed
            await query(
              'UPDATE users SET provider = ?, provider_id = ?, avatar = ? WHERE email = ?',
              ['google', profile.sub || profile.id, profile.picture || null, profile.email]
            );
          }
        } catch (e) {
          console.error('Google signIn upsert error', e);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account, profile }) {
      // first time jwt callback is called, attach user info
      if (user) {
        token.id = user.id || token.sub;
        token.role = user.role || token.role;
        token.name = user.name || token.name;
      }
      // if profile present (Google sign in), try to fetch user id from DB
      if (!token.id && profile?.email) {
        const rows = await query('SELECT id, role FROM users WHERE email = ?', [profile.email]);
        if (rows && rows.length) {
          token.id = rows[0].id;
          token.role = rows[0].role;
        }
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    }
  },

  secret: process.env.NEXTAUTH_SECRET
};

export default NextAuth(options);
