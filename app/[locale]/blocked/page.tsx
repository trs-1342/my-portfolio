import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import AmbientGlow from "@/components/AmbientGlow";
import Navbar from "@/components/Navbar";

const PAGE_LABELS: Record<string, Record<string, string>> = {
  tr: { "/contact": "İletişim Formu", "/hsounds": "Hsounds", "/photos": "Fotoğraflar", "/profile": "Profil", "/settings": "Ayarlar" },
  en: { "/contact": "Contact Form", "/hsounds": "Hsounds", "/photos": "Photos", "/profile": "Profile", "/settings": "Settings" },
  ar: { "/contact": "نموذج التواصل", "/hsounds": "Hsounds", "/photos": "الصور", "/profile": "الملف الشخصي", "/settings": "الإعدادات" },
};

interface Props {
  searchParams: Promise<{ path?: string; banned?: string; pages?: string }>;
  params: Promise<{ locale: string }>;
}

export default async function BlockedPage({ searchParams, params }: Props) {
  const { path = "/", banned = "0", pages = "" } = await searchParams;
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Common" });
  const labels = PAGE_LABELS[locale] ?? PAGE_LABELS.en;

  const fullyBanned  = banned === "1";
  const blockedPages = pages.split(",").filter(Boolean);
  const otherBlocked = blockedPages.filter((p) => p !== path);
  const listToShow   = fullyBanned ? blockedPages : otherBlocked;

  const titles: Record<string, { banned: string; restricted: string; bannedBody: string; restrictedBody: string; bannedList: string; otherList: string }> = {
    tr: { banned: "Hesabın Engellendi", restricted: "Bu Sayfaya Erişim Kısıtlandı", bannedBody: "Hesabın yönetici tarafından tamamen engellendi.", restrictedBody: `${labels[path] ?? path} sayfasına erişimin kısıtlandı.`, bannedList: "Kısıtlanan erişimler", otherList: "Diğer kısıtlanan sayfalar" },
    en: { banned: "Account Blocked", restricted: "Access Restricted", bannedBody: "Your account has been fully blocked by an admin.", restrictedBody: `Access to ${labels[path] ?? path} has been restricted.`, bannedList: "Restricted pages", otherList: "Other restricted pages" },
    ar: { banned: "تم حظر الحساب", restricted: "الوصول مقيّد", bannedBody: "تم حظر حسابك بالكامل من قِبَل المسؤول.", restrictedBody: `تم تقييد الوصول إلى ${labels[path] ?? path}.`, bannedList: "الصفحات المحظورة", otherList: "صفحات محظورة أخرى" },
  };
  const tx = titles[locale] ?? titles.en;

  return (
    <>
      <AmbientGlow />
      <Navbar />

      <div className="page-content" style={{ paddingTop: "100px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div className="glass anim-fade-up" style={{ borderRadius: "24px", padding: "48px 40px", maxWidth: "480px", width: "100%", textAlign: "center", border: "1px solid rgba(239,68,68,0.2)", boxShadow: "0 0 40px rgba(239,68,68,0.06)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "20px" }}>🚫</div>

          <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text)", marginBottom: "12px", letterSpacing: "-0.02em" }}>
            {fullyBanned ? tx.banned : tx.restricted}
          </h1>

          <p style={{ fontSize: "0.88rem", color: "var(--text-2)", lineHeight: 1.7, marginBottom: "24px" }}>
            {fullyBanned ? tx.bannedBody : tx.restrictedBody}
          </p>

          {listToShow.length > 0 && (
            <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "12px", padding: "14px 16px", marginBottom: "24px", textAlign: "left" }}>
              <p className="mono" style={{ fontSize: "0.68rem", color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
                {fullyBanned ? tx.bannedList : tx.otherList}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {listToShow.map((p) => (
                  <span key={p} style={{ padding: "3px 10px", borderRadius: "999px", background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", fontSize: "0.75rem" }}>
                    {labels[p] ?? p}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Link href="/" className="btn btn-ghost" style={{ display: "inline-flex" }}>
            {t("back")}
          </Link>
        </div>
      </div>
    </>
  );
}
