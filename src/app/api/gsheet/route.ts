import { NextRequest, NextResponse } from "next/server";

// Proxy Google Sheets CSV dengan follow-redirect + timeout + caching ringan
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) return new NextResponse("Missing url parameter", { status: 400 });

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/csv,text/plain,*/*",
      },
      redirect: "follow",               // penting: ikutin 307 Google
      signal: ctrl.signal,
      cache: "no-store",    });

    clearTimeout(timer);

    if (!response.ok) {
      return new NextResponse("Failed to fetch: HTTP " + response.status, { status: response.status });
    }

    const text = await response.text();
    return new NextResponse(text, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        // cache singkat di edge (60s) biar nggak berat, tapi tetap fresh tiap refresh
        "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    const msg = (error as Error).message || "fetch error";
    return new NextResponse("Fetch error: " + msg, {
      status: msg.includes("abort") ? 504 : 500,
    });
  }
}
