import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { RSS_CATEGORIES, RSS_CATEGORY_MAP } from "@/lib/rss-categories";
import nodemailer from "nodemailer";

/**
 * GET /api/cron/send-rss-digest
 *
 * Her gün 08:00 UTC'de çalışır.
 * Kullanıcının sıklık tercihine (daily/weekly) göre
 * digest gönderilip gönderilmeyeceğini kontrol eder ve
 * tek bir güzel özet email'i gönderir.
 * sendSeparately=true feed'leri kendi ayrı emaillerinde gider.
 */
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization") ?? "";
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
    }
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return NextResponse.json({ error: "SMTP yapılandırması eksik." }, { status: 500 });
  }

  try {
    /* Global RSS email switch'ini kontrol et */
    const notifDoc = await adminDb.doc("site_config/notifications").get();
    const rssEmailEnabled = notifDoc.data()?.rssEmailEnabled ?? true;
    if (!rssEmailEnabled) {
      return NextResponse.json({ skipped: true, reason: "Global RSS email kapalı." });
    }

    /* Tüm feed'leri ve pending postları çek */
    const feedsDoc = await adminDb.doc("site_config/hsounds_feeds").get();
    const feeds = (feedsDoc.data()?.feeds ?? []) as Array<{
      id: string;
      source_name: string;
      source_icon: string;
      feed_url: string;
      category?: string;
      sendSeparately?: boolean;
      pendingPosts?: Array<{
        title: string; link: string; description: string;
        pubDate: string; guid: string; foundAt: string;
      }>;
    }>;

    /* Pending post olan feed'leri filtrele */
    const activeFeedsWithPosts = feeds.filter((f) => (f.pendingPosts?.length ?? 0) > 0);
    if (activeFeedsWithPosts.length === 0) {
      return NextResponse.json({ sent: 0, skipped: 0, reason: "Bekleyen post yok." });
    }

    /* Email gönderecek kullanıcıları çek */
    const usersSnap = await adminDb.collection("users").get();
    const now = new Date();
    let sentCount = 0;
    let skippedCount = 0;

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT ?? 587),
      secure: Number(SMTP_PORT ?? 587) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    const settingsUrl = `${origin}/settings`;

    for (const userDoc of usersSnap.docs) {
      const user = userDoc.data();

      /* Temel filtreler */
      if (!user.email) continue;
      if (user.status === "banned") continue;
      if (user.features?.rss === false) continue;
      if (user.notifications?.email === false) continue;
      if (user.notifications?.newRssPost === false) continue;

      const prefs = user.rssPreferences ?? { frequency: "weekly", categories: {}, lastDigestSent: undefined };
      const frequency: "daily" | "weekly" = prefs.frequency ?? "weekly";
      const lastSent = prefs.lastDigestSent ? new Date(prefs.lastDigestSent) : new Date(0);
      const hoursSinceLast = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);

      /* Sıklık kontrolü */
      const isDue =
        (frequency === "daily"  && hoursSinceLast >= 23) ||
        (frequency === "weekly" && hoursSinceLast >= 167); // 7 gün - 1 saat tolerans

      if (!isDue) { skippedCount++; continue; }

      /* Kullanıcının etkin kategorileri */
      const catPrefs: Record<string, boolean> = prefs.categories ?? {};
      const isCatEnabled = (catId?: string) => {
        if (!catId) return true; // kategori atanmamış → gönder
        return catPrefs[catId] !== false; // eksik = true = etkin
      };

      /* Pending postları topla: son digest'ten sonra eklenenler */
      interface DigestEntry {
        feedName: string;
        feedIcon: string;
        feedId: string;
        sendSeparately: boolean;
        category?: string;
        posts: Array<{ title: string; link: string; description: string; pubDate: string }>;
      }

      const entries: DigestEntry[] = [];

      for (const feed of activeFeedsWithPosts) {
        if (!isCatEnabled(feed.category)) continue;

        const newPosts = (feed.pendingPosts ?? []).filter(
          (p) => new Date(p.foundAt) > lastSent
        );
        if (newPosts.length === 0) continue;

        entries.push({
          feedName:       feed.source_name,
          feedIcon:       feed.source_icon || "🌐",
          feedId:         feed.id,
          sendSeparately: feed.sendSeparately ?? false,
          category:       feed.category,
          posts:          newPosts.map(({ title, link, description, pubDate }) => ({
            title, link, description, pubDate,
          })),
        });
      }

      if (entries.length === 0) { skippedCount++; continue; }

      /* sendSeparately olanları ayır */
      const separateEntries = entries.filter((e) => e.sendSeparately);
      const combinedEntries = entries.filter((e) => !e.sendSeparately);

      /* Ayrı email'ler */
      for (const entry of separateEntries) {
        const subject = `[trs] ${entry.feedName} — ${entry.posts.length} yeni yazı`;
        const html = buildSeparateDigestHtml({ entry, settingsUrl, frequency });
        await sendMail(transporter, SMTP_USER, user.email as string, subject, html);
        sentCount++;
      }

      /* Kombine digest */
      if (combinedEntries.length > 0) {
        const totalPosts = combinedEntries.reduce((s, e) => s + e.posts.length, 0);
        const freqLabel = frequency === "daily" ? "Günlük" : "Haftalık";
        const subject = `[trs] ${freqLabel} RSS Özeti — ${totalPosts} yeni yazı`;
        const html = buildCombinedDigestHtml({ entries: combinedEntries, settingsUrl, frequency });
        await sendMail(transporter, SMTP_USER, user.email as string, subject, html);
        sentCount++;
      }

      /* Kullanıcının lastDigestSent güncelle */
      await adminDb.doc(`users/${userDoc.id}`).update({
        "rssPreferences.lastDigestSent": now.toISOString(),
      });
    }

    return NextResponse.json({ sent: sentCount, skipped: skippedCount });
  } catch (err) {
    console.error("send-rss-digest cron hatası:", err);
    return NextResponse.json({ error: "Hata oluştu." }, { status: 500 });
  }
}

/* ── Email gönderici yardımcı ── */

async function sendMail(
  transporter: ReturnType<typeof nodemailer.createTransport>,
  from: string,
  to: string,
  subject: string,
  html: string,
) {
  try {
    await transporter.sendMail({ from: `"trs" <${from}>`, to, subject, html });
  } catch (e) {
    console.error("RSS digest email hatası:", to, e);
  }
}

/* ── Kombine digest HTML ── */

function buildCombinedDigestHtml({
  entries,
  settingsUrl,
  frequency,
}: {
  entries: Array<{
    feedName: string;
    feedIcon: string;
    category?: string;
    posts: Array<{ title: string; link: string; description: string; pubDate: string }>;
  }>;
  settingsUrl: string;
  frequency: "daily" | "weekly";
}) {
  const freqLabel = frequency === "daily" ? "Günlük" : "Haftalık";
  const totalPosts = entries.reduce((s, e) => s + e.posts.length, 0);

  /* Postları kategoriye göre grupla */
  const categoryOrder: string[] = RSS_CATEGORIES.map((c) => c.id);
  type CatGroup = { catLabel: string; items: Array<{ feedName: string; post: { title: string; link: string; description: string } }> };
  const catMap = new Map<string, CatGroup>();

  for (const entry of entries) {
    const catKey = entry.category ?? "__uncategorized__";
    const catLabel = entry.category
      ? (RSS_CATEGORY_MAP[entry.category]?.label ?? entry.category)
      : "Diğer";

    if (!catMap.has(catKey)) catMap.set(catKey, { catLabel, items: [] });
    for (const post of entry.posts) {
      catMap.get(catKey)!.items.push({ feedName: entry.feedName, post });
    }
  }

  /* Kategori sırasına göre sırala */
  const sortedGroups = [...catMap.entries()].sort(([a], [b]) => {
    const ai = a === "__uncategorized__" ? 999 : categoryOrder.indexOf(a);
    const bi = b === "__uncategorized__" ? 999 : categoryOrder.indexOf(b);
    return ai - bi;
  });

  const groupsHtml = sortedGroups.map(([, { catLabel, items }]) => `
    <div style="margin-bottom:28px">
      <p style="margin:0 0 10px;font-size:11px;color:#10B981;font-family:monospace;text-transform:uppercase;letter-spacing:0.1em">
        ${escHtml(catLabel)}
      </p>
      ${items.map(({ feedName, post }) => `
        <div style="border-left:2px solid #1e293b;padding:10px 0 10px 16px;margin-bottom:10px">
          <a href="${escHtml(post.link)}" style="color:#f8fafc;font-size:0.92rem;font-weight:600;text-decoration:none;line-height:1.4;display:block;margin-bottom:4px">
            ${escHtml(post.title)}
          </a>
          ${post.description ? `<p style="color:#94a3b8;font-size:0.8rem;line-height:1.6;margin:0 0 4px">${escHtml(post.description.slice(0, 180))}…</p>` : ""}
          <span style="color:#475569;font-size:0.72rem;font-family:monospace">${escHtml(feedName)}</span>
        </div>
      `).join("")}
    </div>
  `).join("");

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;border-radius:12px;overflow:hidden;border:1px solid #1e293b">
      <div style="height:4px;background:linear-gradient(90deg,#10B981,#0ea5e9)"></div>
      <div style="background:#0f0f14;padding:32px">
        <p style="color:#10B981;font-size:11px;margin:0 0 6px;font-family:monospace;letter-spacing:0.1em">/hsounds · rss digest</p>
        <h1 style="margin:0 0 4px;font-size:22px;color:#f8fafc;font-weight:700">📡 ${freqLabel} RSS Özeti</h1>
        <p style="color:#64748b;font-size:13px;margin:0 0 28px">${totalPosts} yeni yazı · ${new Date().toLocaleDateString("tr-TR", { day:"numeric", month:"long", year:"numeric" })}</p>

        ${groupsHtml}

        <hr style="border:none;border-top:1px solid #1e293b;margin:24px 0">
        <p style="color:#475569;font-size:12px;margin:0;line-height:1.6">
          Kategori tercihlerini değiştirmek için
          <a href="${settingsUrl}" style="color:#10B981;text-decoration:none">ayarlar</a>
          sayfasını ziyaret et.
        </p>
      </div>
    </div>
  `;
}

/* ── Ayrı digest HTML (sendSeparately feed'ler) ── */

function buildSeparateDigestHtml({
  entry,
  settingsUrl,
  frequency,
}: {
  entry: {
    feedName: string;
    feedIcon: string;
    posts: Array<{ title: string; link: string; description: string; pubDate: string }>;
  };
  settingsUrl: string;
  frequency: "daily" | "weekly";
}) {
  const freqLabel = frequency === "daily" ? "Günlük" : "Haftalık";

  const postsHtml = entry.posts.map((post) => `
    <div style="border-left:2px solid #10B981;padding:10px 0 10px 16px;margin-bottom:12px">
      <a href="${escHtml(post.link)}" style="color:#f8fafc;font-size:0.92rem;font-weight:600;text-decoration:none;line-height:1.4;display:block;margin-bottom:4px">
        ${escHtml(post.title)}
      </a>
      ${post.description ? `<p style="color:#94a3b8;font-size:0.8rem;line-height:1.6;margin:0">${escHtml(post.description.slice(0, 200))}…</p>` : ""}
    </div>
  `).join("");

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;border-radius:12px;overflow:hidden;border:1px solid #1e293b">
      <div style="height:4px;background:#10B981"></div>
      <div style="background:#0f0f14;padding:32px">
        <p style="color:#10B981;font-size:11px;margin:0 0 6px;font-family:monospace;letter-spacing:0.1em">/hsounds · ${escHtml(entry.feedName)}</p>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:4px">
          <span style="font-size:1.8rem">${entry.feedIcon}</span>
          <h1 style="margin:0;font-size:20px;color:#f8fafc;font-weight:700">${escHtml(entry.feedName)}</h1>
        </div>
        <p style="color:#64748b;font-size:13px;margin:0 0 28px">${freqLabel} Özet · ${entry.posts.length} yeni yazı</p>

        ${postsHtml}

        <hr style="border:none;border-top:1px solid #1e293b;margin:24px 0">
        <p style="color:#475569;font-size:12px;margin:0;line-height:1.6">
          Tercihlerini değiştirmek için
          <a href="${settingsUrl}" style="color:#10B981;text-decoration:none">ayarlar</a>
          sayfasını ziyaret et.
        </p>
      </div>
    </div>
  `;
}

function escHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
