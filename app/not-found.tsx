"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AmbientGlow from "@/components/AmbientGlow";

const GLITCH_CHARS = "!<>-_\\/[]{}—=+*^?#@$%&";

function useGlitch(text: string, active: boolean) {
  const [output, setOutput] = useState(text);
  const frameRef = useRef(0);

  useEffect(() => {
    if (!active) { setOutput(text); return; }
    let iter = 0;
    const id = setInterval(() => {
      setOutput(
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < iter) return text[i];
            return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          })
          .join("")
      );
      if (iter >= text.length) clearInterval(id);
      iter += 0.5;
    }, 40);
    frameRef.current = id as unknown as number;
    return () => clearInterval(id);
  }, [active, text]);

  return output;
}

export default function NotFound() {
  // Gidilen hatalı yolu dinamik olarak alıyoruz
  const pathname = usePathname() || "/*";

  const [glitchActive, setGlitchActive] = useState(false);
  const [termLines, setTermLines] = useState<string[]>([]);
  const [showLinks, setShowLinks] = useState(false);

  const glitchedText = useGlitch("404", glitchActive);

  /* Sayfa açılınca terminal boot sekansı */
  useEffect(() => {
    // Terminal boot dizisini pathname'e göre dinamik oluşturuyoruz
    const terminalBoot = [
      "PANIC: kernel trap at 0x00000000, type 14=Page Fault",
      "rip 0xffffffff81a3e40f",
      "$ dmesg | grep -i error",
      "[ 4.028147] EXT4-fs error: 404 inode not found",
      "$ find / -name 'page' 2>/dev/null",
      `find: '${pathname}': No such file or directory`,
      `$ sudo ls -la ${pathname}`,
      `ls: cannot access '${pathname}': No such file or directory`,
      "$ whoami",
      "visitor",
      "$ exit",
    ];

    setGlitchActive(true);
    terminalBoot.forEach((line, i) => {
      setTimeout(() => {
        setTermLines((prev) => [...prev, line]);
        if (i === terminalBoot.length - 1) {
          setTimeout(() => setShowLinks(true), 300);
        }
      }, i * 180);
    });
  }, [pathname]);

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
        <div style={{ width: "min(680px, 100%)" }}>

          {/* Büyük glitch 404 */}
          <div
            className="mono hack"
            style={{
              fontSize: "clamp(6rem, 18vw, 11rem)",
              fontWeight: 700,
              lineHeight: 1,
              color: "var(--accent)",
              letterSpacing: "-0.04em",
              textShadow: "0 0 40px var(--accent-glow), 0 0 80px rgba(16,185,129,0.15)",
              marginBottom: "8px",
              userSelect: "none",
              cursor: "default",
              animation: "glitchShake 4s ease-in-out infinite",
            }}
            onMouseEnter={() => setGlitchActive(true)}
          >
            {glitchedText}
          </div>

          <p
            className="mono anim-fade-up"
            style={{ fontSize: "1rem", color: "var(--text-2)", marginBottom: "32px" }}
          >
            Page not found — bu sayfa bulunamadı
          </p>

          {/* Terminal penceresi */}
          <div
            className="glass anim-fade-up d2"
            style={{ borderRadius: "14px", overflow: "hidden", marginBottom: "32px" }}
          >
            {/* Titlebar */}
            <div
              style={{
                background: "rgba(16,185,129,0.05)",
                borderBottom: "1px solid var(--border)",
                padding: "9px 14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {["#ef4444","#f59e0b","#22c55e"].map((c) => (
                <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />
              ))}
              <span className="mono hack" style={{ fontSize: "0.72rem", color: "var(--text-3)", marginLeft: 6 }}>
                visitor@arch: ~
              </span>
            </div>

            {/* Output */}
            <div style={{ padding: "14px 16px", maxHeight: "540px", overflowY: "auto" }}>
              {termLines.map((line, i) => (
                <p
                  key={i}
                  className="mono hack"
                  style={{
                    fontSize: "0.78rem",
                    lineHeight: 1.8,
                    color: line.startsWith("$") ? "#10B981"
                      : line.startsWith("PANIC") || line.includes("error") ? "#f87171"
                      : "#71717a",
                    animation: "fadeInUp 0.15s ease both",
                  }}
                >
                  {line}
                </p>
              ))}
              {/* Yanıp sönen imleç */}
              <span style={{
                display: "inline-block", width: 7, height: 13,
                background: "var(--accent)", marginTop: 4,
                animation: "statusPulse 0.8s step-end infinite",
              }} />
            </div>
          </div>

          {/* Yönlendirme linkleri */}
          {showLinks && (
            <div
              className="anim-fade-up"
              style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}
            >
              <Link href="/" className="btn btn-accent">
                ← Anasayfa
              </Link>
              <Link href="/my-projects" className="btn btn-ghost">
                Projeler
              </Link>
              <Link href="/contact" className="btn btn-ghost">
                İletişim
              </Link>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @import url('https://fonts.cdnfonts.com/css/hack');
        .hack { font-family: 'Hack', 'JetBrains Mono', monospace !important; }
        @keyframes glitchShake {
          0%, 95%, 100% { transform: translate(0); }
          96% { transform: translate(-2px, 1px); }
          97% { transform: translate(2px, -1px); }
          98% { transform: translate(-1px, 2px); }
          99% { transform: translate(1px, -2px); }
        }
      `}</style>
    </>
  );
}
