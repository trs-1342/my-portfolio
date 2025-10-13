// components/GuestCallout.js
"use client";
import Link from "next/link";
import GoogleLogin from "@/components/GoogleLogin";

export default function GuestCallout() {
  return (
    <section
      className="panel"
      style={{
        background: "var(--panel)",
        border: "1px solid var(--line)",
        borderRadius: 12,
        padding: 18,
        maxWidth: 560,
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800 }}>
        <i className="fa-solid fa-lock" /> Muhattab
      </h2>
      <p style={{ margin: "10px 0 16px", color: "var(--text-2)" }}>
        Bu sayfa için oturum gerekli. Google ile hızlıca giriş yapabilirsin.
      </p>

      <div style={{ display: "grid", gap: 12, justifyItems: "center" }}>
        {/* Google tek-tık login butonun */}
        <GoogleLogin />

        {/* Yedek bağlantı (login sayfasına) */}
        <Link
          href="/login"
          className="btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "var(--panel-2)",
            border: "1px solid var(--line)",
            padding: "8px 14px",
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          <i className="fa-solid fa-right-to-bracket" />
          Giriş Sayfasına Git
        </Link>
      </div>
    </section>
  );
}
