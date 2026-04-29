"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAccessGuard } from "@/hooks/useAccessGuard";
import { updateUserProfile } from "@/lib/firestore";
import { RSS_CATEGORIES } from "@/lib/rss-categories";
import type { UserProfile } from "@/lib/firestore";
import { normalizeThemeId } from "@/lib/themes";
import ThemePicker from "@/components/ThemePicker";
import AmbientGlow from "@/components/AmbientGlow";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CAT_GROUPS = ["Teknoloji", "Havacılık"] as const;

export default function SettingsPage() {
  const { refreshProfile } = useAuth();
  const { user, profile, loading, ready } = useAccessGuard();

  const [navPos,   setNavPos]   = useState<"top" | "bottom">("top");
  const [theme,    setTheme]    = useState<string>("dark-green");
  const [notifEmail,           setNotifEmail]           = useState(true);
  const [notifMessage,         setNotifMessage]         = useState(true);
  const [notifSystem,          setNotifSystem]          = useState(true);
  const [notifNewArticle,      setNotifNewArticle]      = useState(true);
  const [notifNewRssPost,      setNotifNewRssPost]      = useState(true);
  const [notifNewAnnouncement, setNotifNewAnnouncement] = useState(true);
  const [featureRss,           setFeatureRss]           = useState(true);
  const [featureArticles,      setFeatureArticles]      = useState(true);
  const [featureAnnouncements, setFeatureAnnouncements] = useState(true);

  /* RSS tercihleri */
  const [rssFrequency,   setRssFrequency]   = useState<"daily" | "weekly">("weekly");
  const [rssCategories,  setRssCategories]  = useState<Record<string, boolean>>({});
  const [rssExpanded,    setRssExpanded]    = useState(false);

  const [saving, setSaving] = useState(false);
  const [msg,    setMsg]    = useState("");

  useEffect(() => {
    if (!profile) return;
    setNavPos(profile.settings.navbarPosition);
    setTheme(normalizeThemeId(profile.settings.theme));
    setNotifEmail(profile.notifications?.email              ?? true);
    setNotifMessage(profile.notifications?.newMessage        ?? true);
    setNotifSystem(profile.notifications?.system             ?? true);
    setNotifNewArticle(profile.notifications?.newArticle     ?? true);
    setNotifNewRssPost(profile.notifications?.newRssPost     ?? true);
    setNotifNewAnnouncement(profile.notifications?.newAnnouncement ?? true);
    setFeatureRss(profile.features?.rss           ?? true);
    setFeatureArticles(profile.features?.articles ?? true);
    setFeatureAnnouncements(profile.features?.announcements ?? true);
    setRssFrequency(profile.rssPreferences?.frequency   ?? "weekly");
    setRssCategories(profile.rssPreferences?.categories ?? {});
  }, [profile]);

  const handleThemeChange = (id: string) => setTheme(id);

  const toggleCategory = (catId: string) => {
    setRssCategories((prev) => ({ ...prev, [catId]: prev[catId] === false ? true : false }));
  };

  const isCatEnabled = (catId: string) => rssCategories[catId] !== false;

  const enableAllCats  = () => setRssCategories({});
  const disableAllCats = () => {
    const all: Record<string, boolean> = {};
    RSS_CATEGORIES.forEach((c) => { all[c.id] = false; });
    setRssCategories(all);
  };

  if (loading || !ready || !user || !profile) {
    return (
      <>
        <AmbientGlow />
        <Navbar />
        <div className="page-content" style={{ paddingTop: "100px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <p className="mono" style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>Yükleniyor...</p>
        </div>
      </>
    );
  }

  const handleSave = async () => {
    setSaving(true); setMsg("");
    try {
      // boolean olmayan değerlerin Firestore'a gitmemesi için kategoriyi temizle
      const cleanCategories: Record<string, boolean> = {};
      Object.entries(rssCategories).forEach(([k, v]) => {
        if (typeof v === "boolean") cleanCategories[k] = v;
      });

      const rssPrefs: NonNullable<UserProfile["rssPreferences"]> = {
        frequency:  rssFrequency,
        categories: cleanCategories,
      };
      if (profile.rssPreferences?.lastDigestSent) {
        rssPrefs.lastDigestSent = profile.rssPreferences.lastDigestSent;
      }

      await updateUserProfile(user.uid, {
        settings: { navbarPosition: navPos, theme },
        notifications: {
          email:            notifEmail,
          newMessage:       notifMessage,
          system:           notifSystem,
          newArticle:       notifNewArticle,
          newRssPost:       notifNewRssPost,
          newAnnouncement:  notifNewAnnouncement,
        },
        features: {
          rss:           featureRss,
          articles:      featureArticles,
          announcements: featureAnnouncements,
        },
        rssPreferences: rssPrefs,
      });
      await refreshProfile();
      setMsg("Ayarlar kaydedildi.");
    } catch (err) {
      console.error("Ayarlar kaydedilemedi:", err);
      const msg = err instanceof Error ? err.message : "Bilinmeyen hata.";
      setMsg(`Hata: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const enabledCatCount = RSS_CATEGORIES.filter((c) => isCatEnabled(c.id)).length;

  return (
    <>
      <AmbientGlow />
      <Navbar />
      <div className="page-content" style={{ paddingTop: "100px", paddingBottom: "80px" }}>
        <header style={{ marginBottom: "48px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <p className="mono anim-fade-up" style={{ fontSize: "0.72rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "10px" }}>
              /settings
            </p>
            <h1 className="anim-fade-up d2" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text)" }}>
              Ayarlar
            </h1>
          </div>
          <Link
            href="/profile"
            className="anim-fade-up d3"
            style={{
              padding: "9px 18px", borderRadius: "10px",
              border: "1px solid var(--border)", background: "var(--panel)",
              color: "var(--text-2)", fontSize: "0.82rem", fontWeight: 500,
              textDecoration: "none", backdropFilter: "blur(12px)",
              display: "inline-flex", alignItems: "center", gap: "6px",
            }}
          >
            👤 Profil
          </Link>
        </header>

        <div style={{ maxWidth: "580px", display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* ── Görünüm ── */}
          <SettingCard title="Görünüm">
            <div style={{ marginBottom: "4px" }}>
              <p style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text)", marginBottom: "16px" }}>Tema</p>
              <ThemePicker
                currentTheme={theme}
                uid={user?.uid}
                onThemeChange={handleThemeChange}
              />
            </div>
            <Divider />
            <SettingRow label="Navbar Konumu" desc="Navigasyon çubuğunun konumu. (Yakında aktif)">
              <ToggleGroup
                options={[{ value: "top", label: "⬆ Üst" }, { value: "bottom", label: "⬇ Alt" }]}
                value={navPos}
                onChange={(v) => setNavPos(v as "top" | "bottom")}
                disabled
              />
            </SettingRow>
          </SettingCard>

          {/* ── Özellik Tercihleri ── */}
          <SettingCard title="Özellik Tercihleri">
            {([
              { key: "rss",           label: "RSS Takibi",   desc: "RSS akışlarını takip et; yeni yazı bildirimlerini al.", value: featureRss,           setter: setFeatureRss           },
              { key: "articles",      label: "Makaleler",    desc: "Yeni makale yayınlandığında bildirim al.",               value: featureArticles,      setter: setFeatureArticles      },
              { key: "announcements", label: "Duyurular",    desc: "Yeni duyurulardan haberdar ol.",                         value: featureAnnouncements, setter: setFeatureAnnouncements },
            ] as const).map(({ key, label, desc, value, setter }, i) => {
              const adminDisabled = profile.features?.[key] === false;
              return (
                <div key={key}>
                  {i > 0 && <Divider />}
                  <SettingRow
                    label={label}
                    desc={adminDisabled ? "Admin tarafından kısıtlandı — bu özellik şu an kullanılamaz." : desc}
                  >
                    {adminDisabled ? (
                      <span style={{ fontSize: "0.72rem", color: "#ef4444", fontWeight: 500, padding: "4px 10px", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.06)" }}>
                        Kısıtlı
                      </span>
                    ) : (
                      <Toggle value={value} onChange={setter} />
                    )}
                  </SettingRow>
                </div>
              );
            })}
          </SettingCard>

          {/* ── RSS Digest Tercihleri ── */}
          <SettingCard title="RSS Digest Tercihleri">
            <SettingRow
              label="Email Sıklığı"
              desc="RSS özetinin ne sıklıkta gönderileceği. Varsayılan: haftalık."
            >
              <ToggleGroup
                options={[
                  { value: "daily",  label: "Günlük"   },
                  { value: "weekly", label: "Haftalık" },
                ]}
                value={rssFrequency}
                onChange={(v) => setRssFrequency(v as "daily" | "weekly")}
              />
            </SettingRow>

            <Divider />

            {/* Kategori açma/kapama */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text)", marginBottom: "2px" }}>
                    Kategoriler
                    <span className="mono" style={{ marginLeft: "8px", fontSize: "0.72rem", color: "var(--accent)", fontWeight: 400 }}>
                      {enabledCatCount}/{RSS_CATEGORIES.length} aktif
                    </span>
                  </p>
                  <p style={{ fontSize: "0.74rem", color: "var(--text-3)" }}>
                    Kapalı kategorilerden email gelmez.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={enableAllCats}
                    style={{ padding: "5px 10px", borderRadius: "8px", border: "1px solid var(--border)", background: "transparent", color: "var(--accent)", fontSize: "0.72rem", cursor: "pointer", fontFamily: "var(--font-sans)" }}
                  >
                    Tümünü Aç
                  </button>
                  <button
                    onClick={disableAllCats}
                    style={{ padding: "5px 10px", borderRadius: "8px", border: "1px solid var(--border)", background: "transparent", color: "var(--text-3)", fontSize: "0.72rem", cursor: "pointer", fontFamily: "var(--font-sans)" }}
                  >
                    Tümünü Kapat
                  </button>
                </div>
              </div>

              {/* Aç/kapat chevron */}
              <button
                onClick={() => setRssExpanded((p) => !p)}
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: "10px",
                  border: "1px solid var(--border)", background: "var(--bg-2)",
                  color: "var(--text-2)", fontSize: "0.82rem", fontWeight: 500,
                  cursor: "pointer", fontFamily: "var(--font-sans)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  transition: "background 0.15s",
                }}
              >
                <span>Kategorileri {rssExpanded ? "Gizle" : "Göster"}</span>
                <span style={{ transition: "transform 0.2s", transform: rssExpanded ? "rotate(180deg)" : "none", fontSize: "0.75rem" }}>▼</span>
              </button>

              {rssExpanded && (
                <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "20px" }}>
                  {CAT_GROUPS.map((group) => {
                    const cats = RSS_CATEGORIES.filter((c) => c.group === group);
                    return (
                      <div key={group}>
                        <p className="mono" style={{ fontSize: "0.64rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>
                          {group}
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "6px" }}>
                          {cats.map((cat) => {
                            const enabled = isCatEnabled(cat.id);
                            return (
                              <button
                                key={cat.id}
                                onClick={() => toggleCategory(cat.id)}
                                style={{
                                  display: "flex", alignItems: "center", gap: "8px",
                                  padding: "8px 10px", borderRadius: "9px",
                                  border: `1px solid ${enabled ? "rgba(16,185,129,0.3)" : "var(--border)"}`,
                                  background: enabled ? "rgba(16,185,129,0.06)" : "transparent",
                                  color: enabled ? "var(--accent)" : "var(--text-3)",
                                  fontSize: "0.78rem", fontWeight: 500,
                                  cursor: "pointer", fontFamily: "var(--font-sans)",
                                  textAlign: "left", transition: "all 0.15s",
                                }}
                              >
                                <span style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${enabled ? "var(--accent)" : "var(--text-3)"}`, background: enabled ? "var(--accent)" : "transparent", flexShrink: 0, display: "inline-block", transition: "all 0.15s" }} />
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </SettingCard>

          {/* ── Email Bildirimleri ── */}
          <SettingCard title="Email Bildirimleri">
            <SettingRow label="Email Bildirimleri" desc="Tüm email bildirimlerinin ana anahtarı.">
              <Toggle value={notifEmail} onChange={setNotifEmail} />
            </SettingRow>
            <Divider />
            <SettingRow label="Yeni Makale" desc="HSounds'a yeni bir makale eklendiğinde.">
              <Toggle value={notifNewArticle} onChange={setNotifNewArticle} />
            </SettingRow>
            <Divider />
            <SettingRow label="RSS Digest" desc="Takip edilen RSS akışlarından özet email.">
              <Toggle value={notifNewRssPost} onChange={setNotifNewRssPost} />
            </SettingRow>
            <Divider />
            <SettingRow label="Duyurular" desc="HSounds'ta yeni bir duyuru yayınlandığında.">
              <Toggle value={notifNewAnnouncement} onChange={setNotifNewAnnouncement} />
            </SettingRow>
            <Divider />
            <SettingRow label="Yeni Mesaj" desc="İletişim formundan yeni mesaj geldiğinde.">
              <Toggle value={notifMessage} onChange={setNotifMessage} />
            </SettingRow>
            <Divider />
            <SettingRow label="Sistem Bildirimleri" desc="Bakım, güncelleme ve önemli duyurular.">
              <Toggle value={notifSystem} onChange={setNotifSystem} />
            </SettingRow>
          </SettingCard>

          {msg && (
            <p style={{ fontSize: "0.82rem", color: msg.includes("kaydedildi") ? "#10B981" : "#ef4444", paddingLeft: "4px" }}>
              {msg}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-accent anim-fade-up"
            style={{ justifyContent: "center", padding: "13px", fontSize: "0.9rem" }}
          >
            {saving ? "Kaydediliyor..." : "Ayarları Kaydet"}
          </button>
        </div>

        <Footer />
      </div>
    </>
  );
}

/* ── Yardımcı bileşenler ── */

function SettingCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass anim-fade-up" style={{ borderRadius: "20px", padding: "24px 28px" }}>
      <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "20px" }}>
        {title}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        {children}
      </div>
    </div>
  );
}

function SettingRow({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", padding: "4px 0", flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text)", marginBottom: "2px" }}>{label}</p>
        <p style={{ fontSize: "0.74rem", color: "var(--text-3)", lineHeight: 1.4 }}>{desc}</p>
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: "1px", background: "var(--border)", margin: "14px 0" }} />;
}

function ToggleGroup({ options, value, onChange, disabled }: {
  options: { value: string; label: string }[];
  value: string; onChange: (v: string) => void; disabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: "6px" }}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => !disabled && onChange(o.value)}
          disabled={disabled}
          style={{
            padding: "7px 13px", borderRadius: "10px", border: "1px solid",
            borderColor: value === o.value ? "var(--accent)" : "var(--border)",
            background:  value === o.value ? "var(--accent-dim)" : "transparent",
            color:       value === o.value ? "var(--accent)" : "var(--text-3)",
            fontSize: "0.78rem", fontWeight: 500,
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.5 : 1,
            transition: "all 0.15s", fontFamily: "var(--font-sans)",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: "999px", border: "none",
        background: value ? "var(--accent)" : "var(--bg-2)",
        cursor: "pointer", position: "relative", transition: "background 0.2s",
        flexShrink: 0,
        boxShadow: value ? "0 0 10px var(--accent-glow)" : "none",
      }}
    >
      <span style={{
        position: "absolute", top: 3,
        left: value ? 23 : 3,
        width: 18, height: 18, borderRadius: "50%",
        background: "#fff",
        transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
      }} />
    </button>
  );
}
