import { NextRequest, NextResponse } from "next/server";
import { locationFetch } from "@/lib/locationFetch";

const cache = new Map<string, { data: any; time: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const provinceId = searchParams.get("province_id");

    if (!provinceId) {
      return NextResponse.json(
        { error: "Province ID is required" },
        { status: 400 }
      );
    }

    const now = Date.now();
    const cached = cache.get(provinceId);

    if (cached && now - cached.time < CACHE_DURATION) {
      return NextResponse.json({
        message: "SUCCESS",
        data: cached.data,
        cached: true,
      });
    }

    const data = await locationFetch(
      `https://alamat.thecloudalert.com/api/kabkota/get/?d_provinsi_id=${provinceId}`
    );

    if (data.status === 200 && data.result) {
      cache.set(provinceId, { data: data.result, time: now });

      return NextResponse.json({
        message: "SUCCESS",
        data: data.result,
        cached: false,
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch regencies" },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Error fetching regencies:", error);
    return NextResponse.json(
      { error: "Failed to fetch regencies", detail: error.message },
      { status: 500 }
    );
  }
}
