import { NextRequest, NextResponse } from "next/server";

// Simple in-memory cache (dalam production, gunakan Redis)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Parameter lat dan lon diperlukan" },
        { status: 400 }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: "Format koordinat tidak valid" },
        { status: 400 }
      );
    }

    const cacheKey = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;

    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data, {
        headers: {
          "X-Cache": "HIT",
        },
      });
    }

    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`;

    const response = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "Silap/1.0 (https://github.com/your-repo)",
        "Accept-Language": "id",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      if (response.status === 503) {
        return NextResponse.json(
          { error: "Layanan geocoding sedang sibuk, coba lagi nanti" },
          { status: 503 }
        );
      }
      throw new Error(`Nominatim error: ${response.status}`);
    }

    const data = await response.json();

    cache.set(cacheKey, { data, timestamp: Date.now() });

    if (cache.size > 1000) {
      const now = Date.now();
      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          cache.delete(key);
        }
      }
    }

    return NextResponse.json(data, {
      headers: {
        "X-Cache": "MISS",
      },
    });
  } catch (error: any) {
    console.error("Geocode proxy error:", error);

    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return NextResponse.json(
        { error: "Request timeout, coba lagi nanti" },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "Gagal mendapatkan data lokasi" },
      { status: 500 }
    );
  }
}