import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { adminAuth } from "@/lib/firebase-admin";

/**
 * POST /api/admin/notify-new-user
 * Yeni kullanıcı kaydında admin emailine bildirim gönderir.
 * Authorization: Bearer <id-token> (yeni kayıt olan kullanıcının token'ı)
 */
export async function POST(req: NextRequest) {
  try {
    /* Token doğrula — herhangi bir geçerli kullanıcı çağırabilir */
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

    try {
      await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: "Geçersiz token." }, { status: 401 });
    }

    const { username, email, displayName } = await req.json() as {
      username: string;
      email: string;
      displayName?: string;
    };

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      /* SMTP yapılandırılmamışsa sessizce geç */
      return NextResponse.json({ ok: true, sent: false });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT ?? 587),
      secure: Number(SMTP_PORT ?? 587) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const origin = req.headers.get("origin") ?? `https://${req.headers.get("host")}`;
    const adminUrl = `${origin}/admin/users`;

    const html = `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;border-radius:12px;overflow:hidden;border:1px solid #1e293b">
        <div style="height:4px;background:#10B981"></div>
        <div style="background:#0f0f14;padding:32px">
          <p style="color:#10B981;font-size:12px;margin:0 0 12px;font-family:monospace;letter-spacing:0.1em">/admin/users</p>
          <h1 style="margin:0 0 20px;font-size:20px;color:#f8fafc;font-weight:700">Yeni Kullanıcı Kaydı</h1>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <tr>
              <td style="padding:8px 0;color:#64748b;font-size:13px;width:120px">Username</td>
              <td style="padding:8px 0;color:#f8fafc;font-size:13px;font-weight:600">@${username}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#64748b;font-size:13px">Email</td>
              <td style="padding:8px 0;color:#f8fafc;font-size:13px">${email}</td>
            </tr>
            ${displayName ? `
            <tr>
              <td style="padding:8px 0;color:#64748b;font-size:13px">İsim</td>
              <td style="padding:8px 0;color:#f8fafc;font-size:13px">${displayName}</td>
            </tr>` : ""}
            <tr>
              <td style="padding:8px 0;color:#64748b;font-size:13px">Durum</td>
              <td style="padding:8px 0;color:#f59e0b;font-size:13px;font-weight:600">Onay Bekliyor</td>
            </tr>
          </table>
          <a href="${adminUrl}"
             style="display:inline-block;background:#10B981;color:#fff;text-decoration:none;padding:11px 24px;border-radius:8px;font-weight:600;font-size:14px">
            Admin Paneline Git →
          </a>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"trs" <${SMTP_USER}>`,
      to: SMTP_USER,
      subject: `[trs] Yeni Kayıt: @${username}`,
      html,
    });

    return NextResponse.json({ ok: true, sent: true });
  } catch (err) {
    console.error("notify-new-user hatası:", err);
    return NextResponse.json({ error: "Hata oluştu." }, { status: 500 });
  }
}
