"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/context/AuthContext";

type Category = "bug" | "feedback" | "collab" | "hi" | "rec";
type Status = "idle" | "sending" | "success";

const QUICK_LINKS = [
  { icon: "✉️", label: "Email",     href: "mailto:hattab1342@gmail.com",             color: "#10B981" },
  { icon: "⌨️", label: "GitHub",    href: "https://github.com/trs-1342",             color: "#a855f7" },
  { icon: "💼", label: "LinkedIn",  href: "https://linkedin.com/in/halilhattabh",    color: "#3b82f6" },
  { icon: "📸", label: "Instagram", href: "https://instagram.com/trs.1342",          color: "#f97316" },
];

export default function ContactForm() {
  const t = useTranslations("Contact");
  const { user, profile } = useAuth();
  const router = useRouter();

  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [message, setMessage]   = useState("");
  const [status, setStatus]     = useState<Status>("idle");
  const [termLines, setTermLines] = useState<string[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const TERMINAL_LINES = [
    t("terminal.line1"),
    t("terminal.line2"),
    t("terminal.line3"),
    t("terminal.line4"),
  ];

  const CATEGORIES: { id: Category; label: string }[] = [
    { id: "hi",       label: t("categories.hi")       },
    { id: "feedback", label: t("categories.feedback")  },
    { id: "rec",      label: t("categories.rec")       },
    { id: "collab",   label: t("categories.collab")    },
    { id: "bug",      label: t("categories.bug")       },
  ];

  /* Ban / sayfa engeli kontrolü */
  useEffect(() => {
    if (!profile) return;
    if (profile.status === "banned") {
      const pages = (profile.blockedPages ?? []).join(",");
      router.replace(`/blocked?banned=1&pages=${encodeURIComponent(pages)}` as Parameters<typeof router.replace>[0]);
      return;
    }
    if (profile.blockedPages?.includes("/contact")) {
      const pages = (profile.blockedPages ?? []).join(",");
      router.replace(`/blocked?path=/contact&pages=${encodeURIComponent(pages)}` as Parameters<typeof router.replace>[0]);
    }
  }, [profile, router]);

  /* Oturum açıksa email'i otomatik doldur */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user?.email) setEmail(user.email);
  }, [user]);

  /* Textarea auto-resize */
  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  /* Terminal typewriter animasyonu */
  const runTerminal = () => {
    setTermLines([]);
    TERMINAL_LINES.forEach((line, i) => {
      setTimeout(() => {
        setTermLines((prev) => [...prev, line]);
        if (i === TERMINAL_LINES.length - 1) {
          setTimeout(() => setStatus("success"), 400);
        }
      }, i * 480);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;
    setStatus("sending");
    runTerminal();
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, category, message }),
      });
    } catch {
      /* API hatası terminal animasyonunu durdurmaz */
    }
  };

  const reset = () => {
    setName(""); setEmail(""); setCategory(null);
    setMessage(""); setStatus("idle"); setTermLines([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  return (
    <div
      className="contact-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 280px",
        gap: "28px",
        alignItems: "start",
      }}
    >
      {/* Sol — Form kartı */}
      <div className="glass anim-fade-up d2" style={{ padding: "32px", borderRadius: "20px" }}>

        {/* Başarı ekranı */}
        {status === "success" ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>✅</div>
            <h2 style={{ fontWeight: 700, fontSize: "1.3rem", color: "var(--text)", marginBottom: "8px" }}>
              {t("successTitle")}
            </h2>
            <p style={{ color: "var(--text-2)", fontSize: "0.9rem", marginBottom: "28px" }}>
              {t("successBody")}
            </p>
            <button onClick={reset} className="btn btn-ghost" style={{ margin: "0 auto" }}>
              {t("newMessage")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>

            {/* Ad + Email */}
            <div className="contact-fields" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {/* Ad */}
              <div>
                <label className="mono" style={{ fontSize: "0.7rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>
                  {t("nameLabel")}
                </label>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder={t("namePlaceholder")} autoComplete="name" required
                  disabled={status === "sending"}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-sans)", fontSize: "0.9rem", outline: "none", transition: "border-color 0.15s" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                  onBlur={(e)  => (e.target.style.borderColor = "var(--border)")}
                />
              </div>

              {/* Email — oturum açıksa readonly */}
              <div>
                <label className="mono" style={{ fontSize: "0.7rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>
                  {t("emailLabel")}
                  {user?.email && (
                    <span style={{ marginLeft: "6px", color: "var(--accent)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                      {t("emailFromSession")}
                    </span>
                  )}
                </label>
                <input
                  type="email" value={email}
                  onChange={(e) => { if (!user?.email) setEmail(e.target.value); }}
                  placeholder="ornek@mail.com" autoComplete="email" required
                  readOnly={!!user?.email}
                  disabled={status === "sending"}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: "10px",
                    border: "1px solid var(--border)",
                    background: user?.email ? "var(--bg-2)" : "var(--bg)",
                    color: "var(--text)", fontFamily: "var(--font-sans)", fontSize: "0.9rem",
                    outline: "none", transition: "border-color 0.15s",
                    cursor: user?.email ? "default" : "text",
                  }}
                  onFocus={(e) => { if (!user?.email) e.target.style.borderColor = "var(--accent)"; }}
                  onBlur={(e)  => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
            </div>

            {/* Kategori pill butonları */}
            <div>
              <p className="mono" style={{ fontSize: "0.7rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
                {t("categoryLabel")}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    disabled={status === "sending"}
                    onClick={() => setCategory(category === c.id ? null : c.id)}
                    style={{
                      padding: "7px 14px",
                      borderRadius: "999px",
                      border: "1px solid",
                      borderColor: category === c.id ? "var(--accent)" : "var(--border)",
                      background: category === c.id ? "var(--accent-dim)" : "transparent",
                      color: category === c.id ? "var(--accent)" : "var(--text-2)",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.82rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.2s var(--spring)",
                      boxShadow: category === c.id ? "0 0 12px var(--accent-glow)" : "none",
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mesaj textarea */}
            <div>
              <label className="mono" style={{ fontSize: "0.7rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>
                {t("messageLabel")}
              </label>
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => { setMessage(e.target.value); autoResize(); }}
                placeholder={t("messagePlaceholder")}
                required
                disabled={status === "sending"}
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid var(--border)",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.85rem",
                  outline: "none",
                  resize: "none",
                  overflow: "hidden",
                  lineHeight: 1.7,
                  transition: "border-color 0.15s",
                  minHeight: "110px",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Terminal animasyonu */}
            {status === "sending" && termLines.length > 0 && (
              <div
                className="glass mono"
                style={{
                  padding: "14px 16px",
                  borderRadius: "10px",
                  border: "1px solid var(--accent)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                {termLines.map((line, i) => (
                  <p key={i} style={{ fontSize: "0.78rem", color: "var(--accent)", lineHeight: 1.7, animation: "fadeInUp 0.2s ease both" }}>
                    {line}
                  </p>
                ))}
                <span style={{ width: 7, height: 13, background: "var(--accent)", display: "inline-block", animation: "statusPulse 0.7s step-end infinite", marginTop: 2 }} />
              </div>
            )}

            {/* Gönder butonu */}
            <button
              type="submit"
              disabled={status === "sending" || !category}
              className="btn btn-accent"
              style={{
                justifyContent: "center",
                padding: "13px",
                fontSize: "0.9rem",
                letterSpacing: "0.02em",
                boxShadow: "0 0 0 var(--accent-glow)",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 24px var(--accent-glow), 0 0 48px rgba(16,185,129,0.15)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 0 var(--accent-glow)";
              }}
            >
              {status === "sending" ? t("sending") : t("send")}
            </button>

          </form>
        )}
      </div>

      {/* Sağ — Hızlı erişim linkleri */}
      <div
        className="anim-fade-up d3"
        style={{ display: "flex", flexDirection: "column", gap: "12px" }}
      >
        <p className="mono" style={{ fontSize: "0.7rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>
          {t("quickAccess")}
        </p>

        {QUICK_LINKS.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target={l.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="glass glass-hover"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "16px 18px",
              borderRadius: "14px",
              textDecoration: "none",
              transition: "all 0.25s var(--spring)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                background: `${l.color}18`,
                border: `1px solid ${l.color}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                flexShrink: 0,
                boxShadow: `0 0 12px ${l.color}20`,
              }}
            >
              {l.icon}
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text)" }}>
                {l.label}
              </p>
              <p className="mono" style={{ fontSize: "0.7rem", color: "var(--text-3)", marginTop: "2px" }}>
                {l.href.replace("mailto:", "").replace("https://", "")}
              </p>
            </div>
            <span style={{ marginLeft: "auto", color: "var(--text-3)", fontSize: "0.8rem" }}>→</span>
          </a>
        ))}

        {/* Yanıt süresi */}
        <div className="glass" style={{ padding: "14px 16px", borderRadius: "12px", marginTop: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span className="pulse-dot" />
            <span className="mono" style={{ fontSize: "0.7rem", color: "var(--accent)" }}>{t("online")}</span>
          </div>
          <p
            style={{ fontSize: "0.78rem", color: "var(--text-2)", lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ __html: t("replyTime") }}
          />
        </div>
      </div>

      <style>{`
        input::placeholder, textarea::placeholder { color: var(--text-3); opacity: 0.7; }
        input:disabled, textarea:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
