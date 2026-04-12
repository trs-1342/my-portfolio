"use client";

import { useEffect, useState } from "react";
import { getAllUsers, updateUserStatus, updateUserBlockedPages, updateUserFeatures, approveUser } from "@/lib/firestore";
import type { UserProfile } from "@/lib/firestore";
import { auth } from "@/lib/firebase";

/* Engellenebilir sayfalar */
const BLOCKABLE = [
  { path: "/contact",  label: "İletişim Formu" },
  { path: "/hsounds",  label: "Hsounds"        },
  { path: "/photos",   label: "Fotoğraflar"    },
  { path: "/profile",  label: "Profil"         },
  { path: "/settings", label: "Ayarlar"        },
];

/* Kullanıcı bazlı özellik kontrolü */
const FEATURES: { key: keyof NonNullable<UserProfile["features"]>; label: string }[] = [
  { key: "rss",           label: "RSS Takibi"  },
  { key: "articles",      label: "Makaleler"   },
  { key: "announcements", label: "Duyurular"   },
];

export default function AdminUsersPage() {
  const [users,    setUsers]    = useState<UserProfile[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy,     setBusy]     = useState<string | null>(null); // işlem sırasındaki uid

  const load = async () => {
    setLoading(true);
    const data = await getAllUsers();
    /* Sıralama: pending → admin → active → banned */
    data.sort((a, b) => {
      const order = (u: UserProfile) =>
        u.status === "pending" ? 0 : u.role === "admin" ? 1 : u.status === "active" ? 2 : 3;
      return order(a) - order(b);
    });
    setUsers(data);
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []);

  /* Hesabı onayla */
  const handleApprove = async (u: UserProfile) => {
    setBusy(u.uid);
    await approveUser(u.uid);
    setUsers((prev) => prev.map((x) => x.uid === u.uid ? { ...x, status: "active" } : x));
    setBusy(null);
  };

  /* Hesabı reddet (sil) */
  const handleReject = async (u: UserProfile) => {
    if (!confirm(`@${u.username} hesabını reddet ve sil?`)) return;
    setBusy(u.uid);
    const idToken = await auth?.currentUser?.getIdToken(true);
    const res = await fetch("/api/admin/delete-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idToken ? { "Authorization": `Bearer ${idToken}` } : {}),
      },
      body: JSON.stringify({ uid: u.uid, username: u.username }),
    });
    if (res.ok) {
      setUsers((prev) => prev.filter((x) => x.uid !== u.uid));
      if (expanded === u.uid) setExpanded(null);
    } else {
      alert("İşlem başarısız. Tekrar dene.");
    }
    setBusy(null);
  };

  /* Ban / unban */
  const handleToggleBan = async (u: UserProfile) => {
    setBusy(u.uid);
    const next = u.status === "banned" ? "active" : "banned";
    await updateUserStatus(u.uid, next);
    setUsers((prev) => prev.map((x) => x.uid === u.uid ? { ...x, status: next } : x));
    setBusy(null);
  };

  /* Sayfa engeli toggle */
  const handleTogglePage = async (u: UserProfile, path: string) => {
    setBusy(u.uid);
    const current = u.blockedPages ?? [];
    const next = current.includes(path)
      ? current.filter((p) => p !== path)
      : [...current, path];
    await updateUserBlockedPages(u.uid, next);
    setUsers((prev) => prev.map((x) => x.uid === u.uid ? { ...x, blockedPages: next } : x));
    setBusy(null);
  };

  /* Özellik toggle — false = kısıtlı, true/undefined = aktif */
  const handleToggleFeature = async (u: UserProfile, key: keyof NonNullable<UserProfile["features"]>) => {
    setBusy(u.uid);
    const current = u.features ?? {};
    const isRestricted = current[key] === false;
    const next = { ...current, [key]: isRestricted ? true : false };
    await updateUserFeatures(u.uid, next);
    setUsers((prev) => prev.map((x) => x.uid === u.uid ? { ...x, features: next } : x));
    setBusy(null);
  };

  /* Kullanıcı sil */
  const handleDelete = async (u: UserProfile) => {
    if (u.role === "admin") { alert("Admin hesabı silinemez."); return; }
    if (!confirm(`@${u.username} kullanıcısını silmek istediğinden emin misin?\nBu işlem geri alınamaz.`)) return;
    setBusy(u.uid);
    const idToken = await auth?.currentUser?.getIdToken(true);
    const res = await fetch("/api/admin/delete-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idToken ? { "Authorization": `Bearer ${idToken}` } : {}),
      },
      body: JSON.stringify({ uid: u.uid, username: u.username }),
    });
    if (res.ok) {
      setUsers((prev) => prev.filter((x) => x.uid !== u.uid));
      if (expanded === u.uid) setExpanded(null);
    } else {
      alert("Silme başarısız. Tekrar dene.");
    }
    setBusy(null);
  };

  const totalUsers   = users.filter((u) => u.role !== "admin").length;
  const bannedCount  = users.filter((u) => u.status === "banned").length;
  const pendingCount = users.filter((u) => u.status === "pending").length;

  return (
    <div>
      {/* Başlık */}
      <header style={{ marginBottom: "32px" }}>
        <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "8px" }}>
          /admin/users
        </p>
        <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
          Kullanıcılar
        </h1>
        <p style={{ fontSize: "0.82rem", color: "var(--text-3)", marginTop: "6px" }}>
          {totalUsers} kullanıcı · {bannedCount} engelli
          {pendingCount > 0 && (
            <span style={{ marginLeft: "10px", color: "#f59e0b", fontWeight: 600 }}>
              · {pendingCount} onay bekliyor
            </span>
          )}
        </p>
      </header>

      {loading ? (
        <p className="mono" style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>Yükleniyor...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {users.map((u) => {
            const isAdmin    = u.role === "admin";
            const isBanned   = u.status === "banned";
            const isPending  = u.status === "pending";
            const isExpanded = expanded === u.uid;
            const isBusy     = busy === u.uid;

            return (
              <div
                key={u.uid}
                className="glass"
                style={{
                  borderRadius: "14px",
                  border: isPending
                    ? "1px solid rgba(245,158,11,0.4)"
                    : isBanned
                    ? "1px solid rgba(239,68,68,0.25)"
                    : isAdmin
                    ? "1px solid rgba(16,185,129,0.25)"
                    : "1px solid var(--border)",
                  overflow: "hidden",
                  opacity: isBusy ? 0.6 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {/* Satır */}
                <div
                  onClick={() => !isAdmin && setExpanded(isExpanded ? null : u.uid)}
                  style={{
                    display: "flex", alignItems: "center", gap: "14px",
                    padding: "14px 20px",
                    cursor: isAdmin ? "default" : "pointer",
                    background: isExpanded ? "var(--panel-hover)" : "transparent",
                  }}
                >
                  {/* Fotoğraf / avatar */}
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    background: "var(--bg-2)", border: "1px solid var(--border)",
                    overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1rem",
                  }}>
                    {u.photoURL
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={u.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : "👤"}
                  </div>

                  {/* İsim + email */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="mono" style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text)" }}>
                        @{u.username}
                      </span>
                      {isAdmin && (
                        <span style={{ fontSize: "0.65rem", padding: "2px 7px", borderRadius: "999px", background: "rgba(16,185,129,0.12)", color: "var(--accent)", border: "1px solid rgba(16,185,129,0.3)" }}>
                          🔑 admin
                        </span>
                      )}
                      {isPending && (
                        <span style={{ fontSize: "0.65rem", padding: "2px 7px", borderRadius: "999px", background: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.35)" }}>
                          onay bekliyor
                        </span>
                      )}
                      {isBanned && (
                        <span style={{ fontSize: "0.65rem", padding: "2px 7px", borderRadius: "999px", background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}>
                          engelli
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{u.email}</span>
                  </div>

                  {/* Kayıt tarihi */}
                  <span className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", flexShrink: 0 }}>
                    {u.createdAt ? new Date((u.createdAt as { seconds: number }).seconds * 1000).toLocaleDateString("tr-TR") : "—"}
                  </span>

                  {!isAdmin && (
                    <span style={{ fontSize: "0.75rem", color: "var(--text-3)", flexShrink: 0 }}>
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  )}
                </div>

                {/* Pending: Kabul Et / Reddet */}
                {isPending && (
                  <div style={{ padding: "14px 20px 14px 70px", borderTop: "1px solid rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.04)", display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => handleApprove(u)}
                      disabled={isBusy}
                      style={{
                        padding: "8px 18px", borderRadius: "9px",
                        border: "1px solid rgba(16,185,129,0.4)",
                        background: "rgba(16,185,129,0.08)", color: "var(--accent)",
                        fontSize: "0.82rem", fontWeight: 600,
                        cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.15s",
                      }}
                    >
                      ✓ Kabul Et
                    </button>
                    <button
                      onClick={() => handleReject(u)}
                      disabled={isBusy}
                      style={{
                        padding: "8px 18px", borderRadius: "9px",
                        border: "1px solid rgba(239,68,68,0.35)",
                        background: "rgba(239,68,68,0.06)", color: "#ef4444",
                        fontSize: "0.82rem", fontWeight: 600,
                        cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.15s",
                      }}
                    >
                      ✕ Reddet
                    </button>
                  </div>
                )}

                {/* Detay paneli */}
                {isExpanded && !isAdmin && (
                  <div style={{ padding: "0 20px 20px 70px", borderTop: "1px solid var(--border)" }}>

                    {/* Kullanıcı tercihleri — salt okunur */}
                    <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "16px 0 10px" }}>
                      Kullanıcı Tercihleri
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
                      {/* Tema */}
                      <span style={{ padding: "4px 10px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-2)", fontSize: "0.72rem", color: "var(--text-2)" }}>
                        🎨 {u.settings?.theme ?? "dark"}
                      </span>
                      {/* Email bildirimleri (kullanıcının kendi tercihi) */}
                      {([
                        { key: "email",           label: "Email Ana" },
                        { key: "newArticle",      label: "Makale"    },
                        { key: "newRssPost",      label: "RSS"       },
                        { key: "newAnnouncement", label: "Duyuru"    },
                      ] as const).map(({ key, label }) => {
                        const off = u.notifications?.[key] === false;
                        return (
                          <span key={key} style={{ padding: "4px 10px", borderRadius: "6px", border: `1px solid ${off ? "rgba(239,68,68,0.3)" : "var(--border)"}`, background: off ? "rgba(239,68,68,0.06)" : "transparent", fontSize: "0.72rem", color: off ? "#ef4444" : "var(--text-3)" }}>
                            🔔 {label}: {off ? "kapalı" : "açık"}
                          </span>
                        );
                      })}
                    </div>

                    {/* Sayfa engelleri */}
                    <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>
                      Sayfa Erişim Kısıtlamaları
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
                      {BLOCKABLE.map((page) => {
                        const blocked = (u.blockedPages ?? []).includes(page.path);
                        return (
                          <button
                            key={page.path}
                            onClick={() => handleTogglePage(u, page.path)}
                            disabled={isBusy}
                            style={{
                              padding: "6px 12px", borderRadius: "8px", border: "1px solid",
                              borderColor: blocked ? "rgba(239,68,68,0.4)" : "var(--border)",
                              background:  blocked ? "rgba(239,68,68,0.08)" : "transparent",
                              color:       blocked ? "#ef4444" : "var(--text-2)",
                              fontSize: "0.78rem", fontWeight: 500,
                              cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.15s",
                            }}
                          >
                            {blocked ? "🚫 " : ""}{page.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Özellik kısıtlamaları */}
                    <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>
                      Özellik Kısıtlamaları
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
                      {FEATURES.map((f) => {
                        const restricted = u.features?.[f.key] === false;
                        return (
                          <button
                            key={f.key}
                            onClick={() => handleToggleFeature(u, f.key)}
                            disabled={isBusy}
                            style={{
                              padding: "6px 12px", borderRadius: "8px", border: "1px solid",
                              borderColor: restricted ? "rgba(239,68,68,0.4)" : "var(--border)",
                              background:  restricted ? "rgba(239,68,68,0.08)" : "transparent",
                              color:       restricted ? "#ef4444" : "var(--text-2)",
                              fontSize: "0.78rem", fontWeight: 500,
                              cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.15s",
                            }}
                          >
                            {restricted ? "🚫 " : ""}{f.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Aksiyonlar */}
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <button
                        onClick={() => handleToggleBan(u)}
                        disabled={isBusy}
                        style={{
                          padding: "8px 16px", borderRadius: "9px", border: "1px solid",
                          borderColor: isBanned ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.35)",
                          background:  isBanned ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.06)",
                          color:       isBanned ? "var(--accent)" : "#ef4444",
                          fontSize: "0.82rem", fontWeight: 600,
                          cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.15s",
                        }}
                      >
                        {isBanned ? "✓ Engeli Kaldır" : "⊘ Hesabı Engelle"}
                      </button>

                      <button
                        onClick={() => handleDelete(u)}
                        disabled={isBusy}
                        style={{
                          padding: "8px 16px", borderRadius: "9px",
                          border: "1px solid rgba(239,68,68,0.3)",
                          background: "transparent", color: "#ef4444",
                          fontSize: "0.82rem", fontWeight: 600,
                          cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.15s",
                        }}
                      >
                        🗑 Hesabı Sil
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
