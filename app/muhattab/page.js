// app/muhattab/page.js
import { getSessionUser } from "@/lib/getSessionUser";
import AuthForm from "@/components/AuthForm";
import ThemeToggle from "@/components/ThemeToggle";
import Nav from "@/components/Nav";

export const metadata = { title: "Muhattab — trs-1342" };

export default async function MuhattabPage() {
  const me = await getSessionUser();
  if (!me) {
    return (
      <>
        <Nav />
        <ThemeToggle />
        <section style={{ maxWidth: 560, margin: "40px auto" }}>
          <AuthForm />
        </section>
      </>
    );
  }
  return (
    <>
      <Nav />
      <ThemeToggle />
      <section style={{ maxWidth: 860, margin: "40px auto" }}>
        <h1>Muhattab</h1>
        <p>Merhaba, {me.name || me.email}!</p>
        <p>
          En yakın zamanda burada diğer insanlara <b>Muhattab</b> olacaksın!
        </p>
      </section>
    </>
  );
}
