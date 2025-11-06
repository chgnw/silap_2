import NextAuth, { NextAuthOptions, type Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

interface DBUser {
  id: string;
  uuid: string;
  role_id: number;
  role_name: string;
  provider: string;
  first_name: string;
  last_name?: string | null;
  email: string;
  password?: string | null;
  phone_number?: string | null;
  address?: string | null;
  points?: number;
  tier_list_id?: number | null;
  tier_list_name: string;
  current_streak?: number;
}

declare module 'next-auth/jwt' {
  interface JWT extends Partial<DBUser> {}
}

declare module 'next-auth' {
  interface Session {
    user: Omit<DBUser, 'password'>;
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
        if (!email || !password) throw new Error("Silahkan isi email dan password Anda yang terdaftar");

        var sql = `
          SELECT *
          FROM ms_users
          JOIN ms_role ON ms_users.role_id = ms_role.id
          JOIN ms_tier_list ON ms_users.tier_list_id = ms_tier_list.id
          WHERE ms_users.email = ?
          LIMIT 1;
        `
        const rows = (await query(sql, [email])) as DBUser[];
        if (!rows || rows.length === 0) {
          throw new Error("Email yang Anda masukkan tidak terdaftar");
        }

        const user = rows[0];
        console.log("user nextAuth: ", user);
        if (!user.password) {
          throw new Error("Akun ini terdaftar menggunakan Google, silakan login dengan Google.");
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error("Wrong password");
        }

        console.log('✅ Login success for', email);
        
        const { password: _, ...safeUser } = user;
        return safeUser;
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
        Object.assign(token, user);
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id,
        uuid: token.uuid,
        role_id: token.role_id,
        role_name: token.role_name,
        provider: token.provider,
        first_name: token.first_name,
        last_name: token.last_name,
        email: token.email,
        phone_number: token.phone_number,
        address: token.address,
        points: token.points,
        tier_list_id: token.tier_list_id,
        tier_list_name: token.tier_list_name,
        current_streak: token.current_streak,
      } as Session['user'];

      console.log("session user: ", session.user);
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