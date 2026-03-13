"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { updateUserProfile, updateUsername, deleteUserData } from "@/lib/firestore";
import { deleteUser } from "firebase/auth";
import AmbientGlow from "@/components/AmbientGlow";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ProfilePage() {
  const { user, profile, loading, logout, changePassword, refreshProfile } = useAuth();
  const router = useRouter();

  const [displayName,  setDisplayName]  = useState("");
  const [newUsername,  setNewUsername]  = useState("");
  const [currentPwd,   setCurrentPwd]   = useState("");
  const [newPwd,       setNewPwd]       = useState("");
  const [saving,       setSaving]       = useState(false);
  const [pwdSaving,    setPwdSaving]    = useState(false);
  const [msg,          setMsg]          = useState("");
  const [pwdMsg,       setPwdMsg]       = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  /* Profil yüklenince form state'lerini doldur */
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? "");
      setNewUsername(profile.username ?? "");
    }
  }, [profile]);

  /* Auth sonuçlanınca yönlendir */
  useEffect(() => {
    if (loading) return;
    if (!user) router.push("/login");
    else if (!profile) router.push("/setup-username");
  }, [loading, user, profile, router]);

  /* Yükleniyor */
  if (loading || !user || !profile) {
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

  return (
    <>
      <AmbientGlow />
      <Navbar />
      <div className="page-content" style={{ paddingTop: "100px", paddingBottom: "80px" }}>
        <header style={{ marginBottom: "48px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <p className="mono anim-fade-up" style={{ fontSize: "0.72rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "10px" }}>/profile</p>
            <h1 className="anim-fade-up d2" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text)" }}>
              Profilim
            </h1>
          </div>
          <button
            onClick={async () => { await logout(); router.push("/"); }}
            className="anim-fade-up d3"
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
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start", maxWidth: "880px" }}>

          {/* Profil Bilgileri */}
          <div className="glass anim-fade-up d2" style={{ borderRadius: "20px", padding: "28px" }}>
            <SectionTitle>Profil Bilgileri</SectionTitle>

            {/* Readonly bilgiler */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              <InfoRow label="User ID"    value={user.uid} mono />
              <InfoRow label="Email"      value={user.email ?? "—"} />
              <InfoRow label="Hesap Türü" value={profile.role === "admin" ? "🔑 Admin" : "👤 Kullanıcı"} />
              <InfoRow label="Kayıt Tarihi" value={profile.createdAt ? new Date((profile.createdAt as { seconds: number }).seconds * 1000).toLocaleDateString("tr-TR") : "—"} />
            </div>

            <div style={{ height: "1px", background: "var(--border)", marginBottom: "20px" }} />

            {/* Düzenlenebilir alanlar */}
            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <ProfileInput label="Ad Soyad"   type="text"  value={displayName} onChange={setDisplayName} />
              <ProfileInput label="Kullanıcı Adı" type="text" value={newUsername} onChange={(v) => setNewUsername(v.toLowerCase())} mono />

              {msg && <p style={{ fontSize: "0.8rem", color: msg.includes("güncellendi") ? "#10B981" : "#ef4444" }}>{msg}</p>}

              <button type="submit" disabled={saving} className="btn btn-accent" style={{ justifyContent: "center", padding: "11px" }}>
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </form>
          </div>

          {/* Şifre Değiştir */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="glass anim-fade-up d3" style={{ borderRadius: "20px", padding: "28px" }}>
              <SectionTitle>Şifre Değiştir</SectionTitle>
              <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <ProfileInput label="Mevcut Şifre"  type="password" value={currentPwd} onChange={setCurrentPwd} />
                <ProfileInput label="Yeni Şifre"    type="password" value={newPwd}     onChange={setNewPwd}     />

                {pwdMsg && <p style={{ fontSize: "0.8rem", color: pwdMsg.includes("değiştirildi") ? "#10B981" : "#ef4444" }}>{pwdMsg}</p>}

                <button type="submit" disabled={pwdSaving} className="btn btn-ghost" style={{ justifyContent: "center", padding: "11px" }}>
                  {pwdSaving ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
                </button>
              </form>
            </div>

            {/* Hesap Sil */}
            <div className="glass anim-fade-up d4" style={{ borderRadius: "16px", padding: "20px", border: "1px solid rgba(239,68,68,0.2)" }}>
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
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mono" style={{ fontSize: "0.68rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "18px" }}>
      {children}
    </p>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
      <span style={{ fontSize: "0.78rem", color: "var(--text-3)", flexShrink: 0 }}>{label}</span>
      <span className={mono ? "mono" : ""} style={{ fontSize: "0.78rem", color: "var(--text-2)", wordBreak: "break-all", textAlign: "right" }}>{value}</span>
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
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
        onBlur={(e)  => (e.target.style.borderColor = "var(--border)")}
      />
    </div>
  );
}
