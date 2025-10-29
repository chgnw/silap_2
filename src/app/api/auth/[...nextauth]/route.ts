import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

interface DBUser {
  id: number;
  uuid: string;
  email: string;
  first_name: string;
  last_name?: string | null;
  password?: string | null;
  role_id: number;
  provider: string;
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: number;
    uuid?: string;
    role_id?: number;
    provider?: string;
  }
}

declare module 'next-auth' {
  interface Session {
    user: {
      id?: number;
      uuid?: string;
      role_id?: number;
      provider?: string;
      email?: string | null;
      name?: string | null;
    };
  }
}

const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (!email || !password) return null;

        // cari user di ms_users
        const rows = (await query('SELECT * FROM ms_users WHERE email = ? LIMIT 1', [email])) as DBUser[];
        if (!rows || rows.length === 0) {
          console.log('❌ User not found');
          return null;
        }

        const user = rows[0];
        if (!user.password) {
          console.log('❌ User has no password (likely Google login)');
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          console.log('❌ Invalid password for', email);
          return null;
        }

        console.log('✅ Login success for', email);

        return {
          id: String(user.id),
          uuid: user.uuid,
          email: user.email,
          name: `${user.first_name} ${user.last_name || ''}`.trim(),
          role_id: user.role_id,
          provider: user.provider,
        };
      },
    }),

    // === GOOGLE LOGIN ===
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        try {
          const existingUser = (await query('SELECT * FROM ms_users WHERE email = ?', [user.email])) as DBUser[];

          if (existingUser.length === 0) {
            console.log('🆕 Creating Google user:', user.email);
            await query(
              `INSERT INTO ms_users (role_id, provider, first_name, email)
               VALUES ((SELECT id FROM ms_role WHERE role_name = 'customer'), 'google', ?, ?)`,
              [user.name, user.email]
            );
          } else {
            console.log('✅ Google user already exists:', user.email);
          }
        } catch (error) {
          console.error('Error during Google sign-in:', error);
          return false;
        }
      }
      return true;
    },

    // Set JWT 
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.uuid = (user as any).uuid;
        token.role_id = (user as any).role_id;
        token.provider = (user as any).provider;
      }
      return token;
    },

    // Set session untuk user
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.uuid = token.uuid;
        session.user.role_id = token.role_id;
        session.user.provider = token.provider;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };