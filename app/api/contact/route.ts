import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const CATEGORY_LABELS: Record<string, string> = {
  hi:       "💬 Sadece Selam",
  feedback: "💡 Geri Bildirim",
  rec:      "💡 Öneri",
  collab:   "🤝 İşbirliği / Proje",
  bug:      "🐛 Hata Bildirimi",
};

/* POST /api/contact — mesajı Firestore'a kaydet + email gönder */
export async function POST(req: NextRequest) {
  try {
    const { name, email, category, message } = await req.json();
    if (!name || !email || !category || !message) {
      return NextResponse.json({ error: "Eksik alan." }, { status: 400 });
    }

    /* Firestore'a kaydet */
    await adminDb.collection("contacts").add({
      name, email, category, message,
      createdAt: FieldValue.serverTimestamp(),
      read: false,
    });

    /* SMTP yapılandırılmışsa email gönder */
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_TO } = process.env;
    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT ?? 587),
        secure: Number(SMTP_PORT ?? 587) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });

      const categoryLabel = CATEGORY_LABELS[category] ?? category;

      await transporter.sendMail({
        from: `"mnp Contact" <${SMTP_USER}>`,
        to:   SMTP_TO ?? SMTP_USER,
        subject: `[mnp] ${categoryLabel} — ${name}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
            <h2 style="color:#10B981;margin-bottom:4px">Yeni Mesaj</h2>
            <p style="color:#888;font-size:13px;margin-top:0">${categoryLabel}</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
              <tr><td style="padding:8px 0;color:#888;font-size:13px;width:80px">Ad</td>
                  <td style="padding:8px 0;font-weight:600">${name}</td></tr>
              <tr><td style="padding:8px 0;color:#888;font-size:13px">Email</td>
                  <td style="padding:8px 0"><a href="mailto:${email}" style="color:#10B981">${email}</a></td></tr>
            </table>
            <div style="background:#f4f4f5;border-radius:8px;padding:16px;white-space:pre-wrap;font-size:14px;line-height:1.7">
              ${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
            </div>
          </div>
        `,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("contact route error:", err);
    return NextResponse.json({ error: "Gönderim başarısız." }, { status: 500 });
  }
}
