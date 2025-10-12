import ThemeToggle from "@/components/ThemeToggle";
import Nav from "@/components/Nav";

export default function HSoundsPage() {
  return (
    <main className="page">
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
    </main>
  );
}
