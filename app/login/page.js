// // app/login/page.js
// import Link from "next/link";
// import GoogleLogin from "@/components/GoogleLogin";
// import AuthForm from "@/components/AuthForm";
// export const metadata = { title: "Giriş Yap — Halil Hattab" };

// export default function LoginPage() {
//   return (
//     <main className="auth-container">
//       <section className="auth-card">
//         <h1 className="auth-title">Giriş Yap</h1>
//         <p className="auth-sub">Google hesabınla devam et.</p>
//         <AuthForm />
//         <br />
//         <GoogleLogin redirectTo="/" />
//         <br />
//         <Link href="/" className="auth-back">
//           Geri Dön
//         </Link>
//       </section>
//     </main>
//   );
// }
// app/login/page.js
import AuthForm from "@/components/AuthForm";
import { getSessionUser } from "@/lib/getSessionUser";
import { redirect } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import Nav from "@/components/Nav";

export const metadata = { title: "Giriş Yap — Halil Hattab" };

export default async function LoginPage() {
  const me = await getSessionUser();
  if (me) redirect("/profile");
  return (
    <>
      <Nav />
      <ThemeToggle />
      <AuthForm />
    </>
  );
}
