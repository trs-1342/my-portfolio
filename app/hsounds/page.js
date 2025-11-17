import ThemeToggle from "@/components/ThemeToggle";
import Nav from "@/components/Nav";

export default function HSoundsPage() {
  return (
    <div className="page">
      <div>
        <ThemeToggle />
        <Nav />
        <h1 className="page-title">HSounds</h1>
        <section>
          <h2>HSounds Ne Demek?</h2>
          <p>
            H = halil, sounds ise sesler anlamına gelir. Yani Halil&#39;in Sesleri.
          </p>
          <h2>HSounds Nedir?</h2>
          <p>
            Bu sayfada projelerimi, fikirlerimi ve duyurularımı yayınlayacağım
          </p>
          <p>
            Burada atılan gönderileri RSS bağlantısı ile APK uygulamaları çekecek
            ve kullanıcıya gösterecek <small>veya</small> Oturum açma işlemi
            getirip kullanıcıların Web arayüzünden okumalarını sağlarım.
          </p>
        </section>
        <br />
        <hr />
        <br />
        <b>Çok yakında burada olacağım!</b>
      </div>
      <main className="container">
        <h1>HSounds</h1>
        <p>Burada projelerimi, fikirlerimi ve duyurularımı paylaşıyorum.</p>

        {hsoundsPosts.length === 0 && <p>Şimdilik gönderi yok. Çok yakında burada olacağım!</p>}

        <ul>
          {hsoundsPosts.map((post) => (
            <li key={post.slug}>
              <h2>{post.title}</h2>
              <p>{post.summary}</p>
              <small>{new Date(post.date).toLocaleDateString("tr-TR")}</small>
              {/* İleride detay sayfası açarsan: */}
              {/* <Link href={`/hsounds/${post.slug}`}>Detay</Link> */}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
