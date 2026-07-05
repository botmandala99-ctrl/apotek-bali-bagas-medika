import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!response.ok) {
      return new NextResponse("Failed to fetch", { status: response.status });
    }

    const text = await response.text();
    return new NextResponse(text, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new NextResponse("Fetch error: " + (error as Error).message, {
      status: 500,
    });
  }
}
