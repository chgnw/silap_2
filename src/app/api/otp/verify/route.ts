import { NextResponse } from "next/server";
import { verifyOTP } from "@/lib/otp";

export async function POST(req: Request) {
    try {
        const { userEmail, otp } = await req.json();

        if (!userEmail || !otp) {
            return NextResponse.json({ 
                success: false, 
                message: "Email and OTP are required" 
            }, { status: 400 });
        }

        const isValid = await verifyOTP(userEmail, otp);

        if (!isValid) {
            return NextResponse.json({ 
                success: false, 
                message: "Invalid or expired OTP" 
            }, { status: 400 });
        }

        return NextResponse.json({ 
            success: true, 
            message: "OTP verified successfully" 
        });
    } catch (err: any) {
        console.error("Error verifying OTP:", err);
        return NextResponse.json({ 
            success: false, 
            message: "Internal server error"
        }, { status: 500 });
    }
}
