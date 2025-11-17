// app/hsounds/rss.xml/route.ts
import { NextResponse } from "next/server";
import { hsoundsPosts } from "@/data/hsoundsPosts";

const SITE_URL = "https://hattab.vercel.app";

export async function GET() {
    const itemsXml = hsoundsPosts
        .sort((a, b) => (a.date < b.date ? 1 : -1)) // yeni postlar önce
        .map((post) => {
            const postUrl = `${SITE_URL}/hsounds`; // ileride detay sayfa açarsan: `/hsounds/${post.slug}` yaparsın

            return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid>${postUrl}#${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.summary)}</description>
    </item>`;
        })
        .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>HSounds - Halil Hattab</title>
    <link>${SITE_URL}/hsounds</link>
    <description>Halil Hattab'ın projeleri, fikirleri ve duyuruları</description>
    <language>tr-tr</language>
${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(xml, {
        status: 200,
        headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
        },
    });
}

// Küçük helper, aynı dosyada yaz
function escapeXml(unsafe: string) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}
