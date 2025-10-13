// app/api/avatar/proxy/route.js
import fetch from "node-fetch";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) return NextResponse.json({ error: "missing url" }, { status: 400 });

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "NextAvatarProxy/1.0" },
    });
    if (!res.ok)
      return NextResponse.json(
        { error: "fetch failed", status: res.status },
        { status: 502 }
      );

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/jpeg";

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400", // 1 gün cache
      },
    });
  } catch (err) {
    console.error("avatar proxy error", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
