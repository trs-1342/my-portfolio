"use client";

import { useState } from "react";

const SOUQ_SECTIONS = [
  {
    title: "1. Toplanan Veriler",
    body: "Souq; ad, e-posta, telefon numarası ve konum bilgilerini yalnızca platform işlevselliği için toplar. Bu veriler üçüncü şahıslarla paylaşılmaz ve reklam amaçlı kullanılmaz.",
  },
  {
    title: "2. Verilerin Kullanımı",
    body: "Toplanan veriler; hesap yönetimi, ilan yayınlama, kullanıcılar arası iletişim ve platform güvenliğinin sağlanması amacıyla kullanılır.",
  },
  {
    title: "3. Veri Güvenliği",
    body: "Kullanıcı verileri şifrelenmiş ortamlarda saklanır. Şifreler hiçbir zaman düz metin olarak tutulmaz. Güvenlik ihlali tespitinde kullanıcılar derhal bilgilendirilir.",
  },
  {
    title: "4. Çerezler ve Yerel Depolama",
    body: "Uygulama, kullanıcı tercihlerini ve oturum bilgilerini yerel depoda saklar. Bu veriler yalnızca cihazınızda bulunur ve sunucuya gönderilmez.",
  },
  {
    title: "5. Üçüncü Taraf Hizmetler",
    body: "Platform, harita ve konum hizmetleri için cihazın konum API'sini kullanır. Bu veriler Souq sunucularına iletilmez.",
  },
  {
    title: "6. Kullanıcı Hakları (KVKK)",
    body: 'Kişisel Verilerin Korunması Kanunu kapsamında; verilerinize erişme, düzeltme, silme ve taşıma haklarına sahipsiniz.',
  },
  {
    title: "7. Hesap Silme",
    body: 'Hesabınızı ve tüm verilerinizi silmek istediğinizde "Bize Ulaşın" sayfası üzerinden talep oluşturabilirsiniz. Talepler 30 gün içinde işleme alınır.',
  },
  {
    title: "8. Politika Değişiklikleri",
    body: "Bu gizlilik politikası önceden bildirilmeksizin güncellenebilir.",
  },
];

function PrivacyCard({ title, sections }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-6 py-5 flex justify-between items-center hover:bg-zinc-900 transition"
      >
        <span className="font-semibold text-lg">{title}</span>
        <span className="text-zinc-400">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-4">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-white">{section.title}</h3>
              <p className="text-sm text-zinc-300 mt-1 leading-relaxed">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">

        <div>
          <h1 className="text-3xl font-bold">Gizlilik Politikaları</h1>
          <p className="text-zinc-400 mt-2 text-sm">
            Bu sayfa geliştirilen uygulamalar için gizlilik politikalarını içerir.
          </p>
        </div>

        {/* Souq */}
        <PrivacyCard
          title="Souq Uygulaması"
          sections={SOUQ_SECTIONS}
        />

        {/* İleride buraya yeni uygulamalar ekleyebilirsin */}
        {/*
        <PrivacyCard
          title="OpenUni"
          sections={OPENUNI_SECTIONS}
        />
        */}

      </div>
    </main>
  );
}
