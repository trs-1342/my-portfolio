import ThemeToggle from "@/components/ThemeToggle";

export default function Muhattab() {
  return (
    <>
      <main className="page">
        <ThemeToggle />
        <h1 className="page-title">Muhattab</h1>
        <section>
          <h2>Benimle İletişime Geç!</h2>
          <p>Bana ulaşmak için aşağıdaki e-posta adresini kullanabilirsiniz:</p>
          <p>
            <a href="mailto:hattab1342@gmail.com">mail</a>
          </p>
        </section>
      </main>
    </>
  );
}
