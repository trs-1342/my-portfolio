// app/login/page.js
import Link from "next/link";
import GoogleLogin from "@/components/GoogleLogin";
export const metadata = { title: "Giriş Yap — Halil Hattab" };

export default function LoginPage() {
  return (
    <main className="auth-container">
      <section className="auth-card">
        <h1 className="auth-title">Giriş Yap</h1>
        <p className="auth-sub">Google hesabınla devam et.</p>
        <GoogleLogin redirectTo="/" />
        <br />
        <Link href="/" className="auth-back">
          Geri Dön
        </Link>
      </section>
    </main>
  );
}
