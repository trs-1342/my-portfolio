"use client";

import Link from "next/link";
import { useState } from "react";

export default function AuthForm({ mode = "login" }) {
  const isLogin = mode === "login";
  const title = isLogin ? "Giriş Yap" : "Kayıt Ol";
  const action = isLogin ? "/api/auth/login" : "/api/auth/register";
  const [showPw, setShowPw] = useState(false);

  return (
    <section className="auth-card" aria-labelledby="authTitle">
      <header className="auth-header">
        <h1 id="authTitle">{title}</h1>
        <p className="auth-sub">
          {isLogin ? "Hesabına giriş yap." : "Yeni hesap oluştur."}
        </p>
      </header>

      <form className="auth-form" action={action} method="POST">
        {/* register ise kullanıcı adı + ad */}
        {!isLogin && (
          <div className="field">
            <label htmlFor="name">Ad</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
            />
          </div>
        )}

        <div className="field">
          <label htmlFor="username">Kullanıcı Adı</label>
          <input
            id="username"
            name="username"
            type="text"
            inputMode="text"
            autoComplete="username"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Şifre</label>
          <div className="pw-wrap">
            <input
              id="password"
              name="password"
              type={showPw ? "text" : "password"}
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              minLength={6}
            />
            <button
              type="button"
              className="pw-toggle"
              aria-label={showPw ? "Şifreyi gizle" : "Şifreyi göster"}
              onClick={() => setShowPw((v) => !v)}
            >
              <i className={`fa-solid ${showPw ? "fa-eye-slash" : "fa-eye"}`} />
            </button>
          </div>
        </div>

        <button className="auth-submit" type="submit">
          {title}
        </button>
      </form>

      <footer className="auth-footer">
        {isLogin ? (
          <p>
            Hesabın yok mu? <Link href="/register">Kayıt yap</Link>
          </p>
        ) : (
          <p>
            Zaten hesabın var mı? <Link href="/login">Giriş yap</Link>
          </p>
        )}
        <p className="auth-terms">
          <Link href="/">Anasayfa</Link>
        </p>
      </footer>
    </section>
  );
}
