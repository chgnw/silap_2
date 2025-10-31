import { redis } from "./redis";

// Generate random 6-digit OTP
export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Save to Redis
export async function setOTP(email: string, otp: string) {
    const key = `otp:${email}`;
    await redis.set(key, otp, "EX", 300); // Expired setiap 5 menit (a.k.a dihapus dari Redis)
}

// Get OTP by email
export async function getOTP(email: string): Promise<string | null> {
    const key = `otp:${email}`;
    return await redis.get(key);
}

// Verify OTP
export async function verifyOTP(email: string, inputOtp: string): Promise<boolean> {
    const storedOtp = await getOTP(email);
    return storedOtp !== null && storedOtp === inputOtp;
}
