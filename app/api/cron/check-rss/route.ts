import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { fetchRssPosts } from "@/lib/hsounds";
import nodemailer from "nodemailer";

/**
 * GET /api/cron/check-rss
 *
 * Vercel Cron Job tarafından saatte bir çağrılır.
 * Her RSS kaynağını kontrol eder, yeni yazı varsa
 * `newRssPost` bildirimi açık olan kullanıcılara email gönderir.
 *
 * Güvenlik: CRON_SECRET env değişkeni ile doğrulama.
 * Vercel otomatik olarak Authorization: Bearer <secret> header gönderir.
 */
export async function GET(req: NextRequest) {
  /* Cron doğrulama */
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization") ?? "";
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
    }
  }

  try {
    /* Feed listesini Firestore'dan çek */
    const feedsDoc = await adminDb.doc("site_config/hsounds_feeds").get();
    if (!feedsDoc.exists) return NextResponse.json({ checked: 0, newPosts: 0 });

    const feeds = (feedsDoc.data()?.feeds ?? []) as Array<{
      id: string;
      source_name: string;
      source_icon: string;
      feed_url: string;
      lastChecked?: string;
      lastKnownGuids?: string[];
    }>;

    if (feeds.length === 0) return NextResponse.json({ checked: 0, newPosts: 0 });

    /* Bildirim alacak kullanıcı emaillerini hazırla */
    const subscriberEmails = await getSubscriberEmails();

    const origin = req.headers.get("origin") ?? req.headers.get("host") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";

    let totalNew = 0;
    const updatedFeeds = [...feeds];

    for (let i = 0; i < feeds.length; i++) {
      const feed = feeds[i];
      if (!feed.feed_url) continue;

      const posts = await fetchRssPosts(feed.feed_url);
      if (posts.length === 0) continue;

      const knownGuids = new Set(feed.lastKnownGuids ?? []);
      const newPosts = posts.filter((p) => p.guid && !knownGuids.has(p.guid));

      if (newPosts.length > 0 && subscriberEmails.length > 0) {
        /* En fazla ilk 3 yeni yazı için bildirim gönder (spam önleme) */
        for (const post of newPosts.slice(0, 3)) {
          await sendRssPostEmail({
            feedName: feed.source_name,
            postTitle: post.title,
            postUrl: post.link,
            postDesc: post.description,
            emails: subscriberEmails,
            origin,
          });
          totalNew++;
        }
      }

      /* Feed'in son kontrol zamanı ve bilinen GUID'leri güncelle */
      updatedFeeds[i] = {
        ...feed,
        lastChecked: new Date().toISOString(),
        lastKnownGuids: posts.slice(0, 50).map((p) => p.guid).filter(Boolean),
      };
    }

    /* Güncellenmiş feed listesini Firestore'a yaz */
    await adminDb.doc("site_config/hsounds_feeds").update({ feeds: updatedFeeds });

    return NextResponse.json({ checked: feeds.length, newPosts: totalNew });
  } catch (err) {
    console.error("check-rss cron hatası:", err);
    return NextResponse.json({ error: "Hata oluştu." }, { status: 500 });
  }
}

/* newRssPost bildirimi açık olan kullanıcıların email listesini döndürür */
async function getSubscriberEmails(): Promise<string[]> {
  const usersSnap = await adminDb.collection("users").get();
  const emails: string[] = [];

  for (const doc of usersSnap.docs) {
    const data = doc.data();
    if (!data.email) continue;
    if (data.status === "banned") continue;

    const notifs = data.notifications ?? {};
    if (notifs.email === false) continue;
    if (notifs.newRssPost === false) continue;

    emails.push(data.email as string);
  }

  return emails;
}

async function sendRssPostEmail({
  feedName,
  postTitle,
  postUrl,
  postDesc,
  emails,
  origin,
}: {
  feedName: string;
  postTitle: string;
  postUrl: string;
  postDesc: string;
  emails: string[];
  origin: string;
}) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 587),
    secure: Number(SMTP_PORT ?? 587) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const settingsUrl = origin ? `${origin}/settings` : "/settings";
  const fullUrl = postUrl.startsWith("http") ? postUrl : `${origin}${postUrl}`;

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;border-radius:12px;overflow:hidden;border:1px solid #1e293b">
      <div style="height:4px;background:#10B981"></div>
      <div style="background:#0f0f14;padding:32px">
        <p style="color:#10B981;font-size:12px;margin:0 0 10px;font-family:monospace;letter-spacing:0.1em">/hsounds · ${feedName}</p>
        <h2 style="margin:0 0 6px;font-size:11px;color:#64748b;font-weight:500;text-transform:uppercase;letter-spacing:0.1em">📡 Yeni RSS Yazısı</h2>
        <h1 style="margin:0 0 18px;font-size:22px;color:#f8fafc;font-weight:700;line-height:1.3">${postTitle.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</h1>
        ${postDesc ? `<p style="color:#94a3b8;line-height:1.7;margin:0 0 24px;font-size:14px">${postDesc.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>` : ""}
        <a href="${fullUrl}"
           style="display:inline-block;background:#10B981;color:#fff;text-decoration:none;padding:11px 24px;border-radius:8px;font-weight:600;font-size:14px">
          Yazıyı Oku →
        </a>
        <hr style="border:none;border-top:1px solid #1e293b;margin:28px 0">
        <p style="color:#475569;font-size:12px;margin:0;line-height:1.6">
          Bu bildirimi almak istemiyorsanız
          <a href="${settingsUrl}" style="color:#10B981;text-decoration:none">ayarlar</a>
          sayfasından kapatabilirsiniz.
        </p>
      </div>
    </div>
  `;

  for (const email of emails) {
    try {
      await transporter.sendMail({
        from: `"trs" <${SMTP_USER}>`,
        to: email,
        subject: `[trs] ${feedName}: ${postTitle}`,
        html,
      });
    } catch (e) {
      console.error("RSS email hatası:", email, e);
    }
  }
}
