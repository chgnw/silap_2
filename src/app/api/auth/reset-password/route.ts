import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ 
                message: "Email dan kata sandi wajib diisi." 
            }, { status: 400 });
        }

        // Cari user berdasarkan email
        const users = await query("SELECT id FROM ms_users WHERE email = ?", [email]);
        if (!users || users.length === 0) {
            return NextResponse.json({ 
                message: "Akun tidak ditemukan." 
            }, { status: 404 });
        }
        const userId = users[0].id;

        // Hash password baru
        const hashed = await bcrypt.hash(password, 10);
        await query("UPDATE ms_users SET password = ? WHERE id = ?", [hashed, userId]);

        return NextResponse.json({ 
            message: "Kata sandi berhasil diperbarui." 
        }, { status: 200 });
    } catch (error: any) {
        console.error("❌ Reset password error:", error);
        return NextResponse.json({ 
            message: "Terjadi kesalahan server." 
        }, { status: 500 });
    }
}
