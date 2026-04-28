import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { fetchRssPosts } from "@/lib/hsounds";

/**
 * GET /api/cron/check-rss
 *
 * Saatte bir çalışır. Her RSS kaynağını kontrol eder ve
 * yeni postları feed'in pendingPosts listesine ekler.
 * Email GÖNDERMEz — bu iş send-rss-digest cron'una aittir.
 * 30 günden eski pending postları otomatik temizler.
 */
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization") ?? "";
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
    }
  }

  try {
    const feedsDoc = await adminDb.doc("site_config/hsounds_feeds").get();
    if (!feedsDoc.exists) return NextResponse.json({ checked: 0, newPosts: 0 });

    const feeds = (feedsDoc.data()?.feeds ?? []) as Array<{
      id: string;
      source_name: string;
      feed_url: string;
      lastChecked?: string;
      lastKnownGuids?: string[];
      pendingPosts?: Array<{
        title: string; link: string; description: string;
        pubDate: string; guid: string; foundAt: string;
      }>;
    }>;

    if (feeds.length === 0) return NextResponse.json({ checked: 0, newPosts: 0 });

    const now = new Date().toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    let totalNew = 0;
    const updatedFeeds = [...feeds];

    for (let i = 0; i < feeds.length; i++) {
      const feed = feeds[i];
      if (!feed.feed_url) continue;

      const posts = await fetchRssPosts(feed.feed_url);
      if (posts.length === 0) continue;

      const knownGuids = new Set(feed.lastKnownGuids ?? []);
      const newPosts = posts.filter((p) => p.guid && !knownGuids.has(p.guid));

      // 30 günden eski pending postları temizle
      const currentPending = (feed.pendingPosts ?? []).filter(
        (p) => p.foundAt > thirtyDaysAgo
      );
      const pendingGuids = new Set(currentPending.map((p) => p.guid));

      // Yeni postları pending kuyruğuna ekle
      for (const post of newPosts) {
        if (!pendingGuids.has(post.guid)) {
          currentPending.push({
            title:       post.title,
            link:        post.link,
            description: post.description,
            pubDate:     post.pubDate,
            guid:        post.guid,
            foundAt:     now,
          });
          totalNew++;
        }
      }

      updatedFeeds[i] = {
        ...feed,
        lastChecked:    now,
        lastKnownGuids: posts.slice(0, 50).map((p) => p.guid).filter(Boolean),
        pendingPosts:   currentPending,
      };
    }

    await adminDb.doc("site_config/hsounds_feeds").update({ feeds: updatedFeeds });

    return NextResponse.json({ checked: feeds.length, newPosts: totalNew });
  } catch (err) {
    console.error("check-rss cron hatası:", err);
    return NextResponse.json({ error: "Hata oluştu." }, { status: 500 });
  }
}
