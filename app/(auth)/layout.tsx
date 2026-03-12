import AmbientGlow from "@/components/AmbientGlow";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AmbientGlow />
      <main
        style={{
          minHeight: "100svh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {children}
      </main>
    </>
  );
}
