import { NextRequest, NextResponse } from "next/server";

const cache = new Map<string, { data: any; time: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const regencyId = searchParams.get("regency_id");

    if (!regencyId) {
      return NextResponse.json(
        { error: "Regency ID is required" },
        { status: 400 }
      );
    }

    const now = Date.now();
    const cached = cache.get(regencyId);

    // Return cached data if available and fresh
    if (cached && now - cached.time < CACHE_DURATION) {
      return NextResponse.json({
        message: "SUCCESS",
        data: cached.data,
        cached: true,
      });
    }

    const res = await fetch(
      `https://alamat.thecloudalert.com/api/kecamatan/get/?d_kabkota_id=${regencyId}`
    );
    const data = await res.json();

    if (data.status === 200 && data.result) {
      cache.set(regencyId, { data: data.result, time: now });

      return NextResponse.json({
        message: "SUCCESS",
        data: data.result,
        cached: false,
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch districts" },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Error fetching districts:", error);
    return NextResponse.json(
      { error: "Failed to fetch districts", detail: error.message },
      { status: 500 }
    );
  }
}
