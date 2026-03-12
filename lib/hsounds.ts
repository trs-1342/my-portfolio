/**
 * HSounds veri servisi — ileride Firebase Firestore ile değiştirilecek.
 * Tüm fonksiyonlar async/await yapısındadır (Firebase uyumlu).
 */

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;   // Markdown benzeri HTML string
  created_at: string;   // ISO 8601
  read_time: number;    // dakika
  is_published: boolean;
}

export interface RssFeed {
  id: string;
  source_name: string;
  source_icon: string;  // emoji veya URL
  title: string;
  link: string;
  published_date: string; // ISO 8601
}

/* ── Mock Articles ─────────────────────────────────────────── */
const MOCK_ARTICLES: Article[] = [
  {
    id: "a1",
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
<p>Kendi çalışmalarımda şu üç ilkeyi rehber ediniyorum:</p>

<p><strong>1. Şeffaflık</strong> — Sistemin ne yaptığı, kullanıcı tarafından anlaşılabilir olmalı. Gizli davranış, gizli etki yaratır.</p>

<p><strong>2. Minimalizm</strong> — Gerekenden fazla veri toplama, gerekenden fazla izin isteme. Her "sadece olsun" kararı bir kayıp yükümlülüğüdür.</p>

<p><strong>3. Geri alınabilirlik</strong> — Kullanıcının verdiği her kararı geri alabilmesi gerekir. Hesap silebilmek, veri indirebilmek, abonelikten çıkabilmek.</p>

<h2>Son Söz</h2>
<p>Ahlaki yazılım, mükemmel yazılım değildir. Bug'ı olmayan, hızlı çalışan kod yazmak gibi bir hedef değil. Aksine süregelen bir farkındalık halidir. Her gün, her satırda "bu doğru mu?" diye sormak.</p>

<p>Ben bu soruyu sormaktan vazgeçmeyeceğim.</p>`,
    created_at: "2026-02-14T10:00:00Z",
    read_time: 6,
    is_published: true,
  },
  {
    id: "a2",
    slug: "arch-linuxa-gecisin-anatomisi",
    title: "Arch Linux'a Geçişin Anatomisi",
    excerpt: "Ubuntu'dan Arch'a geçerken yaşadıklarım, öğrendiklerim ve geri dönmek istemememin nedenleri.",
    content: `<p>Ubuntu, iyi bir dağıtım. Ama bir gün fark ettim ki her şey benim için halledilmiş, ve bu beni rahatsız etmeye başladı. "Neden?" diye sormak yerine, "tamam çalışıyor" diyordum. Bu alışkanlık tehlikeliydi.</p>

<h2>Neden Arch?</h2>
<p>Arch Linux'un felsefesi <strong>KISS</strong>: Keep It Simple, Stupid. Sistem, sadece senin yüklediğin şeylerden oluşur. Kurulum sırasında bir GUI yok. Bir sihirbaz yok. Sadece bir terminal, bir internet bağlantısı ve Arch Wiki.</p>

<p>İlk kurulum denemem 3 saatimi aldı ve başarısız oldu. İkincisi 2 saat — beklediğimden çalıştı. Üçüncüsü 45 dakika. Şimdi gözlerim kapalı yapabiliyorum.</p>

<h2>Öğrendiğim Şeyler</h2>
<p>Arch kurulumu gerçek anlamda bir eğitim. Şunları öğrendim:</p>

<p><strong>Partition tablosu ve mount:</strong> <code>fdisk</code>, <code>mkfs.ext4</code>, <code>/mnt</code>'ye mount etmek. Daha önce bunların varlığından bile habersizdim.</p>

<p><strong>Bootloader:</strong> GRUB'u elle kurmak. EFI vs BIOS farkını anlamak. <code>grub-install</code> ve <code>grub-mkconfig</code>.</p>

<p><strong>systemd:</strong> Servisleri enable/disable etmek, journalctl ile log okumak. Ubuntu'da bunlar perde arkasındaydı.</p>

<p><strong>pacman:</strong> Ubuntu'nun <code>apt</code>'sine alışmıştım ama <code>pacman</code> çok daha hızlı ve sadeliğiyle tatmin edici.</p>

<h2>AUR: Harika ve Tehlikeli</h2>
<p>Arch User Repository, kullanıcıların paket script'leri paylaştığı bir ekosistem. Neredeyse her şeyi bulabilirsiniz — ama dikkatli olmalısınız. PKGBUILD'i okumadan yüklemek, kaynağı bilinmeyen kodu çalıştırmaktır.</p>

<blockquote>AUR bir nimet, ama güveni körce dağıtmak tehlikelidir. Her PKGBUILD, bir güven kararıdır.</blockquote>

<h2>Geri Dönmek İstemememin Nedenleri</h2>
<p>Arch'ta sistemi gerçekten <em>anlıyorsunuz</em>. Bir şey bozulduğunda, neden bozulduğunu tahmin edebiliyorsunuz. Ubuntu'da "sudo apt update && sudo apt upgrade" dışında pek bir şey yapmıyordum. Arch'ta günlük olarak sistemimle bir diyalog halindeyim.</p>

<p>Bu diyalog bazen sinir bozucu. Ama sonunda özgürleştirici.</p>`,
    created_at: "2026-01-28T14:30:00Z",
    read_time: 8,
    is_published: true,
  },
  {
    id: "a3",
    slug: "c-dilinde-bellek-ozgurluk-ve-sorumluluk",
    title: "C Dilinde Bellek: Özgürlük ve Sorumluluk",
    excerpt: "malloc, free ve aradaki ince çizgi. Bellek sızıntıları neden olur ve nasıl debug edilir?",
    content: `<p>C öğrenmeye başladığımda, garbage collector'a alışmış bir zihinle gelmiştim. "Bellek kendiliğinden temizleniyor değil mi?" Hayır. C'de temizlik sizin işiniz.</p>

<h2>Stack vs Heap</h2>
<p>C'de iki tür bellek alanı var:</p>

<p><strong>Stack:</strong> Fonksiyon çağrıldığında otomatik ayrılır, fonksiyon bitince otomatik serbest bırakılır. Hızlı, ama sınırlı. Büyük diziler veya dinamik boyutlu yapılar için uygun değil.</p>

<p><strong>Heap:</strong> <code>malloc</code>/<code>calloc</code>/<code>realloc</code> ile elle alınır. Ömrü programcının kontrolünde. <code>free()</code> çağırılana kadar yaşar — ya da program bitene kadar. İşte sorun da burada.</p>

<h2>malloc ve Dönüş Değeri</h2>
<p>Yeni başlayanların sıkça yaptığı hata: malloc'un döndürdüğü değeri kontrol etmemek.</p>

<pre><code>int *arr = malloc(sizeof(int) * n);
arr[0] = 42; // YANLIŞ — malloc NULL döndürdüyse?</code></pre>

<p>Doğrusu:</p>

<pre><code>int *arr = malloc(sizeof(int) * n);
if (arr == NULL) {
    fprintf(stderr, "Bellek ayrılamadı\\n");
    exit(EXIT_FAILURE);
}</code></pre>

<h2>Bellek Sızıntısı Neden Olur?</h2>
<p>Basit: heap'te allocate ettiğiniz belleği free etmeden pointer'ı kaybederseniz. O bellek artık erişilemez ama işletim sistemi tarafından da geri alınamaz — program çalıştığı sürece.</p>

<blockquote>Bellek sızıntısı sessizdir. Program çalışmaya devam eder. Sadece yavaşlar, şişer ve eninde sonunda çöker.</blockquote>

<h2>Valgrind ile Debug</h2>
<p>Linux'ta en güçlü araç Valgrind:</p>

<pre><code>valgrind --leak-check=full ./program</code></pre>

<p>Çıktıda "definitely lost" gördüğünüzde, free edilmemiş bir allocation var demektir. Satır numarasını gösterir — doğrudan kaynak noktasına götürür.</p>

<h2>AddressSanitizer</h2>
<p>GCC/Clang ile derleme sırasında ekleyebileceğiniz güçlü bir araç:</p>

<pre><code>gcc -fsanitize=address -g program.c -o program</code></pre>

<p>Use-after-free, buffer overflow ve heap underflow hatalarını anında yakalar. Valgrind'den daha hızlı çalışır.</p>

<h2>Özgürlük ve Sorumluluk</h2>
<p>C'nin size verdiği şey gerçek bir özgürlük: belleği tam olarak kontrol edebiliyorsunuz. Ama bu özgürlük, her satırda sorumluluk gerektiriyor. Rust bu sorumluluğu compiler'a taşıyor. C ise ona güveniyor: size.</p>`,
    created_at: "2026-01-10T09:15:00Z",
    read_time: 11,
    is_published: true,
  },
  {
    id: "a4",
    slug: "nextjs-app-router-gercek-dunya-notlari",
    title: "Next.js App Router: Gerçek Dünya Notları",
    excerpt: "Server Components, streaming ve data fetching pattern'leri üzerine gözlemlerim.",
    content: `<p>Next.js 13 ile gelen App Router, React ekosistemindeki en büyük paradigma kaymasıydı. Pages Router'dan geçiş yaparken "neden böyle?" diye sorduğum her şeyi yazdım.</p>

<h2>Server Components: Sessiz Devrim</h2>
<p>React Server Components (RSC), component'ların sunucuda render edilip client'a HTML olarak gönderilmesi demek. Bu şu anlama geliyor:</p>

<p>- Bundle size sıfır (client JS yok)<br/>
- Veritabanına doğrudan erişim (API layer olmadan)<br/>
- Secrets güvende (process.env server'da kalıyor)</p>

<p>Ama dikkat: RSC'lerde <code>useState</code>, <code>useEffect</code>, event handler yok. "use client" direktifi ile açıkça işaretlemeden interaktivite ekleyemezsiniz.</p>

<h2>Async Server Components</h2>
<p>En güçlü özellik belki de bu. Bir component'ı <code>async</code> yapıp içinde <code>await</code> kullanabiliyorsunuz:</p>

<pre><code>export default async function ProjectList() {
  const projects = await getProjects(); // doğrudan DB çağrısı
  return projects.map(p => &lt;ProjectCard key={p.id} {...p} /&gt;);
}</code></pre>

<p>Pages Router'daki <code>getServerSideProps</code> boilerplate'i tamamen ortadan kalkıyor.</p>

<h2>Streaming ile Kademeli Yükleme</h2>
<p><code>Suspense</code> ile yavaş veri çeken component'ları izole edebilirsiniz:</p>

<pre><code>&lt;Suspense fallback={&lt;Skeleton /&gt;}&gt;
  &lt;SlowDataComponent /&gt;
&lt;/Suspense&gt;</code></pre>

<p>Sayfa önce hızlı kısımlarıyla render olur, yavaş kısım hazır olunca akış tamamlanır. Kullanıcı boş ekran görmez.</p>

<blockquote>Streaming, "ya hep ya hiç" render modelinden "kademeli" render modeline geçiştir. UX açısından büyük fark yaratıyor.</blockquote>

<h2>Route Handlers</h2>
<p><code>app/api/route.ts</code> yapısı, Pages Router'daki <code>pages/api</code>'ye göre daha temiz. Request/Response nesneleri standart Web API'ye dayanıyor:</p>

<pre><code>export async function POST(req: Request) {
  const body = await req.json();
  return Response.json({ ok: true });
}</code></pre>

<h2>Gözlemlerim</h2>
<p>App Router, Pages Router'a göre öğrenme eğrisi daha dik. Ama üretkenlik, anladıktan sonra çarpıcı biçimde artıyor. Bu portfolio sitesi tamamen App Router ile yazıldı — ve çok memnunum.</p>`,
    created_at: "2025-12-22T16:00:00Z",
    read_time: 9,
    is_published: true,
  },
  {
    id: "a5",
    slug: "firebase-vs-supabase-2026-karsilastirmasi",
    title: "Firebase vs Supabase: 2026 Karşılaştırması",
    excerpt: "Her ikisini de production'da kullandıktan sonra çıkardığım dersler ve tercihim.",
    content: `<p>İki farklı projede ikisini de kullandım. Birini seven diğerinden nefret edebiliyor — çünkü farklı problemler için tasarlandılar.</p>

<h2>Firebase: Hız ve Gerçek Zamanlılık</h2>
<p>Firebase'in güçlü olduğu yer: gerçek zamanlı uygulamalar. Firestore'un <code>onSnapshot</code> listener'ı ile veri değişimlerini anında yakalıyorsunuz. Chat uygulaması, canlı dashboard, multiplayer oyun — burada Firebase açık ara önde.</p>

<p>Auth da çok güçlü. Email/password, Google, GitHub, Apple — tek satır ile. Custom claims ile rol tabanlı yetkilendirme kolaylıkla yapılabiliyor.</p>

<p><strong>Dezavantajlar:</strong> Vendor lock-in gerçek. NoSQL yapısı karmaşık sorguları zorlaştırıyor. Fiyatlandırma öngörülemez — ölçeklenince sürpriz faturalar gelebilir.</p>

<h2>Supabase: PostgreSQL'in Gücü</h2>
<p>Supabase aslında yönetilen bir PostgreSQL. Eğer SQL biliyorsanız, hemen verimli olabiliyorsunuz. Row Level Security (RLS) ile veritabanı seviyesinde yetkilendirme yapılabiliyor — güvenlik açısından çok daha sağlam bir model.</p>

<p>Storage, Edge Functions, Realtime (Postgres CDC tabanlı) — Firebase'dekine benzer özellikler ama açık kaynak altyapısıyla.</p>

<p><strong>Dezavantajlar:</strong> Firebase'in realtime özelliği kadar sezgisel değil. Bazı edge case'lerde dokümantasyon eksik kalabiliyor.</p>

<blockquote>Firebase hızlı prototype için, Supabase uzun ömürlü production için. Bu kural çoğu durumda geçerli.</blockquote>

<h2>2026'da Tercihim</h2>
<p>Yeni bir proje başlıyorsam, varsayılan seçimim Supabase. Neden?</p>

<p>- SQL bilgim doğrudan transfer oluyor<br/>
- Açık kaynak, self-host mümkün<br/>
- Fiyat öngörülebilir<br/>
- Tip güvenliği (<code>supabase gen types</code>) mükemmel</p>

<p>Gerçek zamanlı özellik kritikse veya çok hızlı bir MVP gerekiyorsa Firebase'e dönüyorum. Her ikisi de araç — hangisini ne zaman kullanacağını bilmek önemli olan.</p>`,
    created_at: "2025-12-05T11:45:00Z",
    read_time: 7,
    is_published: true,
  },
];

/* ── Mock RSS Feeds ────────────────────────────────────────── */
const MOCK_RSS: RssFeed[] = [
  {
    id: "r1",
    source_name: "The Pragmatic Engineer",
    source_icon: "🔧",
    title: "How Big Tech Builds Reliable Systems",
    link: "#",
    published_date: "2026-03-10T08:00:00Z",
  },
  {
    id: "r2",
    source_name: "Hacker News",
    source_icon: "🟠",
    title: "Show HN: A terminal-based project manager written in C",
    link: "#",
    published_date: "2026-03-09T15:20:00Z",
  },
  {
    id: "r3",
    source_name: "CSS-Tricks",
    source_icon: "✨",
    title: "Mastering CSS Grid with Subgrid",
    link: "#",
    published_date: "2026-03-08T10:00:00Z",
  },
  {
    id: "r4",
    source_name: "Lobsters",
    source_icon: "🦞",
    title: "Memory safety in C: a practical guide with Valgrind",
    link: "#",
    published_date: "2026-03-07T12:30:00Z",
  },
  {
    id: "r5",
    source_name: "Overreacted",
    source_icon: "⚛️",
    title: "Why Do React Server Components Exist?",
    link: "#",
    published_date: "2026-03-05T09:00:00Z",
  },
  {
    id: "r6",
    source_name: "LWN.net",
    source_icon: "🐧",
    title: "The state of Wayland compositors in 2026",
    link: "#",
    published_date: "2026-03-03T14:00:00Z",
  },
];

/* ── Servis fonksiyonları (async — Firebase uyumlu API yüzeyi) ── */

export async function getArticles(): Promise<Article[]> {
  // TODO: return await db.collection("articles").where("is_published", "==", true).get()
  return MOCK_ARTICLES.filter((a) => a.is_published);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  // TODO: return await db.collection("articles").where("slug", "==", slug).limit(1).get()
  return MOCK_ARTICLES.find((a) => a.slug === slug && a.is_published) ?? null;
}

export async function getRssFeeds(): Promise<RssFeed[]> {
  // TODO: return await db.collection("rssFeeds").orderBy("published_date", "desc").get()
  return MOCK_RSS;
}
