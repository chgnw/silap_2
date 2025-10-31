import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { generateOTP, setOTP } from "@/lib/otp";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();
        if (!email) {
            return NextResponse.json({ 
                success: false, 
                message: "Email is required" 
            }, { status: 400 });
        }

        const otp = generateOTP();
        await setOTP(email, otp);

        // Send email via nodemailer 
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });


        await transporter.sendMail({
            from: `"SILAP Support" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Kode OTP SILAP",
            text: `Kode ini bersifat rahasia, jangan berikan kode ini kepada siapapun. Kode OTP kamu adalah ${otp}. Kode ini hanya berlaku selama 5 menit.`,
        });

        return NextResponse.json({ 
            success: true, 
            message: "OTP sent successfully" 
        });
    } catch (err: any) {
        console.error("Error sending OTP:", err);
        return NextResponse.json({ 
            success: false, 
            message: "Failed to send OTP" 
        }, { status: 500 });
    }
}
