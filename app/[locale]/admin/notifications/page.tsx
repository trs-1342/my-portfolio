"use client";

import { useEffect, useState } from "react";
import {
  getSiteNotificationsConfig,
  setSiteNotificationsConfig,
  type SiteNotificationsConfig,
} from "@/lib/firestore";

export default function AdminNotificationsPage() {
  const [config,  setConfig]  = useState<SiteNotificationsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState("");

  useEffect(() => {
    getSiteNotificationsConfig().then((c) => {
      setConfig(c);
      setLoading(false);
    });
  }, []);

  const toggle = (key: keyof SiteNotificationsConfig) => {
    if (!config) return;
    setConfig({ ...config, [key]: !config[key] });
  };

  const save = async () => {
    if (!config) return;
    setSaving(true); setMsg("");
    await setSiteNotificationsConfig(config);
    setSaving(false);
    setMsg("Kaydedildi ✓");
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div style={{ maxWidth: "580px" }}>
      <header style={{ marginBottom: "32px" }}>
        <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "8px" }}>
          /admin/notifications
        </p>
        <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
          Bildirim Sistemi
        </h1>
        <p style={{ fontSize: "0.82rem", color: "var(--text-3)", marginTop: "6px" }}>
          Global email bildirimleri. Kapatılan tür tüm kullanıcılara gönderilmez.
        </p>
      </header>

      {loading ? (
        <p className="mono" style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>Yükleniyor...</p>
      ) : config && (
        <div className="glass" style={{ borderRadius: "16px", padding: "24px 28px" }}>
          <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "20px" }}>
            Email Sistemleri
          </p>

          <NotifRow
            label="RSS Email Bildirimleri"
            desc="Yeni RSS yazısı çıktığında abone kullanıcılara gönderilir."
            enabled={config.rssEmailEnabled}
            onToggle={() => toggle("rssEmailEnabled")}
          />

          <Divider />

          <NotifRow
            label="Makale Email Bildirimleri"
            desc="Yeni makale yayınlandığında abone kullanıcılara gönderilir."
            enabled={config.articlesEmailEnabled}
            onToggle={() => toggle("articlesEmailEnabled")}
          />

          <Divider />

          <NotifRow
            label="Duyuru Email Bildirimleri"
            desc="Yeni duyuru yayınlandığında abone kullanıcılara gönderilir."
            enabled={config.announcementsEmailEnabled}
            onToggle={() => toggle("announcementsEmailEnabled")}
          />

          <div style={{ marginTop: "24px", display: "flex", alignItems: "center", gap: "14px" }}>
            <button
              onClick={save}
              disabled={saving}
              className="btn btn-accent"
              style={{ padding: "10px 22px" }}
            >
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
            {msg && (
              <span style={{ fontSize: "0.82rem", color: "#10B981" }}>{msg}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotifRow({
  label,
  desc,
  enabled,
  onToggle,
}: {
  label: string;
  desc: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", padding: "4px 0", flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "2px" }}>
          <p style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text)" }}>{label}</p>
          <span style={{
            fontSize: "0.65rem", padding: "2px 8px", borderRadius: "999px",
            background: enabled ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.1)",
            color: enabled ? "var(--accent)" : "#ef4444",
            border: `1px solid ${enabled ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.25)"}`,
            fontFamily: "var(--font-mono)",
          }}>
            {enabled ? "aktif" : "durduruldu"}
          </span>
        </div>
        <p style={{ fontSize: "0.74rem", color: "var(--text-3)", lineHeight: 1.4 }}>{desc}</p>
      </div>
      <button
        onClick={onToggle}
        style={{
          width: 44, height: 24, borderRadius: "999px", border: "none",
          background: enabled ? "var(--accent)" : "var(--bg-2)",
          cursor: "pointer", position: "relative", transition: "background 0.2s",
          flexShrink: 0,
          boxShadow: enabled ? "0 0 10px var(--accent-glow)" : "none",
        }}
      >
        <span style={{
          position: "absolute", top: 3,
          left: enabled ? 23 : 3,
          width: 18, height: 18, borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }} />
      </button>
    </div>
  );
}

function Divider() {
  return <div style={{ height: "1px", background: "var(--border)", margin: "14px 0" }} />;
}
