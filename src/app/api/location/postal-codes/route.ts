import { NextRequest, NextResponse } from "next/server";

const cache = new Map<string, { data: any; time: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const village = searchParams.get("village");
    const province = searchParams.get("province");
    const regency = searchParams.get("regency");
    const subdistrict = searchParams.get("subdistrict");

    if (!village) {
      return NextResponse.json(
        { error: "Village name is required" },
        { status: 400 }
      );
    }

    const cacheKey = `${province}-${regency}-${subdistrict}-${village}`;
    const now = Date.now();
    const cached = cache.get(cacheKey);

    // Return cached data if available and fresh
    if (cached && now - cached.time < CACHE_DURATION) {
      return NextResponse.json({
        message: "SUCCESS",
        data: cached.data,
        cached: true,
      });
    }

    const res = await fetch(
      `https://alamat.thecloudalert.com/api/cari/index/?keyword=${encodeURIComponent(
        village
      )}`
    );
    const data = await res.json();

    if (data.status === 200 && data.result && data.result.length > 0) {
      const matchedResults = data.result.filter(
        (item: any) =>
          (!province || item.provinsi === province) &&
          (!regency || item.kabkota === regency) &&
          (!subdistrict || item.kecamatan === subdistrict) &&
          item.desakel === village
      );

      if (matchedResults.length > 0) {
        const postalCodes = [
          ...new Set(matchedResults.map((item: any) => item.kodepos)),
        ];

        cache.set(cacheKey, { data: postalCodes, time: now });

        return NextResponse.json({
          message: "SUCCESS",
          data: postalCodes,
          cached: false,
        });
      }
    }

    return NextResponse.json({
      message: "SUCCESS",
      data: [],
      cached: false,
    });
  } catch (error: any) {
    console.error("Error fetching postal codes:", error);
    return NextResponse.json(
      { error: "Failed to fetch postal codes", detail: error.message },
      { status: 500 }
    );
  }
}
