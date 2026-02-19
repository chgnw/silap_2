import { NextResponse } from "next/server";
import { locationFetch } from "@/lib/locationFetch";

let cachedProvinces: any = null;
let cacheTime: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export async function GET() {
  try {
    const now = Date.now();

    if (cachedProvinces && now - cacheTime < CACHE_DURATION) {
      return NextResponse.json({
        message: "SUCCESS",
        data: cachedProvinces,
        cached: true,
      });
    }

    const data = await locationFetch(
      "https://alamat.thecloudalert.com/api/provinsi/get/"
    );

    if (data.status === 200 && data.result) {
      cachedProvinces = data.result;
      cacheTime = now;

      return NextResponse.json({
        message: "SUCCESS",
        data: data.result,
        cached: false,
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch provinces" },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Error fetching provinces:", error);
    return NextResponse.json(
      { error: "Failed to fetch provinces", detail: error.message },
      { status: 500 }
    );
  }
}
