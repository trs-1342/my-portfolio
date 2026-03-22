import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

/* ── Mock makaleler ── */
const MOCK_ARTICLES = [
  {
    slug: "ahlaki-yazilim-nedir",
    title: "Ahlaki Yazılım Nedir?",
    excerpt: "Bir yazılımcı olarak sadece çalışan kod üretmek yeterli mi? Ahlaki sorumluluk nerede başlıyor?",
    content: `<p>Yazılım geliştirirken çoğu zaman tek sorumuz şudur: "Çalışıyor mu?" Ama bu sorunun ötesinde, çok daha ağır bir soru bizi bekliyor: <strong>"Doğru mu yapıyor?"</strong></p>

<h2>Kodun Görünmez Etkisi</h2>
<p>Bir algoritma tasarladığınızda, kullanıcı arayüzü kurduğunuzda ya da bir veritabanı şeması belirlediğinizde — aslında bir karar alıyorsunuz. Bu kararlar binlerce, bazen milyonlarca insanı etkiliyor. Ama biz yazılımcılar genellikle bu etkiyi görmüyoruz. Ekrana bakıyoruz, koda bakıyoruz.</p>

<p>Dark pattern tasarlayan bir UX geliştirici "sadece tasarım" yapıyor. Sizi gizlice takip eden bir analytics sistemi kuran yazılımcı "sadece kod" yazıyor. Peki bu ayrım ne kadar meşru?</p>

<h2>Sorumluluk Nerede Başlar?</h2>
<p>Bence şurada: <em>Eğer yazdığın kod başka bir insanı etkiliyor ve sen bunu biliyorsan, sorumluluk başlamış demektir.</em></p>

<p>Bu tanım çok geniş, evet. Ama bilinçli olarak daraltmak istiyorum. "Etkilemek" derken şunu kastediyorum: kullanıcının zamanını, parasını, mahremiyetini veya özgürlüğünü —izni olmadan— azaltan her şey.</p>

<blockquote>Yazılım ahlakı, soyut bir felsefe değil. Her commit'te, her feature'da, her API tasarımında karşımıza çıkan bir pratik sorudur.</blockquote>

<h2>Üç Somut İlke</h2>
<p><strong>1. Şeffaflık</strong> — Sistemin ne yaptığı, kullanıcı tarafından anlaşılabilir olmalı.</p>
<p><strong>2. Minimalizm</strong> — Gerekenden fazla veri toplama, gerekenden fazla izin isteme.</p>
<p><strong>3. Geri alınabilirlik</strong> — Kullanıcının verdiği her kararı geri alabilmesi gerekir.</p>

<h2>Son Söz</h2>
<p>Ahlaki yazılım, mükemmel yazılım değildir. Aksine süregelen bir farkındalık halidir. Her gün, her satırda "bu doğru mu?" diye sormak.</p>`,
    created_at: "2026-02-14T10:00:00Z",
    read_time: 6,
    is_published: true,
  },
  {
    slug: "arch-linuxa-gecisin-anatomisi",
    title: "Arch Linux'a Geçişin Anatomisi",
    excerpt: "Ubuntu'dan Arch'a geçerken yaşadıklarım, öğrendiklerim ve geri dönmek istemememin nedenleri.",
    content: `<p>Ubuntu, iyi bir dağıtım. Ama bir gün fark ettim ki her şey benim için halledilmiş, ve bu beni rahatsız etmeye başladı.</p>

<h2>Neden Arch?</h2>
<p>Arch Linux'un felsefesi <strong>KISS</strong>: Keep It Simple, Stupid. Sistem, sadece senin yüklediğin şeylerden oluşur.</p>

<h2>Öğrendiğim Şeyler</h2>
<p><strong>Partition tablosu ve mount:</strong> <code>fdisk</code>, <code>mkfs.ext4</code>, <code>/mnt</code>'ye mount etmek.</p>
<p><strong>Bootloader:</strong> GRUB'u elle kurmak. EFI vs BIOS farkını anlamak.</p>
<p><strong>systemd:</strong> Servisleri enable/disable etmek, journalctl ile log okumak.</p>
<p><strong>pacman:</strong> Ubuntu'nun <code>apt</code>'sine alışmıştım ama <code>pacman</code> çok daha hızlı.</p>

<h2>AUR: Harika ve Tehlikeli</h2>
<blockquote>AUR bir nimet, ama güveni körce dağıtmak tehlikelidir. Her PKGBUILD, bir güven kararıdır.</blockquote>

<h2>Geri Dönmek İstemememin Nedenleri</h2>
<p>Arch'ta sistemi gerçekten <em>anlıyorsunuz</em>. Bu diyalog bazen sinir bozucu. Ama sonunda özgürleştirici.</p>`,
    created_at: "2026-01-28T14:30:00Z",
    read_time: 8,
    is_published: true,
  },
  {
    slug: "c-dilinde-bellek-ozgurluk-ve-sorumluluk",
    title: "C Dilinde Bellek: Özgürlük ve Sorumluluk",
    excerpt: "malloc, free ve aradaki ince çizgi. Bellek sızıntıları neden olur ve nasıl debug edilir?",
    content: `<p>C öğrenmeye başladığımda, garbage collector'a alışmış bir zihinle gelmiştim.</p>

<h2>Stack vs Heap</h2>
<p><strong>Stack:</strong> Fonksiyon çağrıldığında otomatik ayrılır, bitince otomatik serbest bırakılır.</p>
<p><strong>Heap:</strong> <code>malloc</code>/<code>calloc</code> ile elle alınır. <code>free()</code> çağırılana kadar yaşar.</p>

<h2>malloc ve Dönüş Değeri</h2>
<pre><code>int *arr = malloc(sizeof(int) * n);
if (arr == NULL) {
    fprintf(stderr, "Bellek ayrılamadı\\n");
    exit(EXIT_FAILURE);
}</code></pre>

<h2>Bellek Sızıntısı Neden Olur?</h2>
<blockquote>Bellek sızıntısı sessizdir. Program çalışmaya devam eder. Sadece yavaşlar, şişer ve eninde sonunda çöker.</blockquote>

<h2>Valgrind ile Debug</h2>
<pre><code>valgrind --leak-check=full ./program</code></pre>

<h2>Özgürlük ve Sorumluluk</h2>
<p>C'nin size verdiği şey gerçek bir özgürlük: belleği tam olarak kontrol edebiliyorsunuz. Rust bu sorumluluğu compiler'a taşıyor. C ise size güveniyor.</p>`,
    created_at: "2026-01-10T09:15:00Z",
    read_time: 11,
    is_published: true,
  },
  {
    slug: "nextjs-app-router-gercek-dunya-notlari",
    title: "Next.js App Router: Gerçek Dünya Notları",
    excerpt: "Server Components, streaming ve data fetching pattern'leri üzerine gözlemlerim.",
    content: `<p>Next.js 13 ile gelen App Router, React ekosistemindeki en büyük paradigma kaymasıydı.</p>

<h2>Server Components: Sessiz Devrim</h2>
<p>React Server Components (RSC), component'ların sunucuda render edilip client'a HTML olarak gönderilmesi demek.</p>
<p>- Bundle size sıfır<br/>- Veritabanına doğrudan erişim<br/>- Secrets güvende</p>

<h2>Async Server Components</h2>
<pre><code>export default async function ProjectList() {
  const projects = await getProjects();
  return projects.map(p => &lt;ProjectCard key={p.id} {...p} /&gt;);
}</code></pre>

<h2>Streaming ile Kademeli Yükleme</h2>
<pre><code>&lt;Suspense fallback={&lt;Skeleton /&gt;}&gt;
  &lt;SlowDataComponent /&gt;
&lt;/Suspense&gt;</code></pre>

<blockquote>Streaming, "ya hep ya hiç" render modelinden "kademeli" render modeline geçiştir.</blockquote>

<h2>Gözlemlerim</h2>
<p>App Router, Pages Router'a göre öğrenme eğrisi daha dik. Ama üretkenlik, anladıktan sonra çarpıcı biçimde artıyor.</p>`,
    created_at: "2025-12-22T16:00:00Z",
    read_time: 9,
    is_published: true,
  },
  {
    slug: "firebase-vs-supabase-2026-karsilastirmasi",
    title: "Firebase vs Supabase: 2026 Karşılaştırması",
    excerpt: "Her ikisini de production'da kullandıktan sonra çıkardığım dersler ve tercihim.",
    content: `<p>İki farklı projede ikisini de kullandım. Birini seven diğerinden nefret edebiliyor — çünkü farklı problemler için tasarlandılar.</p>

<h2>Firebase: Hız ve Gerçek Zamanlılık</h2>
<p>Firebase'in güçlü olduğu yer: gerçek zamanlı uygulamalar. Firestore'un <code>onSnapshot</code> listener'ı ile veri değişimlerini anında yakalıyorsunuz.</p>
<p><strong>Dezavantajlar:</strong> Vendor lock-in gerçek. NoSQL yapısı karmaşık sorguları zorlaştırıyor.</p>

<h2>Supabase: PostgreSQL'in Gücü</h2>
<p>Supabase aslında yönetilen bir PostgreSQL. Row Level Security (RLS) ile veritabanı seviyesinde yetkilendirme yapılabiliyor.</p>
<p><strong>Dezavantajlar:</strong> Firebase'in realtime özelliği kadar sezgisel değil.</p>

<blockquote>Firebase hızlı prototype için, Supabase uzun ömürlü production için.</blockquote>

<h2>2026'da Tercihim</h2>
<p>Yeni bir proje başlıyorsam, varsayılan seçimim Supabase. SQL bilgim doğrudan transfer oluyor, açık kaynak, fiyat öngörülebilir.</p>`,
    created_at: "2025-12-05T11:45:00Z",
    read_time: 7,
    is_published: true,
  },
];

/* ── Mock RSS Feeds ── */
const MOCK_FEEDS = [
  { source_name: "The Pragmatic Engineer", source_icon: "🔧", title: "How Big Tech Builds Reliable Systems", link: "#", published_date: "2026-03-10T08:00:00Z" },
  { source_name: "Hacker News", source_icon: "🟠", title: "Show HN: A terminal-based project manager written in C", link: "#", published_date: "2026-03-09T15:20:00Z" },
  { source_name: "CSS-Tricks", source_icon: "✨", title: "Mastering CSS Grid with Subgrid", link: "#", published_date: "2026-03-08T10:00:00Z" },
  { source_name: "Lobsters", source_icon: "🦞", title: "Memory safety in C: a practical guide with Valgrind", link: "#", published_date: "2026-03-07T12:30:00Z" },
  { source_name: "Overreacted", source_icon: "⚛️", title: "Why Do React Server Components Exist?", link: "#", published_date: "2026-03-05T09:00:00Z" },
  { source_name: "LWN.net", source_icon: "🐧", title: "The state of Wayland compositors in 2026", link: "#", published_date: "2026-03-03T14:00:00Z" },
];

export async function POST() {
  try {
    /* Oturum doğrula */
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const decoded = await adminAuth.verifyIdToken(session);
    const userDoc = await adminDb.doc(`users/${decoded.uid}`).get();
    if (!userDoc.exists || userDoc.data()?.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }

    /* Makaleleri aktar */
    const batch = adminDb.batch();
    for (const article of MOCK_ARTICLES) {
      const ref = adminDb.collection("hsounds_articles").doc();
      batch.set(ref, article);
    }
    await batch.commit();

    /* RSS beslemelerini aktar */
    const feeds = MOCK_FEEDS.map((f, i) => ({ id: `r${i + 1}`, ...f }));
    await adminDb.doc("site_config/hsounds_feeds").set({ feeds });

    return NextResponse.json({ ok: true, articles: MOCK_ARTICLES.length, feeds: feeds.length });
  } catch (err) {
    console.error("import-hsounds hatası:", err);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
