"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useAccessGuard } from "@/hooks/useAccessGuard";
import { updateUserProfile, updateUsername, deleteUserData } from "@/lib/firestore";
import { uploadFile, deleteFileByPath } from "@/lib/storage";
import { deleteUser, updateProfile } from "firebase/auth";
import AmbientGlow from "@/components/AmbientGlow";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ── Avatar yardımcıları ─────────────────────────────────── */

const AVATAR_COLORS = [
  "#10B981", "#3B82F6", "#8B5CF6", "#F59E0B",
  "#EF4444", "#EC4899", "#06B6D4", "#84CC16",
];

function avatarColor(uid: string): string {
  let h = 0;
  for (let i = 0; i < uid.length; i++) h += uid.charCodeAt(i);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "?";
}

/* ── Avatar bileşeni ─────────────────────────────────────── */
function Avatar({
  photoURL,
  displayName,
  uid,
  size = 80,
}: {
  photoURL: string | null;
  displayName: string;
  uid: string;
  size?: number;
}) {
  const color = avatarColor(uid);
  if (photoURL) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoURL}
        alt={displayName}
        style={{
          width: size, height: size, borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid var(--border)",
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color + "22",
      border: `2px solid ${color}55`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, color,
      userSelect: "none", flexShrink: 0,
    }}>
      {initials(displayName || "?")}
    </div>
  );
}

/* ── Sayfa ───────────────────────────────────────────────── */
export default function ProfilePage() {
  const { logout, changePassword, refreshProfile } = useAuth();
  const { user, profile, loading, ready } = useAccessGuard();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName,    setDisplayName]    = useState("");
  const [newUsername,    setNewUsername]    = useState("");
  const [currentPwd,     setCurrentPwd]     = useState("");
  const [newPwd,         setNewPwd]         = useState("");
  const [saving,         setSaving]         = useState(false);
  const [pwdSaving,      setPwdSaving]      = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [msg,            setMsg]            = useState("");
  const [pwdMsg,         setPwdMsg]         = useState("");
  const [avatarMsg,      setAvatarMsg]      = useState("");
  const [deleteConfirm,  setDeleteConfirm]  = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? "");
      setNewUsername(profile.username ?? "");
    }
  }, [profile]);

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

  /* Profil kaydet */
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg("");
    try {
      if (newUsername !== profile.username) {
        await updateUsername(user.uid, profile.username, newUsername);
      }
      await updateUserProfile(user.uid, { displayName });
      await refreshProfile();
      setMsg("Profil güncellendi.");
    } catch (err: unknown) {
      setMsg((err as Error).message ?? "Hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  /* Şifre değiştir */
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdSaving(true); setPwdMsg("");
    try {
      await changePassword(currentPwd, newPwd);
      setPwdMsg("Şifre değiştirildi."); setCurrentPwd(""); setNewPwd("");
    } catch {
      setPwdMsg("Mevcut şifre hatalı veya hata oluştu.");
    } finally {
      setPwdSaving(false);
    }
  };

  /* Avatar yükle */
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setAvatarMsg("Dosya en fazla 5 MB olabilir.");
      return;
    }

    setAvatarUploading(true); setAvatarMsg("");
    try {
      const storagePath = `avatars/${user.uid}`;
      const url = await uploadFile(storagePath, file);
      await updateUserProfile(user.uid, { photoURL: url });
      await updateProfile(user, { photoURL: url });
      await refreshProfile();
      setAvatarMsg("Fotoğraf güncellendi.");
    } catch {
      setAvatarMsg("Yükleme başarısız.");
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /* Avatar kaldır */
  const handleRemoveAvatar = async () => {
    setAvatarUploading(true); setAvatarMsg("");
    try {
      await deleteFileByPath(`avatars/${user.uid}`);
      await updateUserProfile(user.uid, { photoURL: null });
      await updateProfile(user, { photoURL: null });
      await refreshProfile();
      setAvatarMsg("Fotoğraf kaldırıldı.");
    } catch {
      setAvatarMsg("Kaldırma başarısız.");
    } finally {
      setAvatarUploading(false);
    }
  };

  /* Hesap sil */
  const handleDeleteAccount = async () => {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    try {
      await deleteUserData(user.uid, profile.username);
      await deleteUser(user);
      router.push("/");
    } catch {
      alert("Hesap silinemedi. Tekrar giriş yapıp dene.");
    }
  };

  const photoURL = profile.photoURL ?? user.photoURL ?? null;

  return (
    <>
      <AmbientGlow />
      <Navbar />
      <div className="page-content" style={{ paddingTop: "100px", paddingBottom: "80px" }}>

        {/* ── Header ── */}
        <header style={{ marginBottom: "48px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <p className="mono anim-fade-up" style={{ fontSize: "0.72rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "10px" }}>
              /profile
            </p>
            <h1 className="anim-fade-up d2" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text)" }}>
              Profilim
            </h1>
          </div>

          {/* Header butonları */}
          <div className="anim-fade-up d3" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Link
              href="/settings"
              style={{
                padding: "9px 18px", borderRadius: "10px",
                border: "1px solid var(--border)", background: "var(--panel)",
                color: "var(--text-2)", fontSize: "0.82rem", fontWeight: 500,
                textDecoration: "none", backdropFilter: "blur(12px)",
                transition: "all 0.15s", display: "inline-flex", alignItems: "center", gap: "6px",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--accent)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-2)"; }}
            >
              ⚙ Ayarlar
            </Link>
            <button
              onClick={async () => { await logout(); router.push("/"); }}
              style={{
                padding: "9px 18px", borderRadius: "10px",
                border: "1px solid var(--border)", background: "var(--panel)",
                color: "var(--text-2)", fontSize: "0.82rem", fontWeight: 500,
                cursor: "pointer", fontFamily: "var(--font-sans)",
                transition: "all 0.15s", backdropFilter: "blur(12px)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#ef4444"; (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-2)"; }}
            >
              ⎋ Oturumu Kapat
            </button>
          </div>
        </header>

        <div className="profile-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start", maxWidth: "880px" }}>

          {/* ── Sol: Avatar + Profil ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Avatar kartı */}
            <div className="glass anim-fade-up d2" style={{ borderRadius: "20px", padding: "28px" }}>
              <SectionTitle>Fotoğraf</SectionTitle>

              <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
                <Avatar
                  photoURL={photoURL}
                  displayName={profile.displayName || profile.username}
                  uid={user.uid}
                  size={72}
                />
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)", marginBottom: "3px" }}>
                    {profile.displayName || profile.username}
                  </p>
                  <p className="mono" style={{ fontSize: "0.74rem", color: "var(--text-3)" }}>
                    @{profile.username}
                  </p>
                </div>
              </div>

              {/* Upload kontrolleri */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="btn btn-accent"
                  style={{ padding: "8px 16px", fontSize: "0.8rem" }}
                >
                  {avatarUploading ? "Yükleniyor..." : "Fotoğraf Yükle"}
                </button>

                {photoURL && (
                  <button
                    onClick={handleRemoveAvatar}
                    disabled={avatarUploading}
                    className="btn btn-ghost"
                    style={{ padding: "8px 14px", fontSize: "0.8rem" }}
                  >
                    Kaldır
                  </button>
                )}
              </div>

              {avatarMsg && (
                <p style={{ fontSize: "0.78rem", marginTop: "10px", color: avatarMsg.includes("başarısız") ? "#ef4444" : "#10B981" }}>
                  {avatarMsg}
                </p>
              )}

              <p style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: "10px", lineHeight: 1.5 }}>
                JPG, PNG, WebP veya GIF · Maks 5 MB.<br />
                Fotoğraf yoksa baş harflerinden otomatik avatar oluşturulur.
              </p>
            </div>

            {/* Profil bilgileri kartı */}
            <div className="glass anim-fade-up d3" style={{ borderRadius: "20px", padding: "28px" }}>
              <SectionTitle>Profil Bilgileri</SectionTitle>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                <InfoRow label="Email"        value={user.email ?? "—"} />
                <InfoRow label="Hesap Türü"   value={profile.role === "admin" ? "🔑 Admin" : "👤 Kullanıcı"} />
                <InfoRow label="Kayıt Tarihi" value={profile.createdAt ? new Date((profile.createdAt as { seconds: number }).seconds * 1000).toLocaleDateString("tr-TR") : "—"} />
              </div>

              <div style={{ height: "1px", background: "var(--border)", marginBottom: "20px" }} />

              <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <ProfileInput label="Ad Soyad"       type="text" value={displayName} onChange={setDisplayName} />
                <ProfileInput label="Kullanıcı Adı"  type="text" value={newUsername} onChange={(v) => setNewUsername(v.toLowerCase())} mono />

                {msg && <p style={{ fontSize: "0.8rem", color: msg.includes("güncellendi") ? "#10B981" : "#ef4444" }}>{msg}</p>}

                <button type="submit" disabled={saving} className="btn btn-accent" style={{ justifyContent: "center", padding: "11px" }}>
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </form>
            </div>
          </div>

          {/* ── Sağ: Şifre + Tehlikeli ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="glass anim-fade-up d2" style={{ borderRadius: "20px", padding: "28px" }}>
              <SectionTitle>Şifre Değiştir</SectionTitle>
              <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <ProfileInput label="Mevcut Şifre" type="password" value={currentPwd} onChange={setCurrentPwd} />
                <ProfileInput label="Yeni Şifre"   type="password" value={newPwd}     onChange={setNewPwd}     />

                {pwdMsg && <p style={{ fontSize: "0.8rem", color: pwdMsg.includes("değiştirildi") ? "#10B981" : "#ef4444" }}>{pwdMsg}</p>}

                <button type="submit" disabled={pwdSaving} className="btn btn-ghost" style={{ justifyContent: "center", padding: "11px" }}>
                  {pwdSaving ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
                </button>
              </form>
            </div>

            {/* Tehlikeli bölge */}
            <div className="glass anim-fade-up d3" style={{ borderRadius: "16px", padding: "20px", border: "1px solid rgba(239,68,68,0.2)" }}>
              <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#ef4444", marginBottom: "8px" }}>Tehlikeli Bölge</p>
              <p style={{ fontSize: "0.8rem", color: "var(--text-3)", lineHeight: 1.6, marginBottom: "14px" }}>
                Hesabını kalıcı olarak silmek tüm verilerini yok eder. Bu işlem geri alınamaz.
              </p>
              <button
                onClick={handleDeleteAccount}
                style={{
                  padding: "9px 18px", borderRadius: "10px", border: "1px solid rgba(239,68,68,0.4)",
                  background: deleteConfirm ? "rgba(239,68,68,0.15)" : "transparent",
                  color: "#ef4444", fontSize: "0.82rem", fontWeight: 600,
                  cursor: "pointer", transition: "all 0.15s", fontFamily: "var(--font-sans)",
                }}
              >
                {deleteConfirm ? "Emin misin? Tekrar tıkla → SİL" : "Hesabımı Sil"}
              </button>
            </div>
          </div>

        </div>

        <Footer />
      </div>

      <style>{`
        @media (max-width: 640px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}

/* ── Yardımcılar ─────────────────────────────────────────── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "18px" }}>
      {children}
    </p>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
      <span style={{ fontSize: "0.78rem", color: "var(--text-3)", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: "0.78rem", color: "var(--text-2)", wordBreak: "break-all", textAlign: "right" }}>{value}</span>
    </div>
  );
}

function ProfileInput({ label, type, value, onChange, mono }: {
  label: string; type: string; value: string; onChange: (v: string) => void; mono?: boolean;
}) {
  return (
    <div>
      <label className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>
        {label}
      </label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)} required
        style={{
          width: "100%", padding: "10px 14px", borderRadius: "10px",
          border: "1px solid var(--border)", background: "var(--bg)",
          color: "var(--text)", fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
          fontSize: "0.88rem", outline: "none", transition: "border-color 0.15s",
          boxSizing: "border-box",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
        onBlur={(e)  => (e.target.style.borderColor = "var(--border)")}
      />
    </div>
  );
}
