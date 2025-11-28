import NextAuth, { NextAuthOptions, type Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

interface DBUser {
  id: string;
  role_id: number;
  role_name: string;
  provider: string;
  first_name: string;
  last_name?: string | null;
  email: string;
  password?: string | null;
  phone_number?: string | null;
  province?: string | null,
  regency?: string | null,
  subdistrict?: string | null,
  address?: string | null;
  postal_code?: string | null;
  points?: number;
  tier_list_id?: number | null;
  tier_list_name: string;
  current_streak?: number;
  waste_target?: number;
  rememberMeFlag?: boolean;
}

declare module 'next-auth/jwt' {
  interface JWT extends Partial<DBUser> {
    exp?: number; 
    maxAge?: number;
    iat?: number;
  }
}

declare module 'next-auth' {
  interface Session {
    user: Omit<DBUser, 'password'>;
    expiresAt?: number;
  }
  interface User {
    given_name?: string;
    family_name?: string;
  }
}

function formatTimestamp(ts: number) {
  const d = new Date(ts * 1000); 
  const pad = (n: number) => n.toString().padStart(2, '0');

  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();

  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}


const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        rememberMe: { label: "Remember Me", type: "checkbox" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (!email || !password) throw new Error("Silahkan isi email dan password Anda yang terdaftar");

        var sql = `
          SELECT 
            ms_users.id AS id,
            ms_users.role_id,
            ms_role.role_name,
            ms_users.provider,
            ms_users.first_name,
            ms_users.last_name,
            ms_users.email,
            ms_users.password,
            ms_users.phone_number,
            ms_users.province,
            ms_users.regency,
            ms_users.subdistrict,
            ms_users.address,
            ms_users.postal_code,
            ms_users.points,
            ms_users.tier_list_id,
            ms_tier_list.tier_name,
            ms_users.waste_target,
            ms_users.current_streak
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
        if (!user.password) {
          throw new Error("Akun ini terdaftar menggunakan Google, silakan login dengan Google.");
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error("Wrong password");
        }

        console.log('✅ Login success for', email);
        
        const { password: _, ...safeUser } = user;
        return {
          ...safeUser,
          rememberMeFlag: credentials.rememberMe === "true",
        }
      },
    }),

    // === GOOGLE LOGIN ===
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          given_name: profile.given_name,
          family_name: profile.family_name,
          image: profile.picture,
        }
      },
    }),
  ],

  session: { 
    strategy: 'jwt',
    // maxAge ini berapa lama maksimal session valid
    // satuannya pake detik, jadi kalau mau satu hari, berarti 24 * 60 * 60 (24jam * 60menit * 60detik)
    maxAge: 7 * 24 * 60 * 60,
    // updateAge ini berapa lama session bakal di refresh kalau misalnya ada user activity
    // jadi kalau user login, terus do something, session bakal direfresh terus,
    // tapi refreshnya itu setiap 'updateAge' sekali, 60 * 60 berarti satu jam sekali
    updateAge: 60 * 60,
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        try {
          const existingUser = (await query('SELECT * FROM ms_users WHERE email = ?', [user.email])) as DBUser[];

          if (existingUser.length === 0) {
            console.log('🆕 Creating Google user:', user.email);
            await query(
              `INSERT INTO ms_users (role_id, provider, first_name, last_name, email)
               VALUES ((SELECT id FROM ms_role WHERE role_name = 'customer'), 'google', ?, ?, ?)`,
              [user.given_name, user.family_name, user.email]
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
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        if (account?.provider === 'google' && user.email) {
          console.log('🔍 Fetching Google user data from DB:', user.email);
          
          const sql = `
            SELECT 
              ms_users.id AS id,
              ms_users.role_id,
              ms_role.role_name,
              ms_users.provider,
              ms_users.first_name,
              ms_users.last_name,
              ms_users.email,
              ms_users.phone_number,
              ms_users.province,
              ms_users.regency,
              ms_users.subdistrict,
              ms_users.address,
              ms_users.postal_code,
              ms_users.points,
              ms_users.tier_list_id,
              ms_tier_list.tier_name AS tier_list_name,
              ms_users.waste_target,
              ms_users.current_streak
            FROM ms_users
            JOIN ms_role ON ms_users.role_id = ms_role.id
            LEFT JOIN ms_tier_list ON ms_users.tier_list_id = ms_tier_list.id
            WHERE ms_users.email = ?
            LIMIT 1;
          `;
          
          const rows = (await query(sql, [user.email])) as DBUser[];
          
          if (rows && rows.length > 0) {
            const dbUser = rows[0];
            Object.assign(token, {
              id: dbUser.id,
              role_id: dbUser.role_id,
              role_name: dbUser.role_name,
              provider: dbUser.provider,
              first_name: dbUser.first_name,
              last_name: dbUser.last_name,
              email: dbUser.email,
              phone_number: dbUser.phone_number,
              province: dbUser.province,
              regency: dbUser.regency,
              subdistrict: dbUser.subdistrict,
              address: dbUser.address,
              postalCode: dbUser.postal_code,
              points: dbUser.points,
              tier_list_id: dbUser.tier_list_id,
              tier_name: dbUser.tier_list_name,
              current_streak: dbUser.current_streak,
              waste_target: dbUser.waste_target,
              rememberMeFlag: false,
            });
            
            console.log('✅ Google user data loaded from DB');
          }
        } else {
          Object.assign(token, user);
        }

        const now = Math.floor(Date.now() / 1000);
        const maxAge = 'rememberMeFlag' in token && token.rememberMeFlag
          ? 7 * 24 * 60 * 60
          : 24 * 60 * 60;

        token.maxAge = maxAge;
        token.exp = now + maxAge;
        token.iat = now;
      }

      if (trigger === "update" && token.email) {
        console.log('🔄 Refreshing user data from DB:', token.email);
        
        const sql = `
          SELECT 
              ms_users.id AS id,
              ms_users.role_id,
              ms_role.role_name,
              ms_users.provider,
              ms_users.first_name,
              ms_users.last_name,
              ms_users.email,
              ms_users.phone_number,
              ms_users.province,
              ms_users.regency,
              ms_users.subdistrict,
              ms_users.address,
              ms_users.postal_code,
              ms_users.points,
              ms_users.tier_list_id,
              ms_tier_list.tier_name AS tier_list_name,
              ms_users.waste_target,
              ms_users.current_streak
          FROM ms_users
          JOIN ms_role ON ms_users.role_id = ms_role.id
          LEFT JOIN ms_tier_list ON ms_users.tier_list_id = ms_tier_list.id
          WHERE ms_users.email = ?
          LIMIT 1;
        `;
        
        const rows = (await query(sql, [token.email])) as DBUser[];
        
        if (rows && rows.length > 0) {
          const dbUser = rows[0];
          
          // Update token dengan data terbaru dari DB
          Object.assign(token, {
              id: dbUser.id,
              role_id: dbUser.role_id,
              role_name: dbUser.role_name,
              provider: dbUser.provider,
              first_name: dbUser.first_name,
              last_name: dbUser.last_name,
              email: dbUser.email,
              phone_number: dbUser.phone_number,
              province: dbUser.province,
              regency: dbUser.regency,
              subdistrict: dbUser.subdistrict,
              address: dbUser.address,
              postal_code: dbUser.postal_code,
              points: dbUser.points,
              tier_list_id: dbUser.tier_list_id,
              tier_name: dbUser.tier_list_name,
              current_streak: dbUser.current_streak,
              waste_target: dbUser.waste_target,
          });
          
          console.log('✅ User data refreshed from DB');
        }
      }

      return token;
    },

    async session({ session, token }) {
      // console.log("token: ", token);
      session.user = {
        id: token.id,
        role_id: token.role_id,
        role_name: token.role_name,
        provider: token.provider,
        first_name: token.first_name,
        last_name: token.last_name,
        email: token.email,
        phone_number: token.phone_number,
        province: token.province,
        regency: token.regency,
        subdistrict: token.subdistrict,
        address: token.address,
        postal_code: token.postal_code,
        points: token.points,
        tier_list_id: token.tier_list_id,
        tier_list_name: token.tier_name,
        current_streak: token.current_streak,
        waste_target: token.waste_target,
        rememberMeFlag: token.rememberMeFlag,
      } as Session['user'];

      // Hitung expiry based on iat + maxAge yang disimpen
      const now = Math.floor(Date.now() / 1000);
      const iat = typeof token.iat === 'number' ? token.iat : now;
      const maxAge = typeof token.maxAge === 'number' ? token.maxAge : 24 * 60 * 60;
      const exp = iat + maxAge;
      
      session.expiresAt = exp;

      // console.log("🕒 Token Exp:", formatTimestamp(exp));
      // console.log("📅 Duration (days):", maxAge / (24 * 60 * 60));
      // console.log("⏰ IAT:", formatTimestamp(iat));

      // console.log("session user : ", session.user);
      return session;
    },
  },

  pages: {
    // Session expired bakal redirect kesini
    signIn: '/login', 
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };