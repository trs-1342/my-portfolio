import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Kayıt Ol — trs-1342" };

export default function RegisterPage() {
  return (
    <main className="auth-container">
      <AuthForm mode="register" />
    </main>
  );
}
