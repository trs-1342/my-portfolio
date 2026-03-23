import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import nodemailer from "nodemailer";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

/* POST /api/notify-content — yeni makale veya RSS kaynağı için abonelere email gönder */
export async function POST(req: NextRequest) {
  try {
    /* Admin session doğrula */
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

    const decoded = await adminAuth.verifyIdToken(token);
    const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
    if (!userDoc.exists || userDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
    }

    const { type, title, url, description } = await req.json() as {
      type: "article" | "rssFeed";
      title: string;
      url: string;
      description?: string;
    };

    if (!type || !title || !url) {
      return NextResponse.json({ error: "Eksik alan." }, { status: 400 });
    }

    /* Tüm kullanıcıları tara, bildirim açık olanları filtrele */
    const usersSnap = await adminDb.collection("users").get();
    const emailList: string[] = [];

    for (const doc of usersSnap.docs) {
      const data = doc.data();
      if (!data.email) continue;
      if (data.status === "banned") continue;

      const notifs = data.notifications ?? {};

      /* Master email switch — yoksa varsayılan açık */
      if (notifs.email === false) continue;

      /* İçerik türüne göre spesifik switch — yoksa varsayılan açık */
      if (type === "article"  && notifs.newArticle  === false) continue;
      if (type === "rssFeed"  && notifs.newRssFeed  === false) continue;

      emailList.push(data.email as string);
    }

    if (emailList.length === 0) {
      return NextResponse.json({ sent: 0 });
    }

    /* SMTP yapılandırılmamışsa çık */
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      return NextResponse.json({ sent: 0, note: "SMTP yapılandırılmamış." });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT ?? 587),
      secure: Number(SMTP_PORT ?? 587) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const subject =
      type === "article"
        ? `[trs] Yeni Makale: ${title}`
        : `[trs] Yeni RSS Kaynağı: ${title}`;

    const html = buildEmailHtml(type, title, url, description ?? "", req);

    let sent = 0;
    for (const email of emailList) {
      try {
        await transporter.sendMail({
          from: `"trs" <${SMTP_USER}>`,
          to: email,
          subject,
          html,
        });
        sent++;
      } catch (e) {
        console.error("notify-content email hatası:", email, e);
      }
    }

    return NextResponse.json({ sent });
  } catch (err) {
    console.error("notify-content route hatası:", err);
    return NextResponse.json({ error: "Hata oluştu." }, { status: 500 });
  }
}

function buildEmailHtml(
  type: "article" | "rssFeed",
  title: string,
  url: string,
  description: string,
  req: NextRequest,
): string {
  const icon = type === "article" ? "📝" : "📡";
  const typeLabel = type === "article" ? "Yeni Makale" : "Yeni RSS Kaynağı";
  const ctaLabel = type === "article" ? "Makaleyi Oku →" : "Kaynağa Git →";

  const origin = req.headers.get("origin") ?? req.headers.get("host") ?? "";
  const settingsUrl = origin ? `${origin}/settings` : "/settings";
  const fullUrl = url.startsWith("http") ? url : `${origin}${url}`;

  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;border-radius:12px;overflow:hidden;border:1px solid #1e293b">
      <div style="height:4px;background:#10B981"></div>
      <div style="background:#0f0f14;padding:32px">
        <p style="color:#10B981;font-size:12px;margin:0 0 10px;font-family:monospace;letter-spacing:0.1em">/hsounds</p>
        <h2 style="margin:0 0 6px;font-size:11px;color:#64748b;font-weight:500;text-transform:uppercase;letter-spacing:0.1em">${icon} ${typeLabel}</h2>
        <h1 style="margin:0 0 18px;font-size:22px;color:#f8fafc;font-weight:700;line-height:1.3">${title}</h1>
        ${description ? `<p style="color:#94a3b8;line-height:1.7;margin:0 0 24px;font-size:14px">${description.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>` : ""}
        <a href="${fullUrl}"
           style="display:inline-block;background:#10B981;color:#fff;text-decoration:none;padding:11px 24px;border-radius:8px;font-weight:600;font-size:14px">
          ${ctaLabel}
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
}
