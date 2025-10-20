import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

const handler = NextAuth({
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
                if (!user.password) return null;

                const isValid = await bcrypt.compare(password, user.password);
                if (!isValid) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.full_name,
                    role: user.role,
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
    },
    callbacks: {
        async signIn({ user, account, profile }) {
        if (account.provider === 'google') {
            try {
            const existingUser = await query('SELECT * FROM users WHERE email = ?', [user.email]);
            
            if (existingUser.length === 0) {
                await query(
                    'INSERT INTO users (full_name, email, provider, provider_id, avatar, role) VALUES (?, ?, ?, ?, ?, ?)',
                    [user.name, user.email, 'google', user.id, user.image, 'customer']
                );
            }
            } catch (error) {
                console.error("Error during Google sign-in:", error);
                return false; 
            }
        }
        return true; 
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET
});

export { handler as GET, handler as POST };