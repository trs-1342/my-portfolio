// app/muhattab/page.js
import { cookies } from "next/headers";
import Link from "next/link";
import Nav from "@/components/Nav";

export const metadata = { title: "Muhattab — Halil Hattab" };

export default async function MuhattabPage() {
  const store = await cookies();
  const session = store.get("session")?.value;

  return (
    <main className="content">
      <Nav />
      <section className="panel">
        <h1 style={{ marginBottom: "0.75rem" }}>Muhattab</h1>

        {!session ? (
          <div className="empty">
            <p>Bu alanı görmek için oturum açmalısın.</p>
            <Link className="btn" href="/login">
              <i className="fa-brands fa-google" aria-hidden="true" />
              <span>Google ile devam et</span>
            </Link>
          </div>
        ) : (
          <div className="wrap">
            <p>Hoş geldin! Buraya özel içeriğini koyabilirsin.</p>
            <p>Bu sayfa istedigin gibi diger insanlarla <b>Muhattab</b> olabilirsin =)</p>
          </div>
        )}
      </section>
    </main>
  );
}
