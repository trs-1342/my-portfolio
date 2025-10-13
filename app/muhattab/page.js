"use client";

import Nav from "@/components/Nav";
import { useEffect, useMemo, useRef, useState } from "react";
import { auth } from "@/lib/firebaseClient";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";

/**
 * Basit chat akışı:
 * - Giriş yoksa Google ile giriş butonu göster.
 * - Giriş varsa: /api/session'a idToken gönder → session cookie set + kullanıcı MySQL'e upsert
 * - Mesajları /api/messages GET ile çek, POST ile gönder.
 * - Her 3 sn'de bir polling yap (ileri aşamada web socket eklenir).
 */

export default function MuhattabPage() {
  const [user, setUser] = useState(null);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollerRef = useRef(null);

  // Google provider'ı bir defa üret
  const provider = useMemo(() => new GoogleAuthProvider(), []);

  // Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          // session cookie oluştur + kullanıcıyı DB'ye upsert
          const idToken = await auth.currentUser.getIdToken(true);
          await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }), // <-- zorunlu
          });

          await fetchMessages(); // giriş olmuşken ilk listeyi çek
          setLoading(false);
        } catch {
          setLoading(false);
        }
      } else {
        setMessages([]);
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  // 3 sn'de bir güncelle (kullanıcı giriş yaptıysa)
  useEffect(() => {
    if (!user) return;
    const t = setInterval(fetchMessages, 3000);
    return () => clearInterval(t);
  }, [user]);

  // Mesajları çek
  async function fetchMessages() {
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/messages", {
        headers: idToken ? { Authorization: `Bearer ${idToken}` } : {},
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      // API en yeni üstte döndürüyor; aşağıdan yukarı okunsun diye tersle
      const ordered = [...data].reverse();
      setMessages(ordered);
      scrollToBottomSmooth();
    } catch {
      /* yut */
    }
  }

  // Mesaj gönder
  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({ text: text.trim() }),
      });
      if (res.ok) {
        setText("");
        await fetchMessages();
      }
    } finally {
      setSending(false);
    }
  }

  function scrollToBottomSmooth() {
    const el = scrollerRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }

  async function handleLogin() {
    await signInWithPopup(auth, provider);
  }
  async function handleLogout() {
    await signOut(auth);
  }

  // ------ UI ------
  if (loading) {
    return (
      <div style={{ maxWidth: 860, margin: "24px auto", padding: 12 }}>
        <Nav />
        <h2 style={{ marginBottom: 12 }}>Muhattab</h2>
        <p>yükleniyor…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 860, margin: "24px auto", padding: 12 }}>
        <Nav />
        <h2 style={{ marginBottom: 12 }}>Muhattab</h2>
        <p style={{ opacity: 0.8, marginBottom: 12 }}>
          Sohbet etmek için Google ile giriş yap.
        </p>
        <button
          onClick={handleLogin}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #2a2a2a",
            cursor: "pointer",
          }}
        >
          Google ile Giriş
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: "24px auto", padding: 12 }}>
      <Nav />
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* avatar */}
          {user.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photoURL}
              alt="avatar"
              width={36}
              height={36}
              style={{ borderRadius: "50%" }}
            />
          ) : null}
          <div>
            <div style={{ fontWeight: 600 }}>
              Hoş geldin, {user.displayName || user.email}
            </div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{user.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid #2a2a2a",
            cursor: "pointer",
          }}
        >
          Çıkış
        </button>
      </header>

      {/* Mesaj paneli */}
      <div
        ref={scrollerRef}
        style={{
          height: 440,
          border: "1px solid #2a2a2a",
          borderRadius: 14,
          padding: 12,
          overflowY: "auto",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        {messages.length === 0 ? (
          <div style={{ opacity: 0.7 }}>Henüz mesaj yok. İlk mesajı yaz.</div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              style={{
                marginBottom: 12,
                padding: 10,
                borderRadius: 12,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(100,100,100,0.2)",
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>
                {m.user?.name || m.user?.email || "Bilinmeyen"}
                {" • "}
                {new Date(m.createdAt).toLocaleString()}
              </div>
              <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
            </div>
          ))
        )}
      </div>

      {/* Girdi alanı */}
      <form
        onSubmit={handleSend}
        style={{ display: "flex", gap: 8, marginTop: 12 }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Mesaj yaz…"
          maxLength={2000}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #2a2a2a",
            outline: "none",
          }}
        />
        <button
          disabled={sending || !text.trim()}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #2a2a2a",
            cursor: sending || !text.trim() ? "not-allowed" : "pointer",
            opacity: sending || !text.trim() ? 0.6 : 1,
            whiteSpace: "nowrap",
          }}
        >
          {sending ? "Gönderiliyor…" : "Gönder"}
        </button>
      </form>
    </div>
  );
}
