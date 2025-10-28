// app/login/page.tsx
import { cookies } from "next/headers";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import ThemeToggle from "@/components/ThemeToggle";
import Nav from "@/components/Nav";

export default async function LoginPage() {
  const cookieStore = await cookies();            // ← önemli
  const session = cookieStore.get("session");     // { name, value } | undefined

  const isLoggedIn = Boolean(session?.value);

  return (
    <main>
      {isLoggedIn ? (
        <div>
          <Nav />
          <ThemeToggle />
          <p>Giriş yaptın. Profil sayfasına geçelim.</p>
          <Link href="/profile">Profile</Link>
        </div>
      ) : (
        <>
          <Nav />
          <ThemeToggle />
          <AuthForm />
        </>
      )}
    </main>
  );
}
