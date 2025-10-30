import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    await redis.set("test-key", "Hello from Redis!", "EX", 60);
    const value = await redis.get("test-key");

    return NextResponse.json({
      success: true,
      message: value,
    });
  } catch (error) {
    console.error("[API] Redis test error:", error);
    return NextResponse.json({ 
      success: false,
      message: "Redis connection failed"}, { status: 500 }
    );
  }
}
