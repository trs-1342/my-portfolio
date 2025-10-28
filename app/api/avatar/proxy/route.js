export const runtime = "nodejs";

import { NextResponse } from "next/server";

/** Google avatar URL’ini sabit boyuta çevir */
function sizeGoogle(url, size = 128) {
  try {
    const u = new URL(url);
    if (u.hostname.endsWith("googleusercontent.com")) {
      // Eğer ?sz paramı varsa güncelle
      if (u.searchParams.has("sz")) {
        u.searchParams.set("sz", String(size));
        return u.toString();
      }
      // Değilse =s{size}-c suffix’i ekle
      return `${u.toString()}=s${size}-c`;
    }
    return url;
  } catch {
    return url;
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("u");
  const sz = Number(searchParams.get("sz") ?? 128);

  if (!raw) {
    return new NextResponse("Missing u", { status: 400 });
  }

  const target = sizeGoogle(raw, Number.isFinite(sz) ? sz : 128);

  try {
    const res = await fetch(target, {
      // Bazı Google uçları UA/Accept istiyor
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return new NextResponse(`Upstream ${res.status}`, { status: 502 });
    }

    // İçeriği akıt
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const body = res.body ?? null;
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return new NextResponse("Fetch error", { status: 502 });
  }
}
