import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Giriş Yap — trs-1342" };

export default function LoginPage() {
  return (
    <main className="auth-container">
      <AuthForm mode="login" />
    </main>
  );
}
