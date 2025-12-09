import { NextRequest, NextResponse } from "next/server";

const cache = new Map<string, { data: any; time: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const districtId = searchParams.get("district_id");

    if (!districtId) {
      return NextResponse.json(
        { error: "District ID is required" },
        { status: 400 }
      );
    }

    const now = Date.now();
    const cached = cache.get(districtId);

    if (cached && now - cached.time < CACHE_DURATION) {
      return NextResponse.json({
        message: "SUCCESS",
        data: cached.data,
        cached: true,
      });
    }

    const res = await fetch(
      `https://alamat.thecloudalert.com/api/kelurahan/get/?d_kecamatan_id=${districtId}`
    );
    const data = await res.json();

    if (data.status === 200 && data.result) {
      cache.set(districtId, { data: data.result, time: now });

      return NextResponse.json({
        message: "SUCCESS",
        data: data.result,
        cached: false,
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch villages" },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Error fetching villages:", error);
    return NextResponse.json(
      { error: "Failed to fetch villages", detail: error.message },
      { status: 500 }
    );
  }
}
