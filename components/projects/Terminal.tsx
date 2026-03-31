"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/firestore";

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

type LineType = "input" | "output" | "error" | "success" | "info" | "dim";

interface Line {
  type: LineType;
  text: string;
}

/* XSS önlemi — echo komutunda kullanılır */
function sanitize(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

const NEOFETCH_ART = `                  -\`
                 .o+\`
                \`ooo/
               \`+oooo:
              \`+oooooo:
              -+oooooo+:
            \`/:-:++oooo+:
           \`/++++/+++++++:
          \`/++++++++++++++:
         \`/+++ooooooooooooo/\`
        ./ooosssso++osssssso+\`
       .oossssso-\`\`\`\`/ossssss+\`
      -osssssso.      :ssssssso.
     :osssssss/        osssso+++.
    /ossssssss/        +ssssooo/-
  \`/ossssso+/:-        -:/+osssso+-
 \`+sso+:-\`                 \`.-/+oso:
\`++:.                           \`-/+/
.\`                                 \`/\`
`;

function buildNeofetch(_projectCount: number): Line[] {
  const art = NEOFETCH_ART.split("\n");
  const info = [
    "                          trs@arch-server",
    "                         ─────────────────────",
    "                         OS: Arch Linux x86_64",
    "                        Host: 82KU (IdeaPad 3 15ALC6)",
    "                       Kernel: Linux 6.19.6-arch1-1",
    "                      Uptime: 6 day, 13 hours, 42 mins",
    "                     Packages: 885 (pacman), 6 (flatpak)",
    "                    Shell: bash 5.3.9",
    "                   Display (AUO369F): 1920x1080 in 16, 60 Hz [Built-in]",
    "                 DE: KDE Plasma 6.6.2",
    "                WM: KWin (Wayland)",
    "               WM Theme: Breeze",
    "              Theme: Breeze (Dark) [Qt], Breeze-Dark [GTK2], Breeze [GTK3]",
    "             Icons: breeze-dark [Qt], breeze-dark [GTK2/3/4]",
    "             Font: Noto Sans (10pt) [Qt], Noto Sans (10pt) [GTK2/3/4]",
    "           Cursor: Oxygen_Zion (24px)",
    "          Terminal: konsole 25.12.3",
    "         Terminal Font: Hack (13pt)",
    "        CPU: AMD Ryzen 7 5700U (16) @ 1.80 GHz",
    "                              GPU: AMD Lucienne [Integrated]",
    "                              Memory: 13.42 GiB / 17.40 GiB (77.13%)",
    "                              Swap: 472.16 MiB / 8.70 GiB (5%)",
    "                              Disk (/): 22.13 GiB / 1.79 TiB (1%) - ext4",
    "                              Disk (/mnt/boot): 56.03 MiB / 1021.98 MiB (5%) - vfat",
    "                              Local IP (wlan0): 192.168.13.42/55",
    "                              Battery (L20C2PF0): 100% [AC Connected]",
    "                              Locale: en_US.UTF-8",
  ];
  const lines: Line[] = [];
  const maxRows = Math.max(art.length, info.length);
  for (let i = 0; i < maxRows; i++) {
    const left = (art[i] ?? "              ").padEnd(16);
    const right = info[i] ?? "";
    lines.push({ type: "success", text: `${left}  ${right}` });
  }
  return lines;
}

const HELP_LINES: Line[] = [
  { type: "info",    text: "Kullanılabilir komutlar:" },
  { type: "success", text: "  ls              — dizin içeriğini listele" },
  { type: "success", text: "  cd [proje]      — proje klasörüne gir" },
  { type: "success", text: "  cd ..           — bir üst dizine dön" },
  { type: "success", text: "  pwd             — mevcut yolu göster" },
  { type: "success", text: "  cat README.md   — proje açıklamasını oku" },
  { type: "success", text: "  echo [metin]    — metni ekrana bas" },
  { type: "success", text: "  clear           — terminali temizle" },
  { type: "success", text: "  whoami          — kullanıcı bilgisi" },
  { type: "success", text: "  neofetch        — sistem bilgisi" },
  { type: "success", text: "  help            — bu listeyi göster" },
];

const WELCOME: Line[] = [
  { type: "dim",  text: "─────────────────────────────────────────" },
  { type: "info", text: '  Hoş geldin! "help" yazarak başlayabilirsin.' },
  { type: "dim",  text: "─────────────────────────────────────────" },
  { type: "output", text: "" },
];

export default function Terminal({ projects }: { projects: Project[] }) {
  const [cwd, setCwd] = useState("~/projects");
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [lines, setLines] = useState<Line[]>(WELCOME);
  const [input, setInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [showInfo, setShowInfo] = useState(false);

  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Sayfa değil, sadece terminal output alanını scroll et */
  useEffect(() => {
    const el = outputRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const prompt = `visitor@arch-server:${cwd}$`;

  const push = (...newLines: Line[]) =>
    setLines((prev) => [...prev, ...newLines]);

  const execute = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    setCmdHistory((prev) => [trimmed, ...prev]);
    setHistIdx(-1);

    push({ type: "input", text: `${prompt} ${trimmed}` });

    const parts = trimmed.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) ?? [];
    const cmd = parts[0]?.toLowerCase() ?? "";
    const args = parts.slice(1).map((a) => a.replace(/^['"]|['"]$/g, ""));

    switch (cmd) {
      case "help":
        push(...HELP_LINES);
        break;

      case "ls":
        if (!activeProject) {
          push(
            { type: "dim", text: "total " + projects.length },
            ...projects.map((p) => ({
              type: "output" as LineType,
              text: `  📁  ${p.slug || toSlug(p.title)}${p.active ? "  \x1b[active\x1b]" : ""}`,
            }))
          );
        } else {
          const isC = (activeProject.stack ?? []).includes("C");
          push(
            { type: "output", text: "  📄  README.md" },
            { type: "output", text: "  📁  src/" },
            { type: "output", text: "  📄  .gitignore" },
            { type: "output", text: isC ? "  📄  Makefile" : "  📄  package.json" }
          );
        }
        break;

      case "cd": {
        const target = args[0];
        if (!target || target === "~" || target === "~/projects") {
          setCwd("~/projects");
          setActiveProject(null);
          push({ type: "output", text: "" });
        } else if (target === "..") {
          if (activeProject) {
            setCwd("~/projects");
            setActiveProject(null);
            push({ type: "output", text: "" });
          } else {
            push({ type: "error", text: "bash: cd: ..: Zaten kök proje dizindesin" });
          }
        } else {
          const proj = projects.find(
            (p) => (p.slug || toSlug(p.title)) === target || p.title.toLowerCase() === target.toLowerCase()
          );
          if (proj) {
            const slug = proj.slug || toSlug(proj.title);
            setCwd(`~/projects/${slug}`);
            setActiveProject(proj);
            push({ type: "output", text: "" });
          } else {
            push({ type: "error", text: `bash: cd: ${target}: No such file or directory` });
          }
        }
        break;
      }

      case "pwd":
        push({
          type: "output",
          text: activeProject
            ? `/home/trs/projects/${activeProject.slug || toSlug(activeProject.title)}`
            : "/home/trs/projects",
        });
        break;

      case "cat": {
        const file = args[0];
        if (!file) {
          push({ type: "error", text: "cat: eksik dosya operandı" });
          break;
        }
        if (!file.endsWith(".md")) {
          push({
            type: "error",
            text: `cat: ${file}: Permission denied. This file has chmod 700 permissions (owner 'trs' only). Group and others have no read access.`,
          });
          break;
        }
        if (!activeProject) {
          push({ type: "error", text: `cat: ${file}: No such file or directory. Önce 'cd <proje>' komutunu kullan.` });
          break;
        }
        if (file === "README.md") {
          push(
            { type: "success", text: `# ${activeProject.title}` },
            { type: "output",  text: "" },
            { type: "output",  text: activeProject.longDesc || activeProject.desc },
            { type: "output",  text: "" },
            { type: "dim",     text: `Stack: ${(activeProject.stack ?? []).join(", ")}` },
            { type: "dim",     text: `Repo: ${activeProject.repo}` },
            ...(activeProject.live
              ? [{ type: "dim" as LineType, text: `Live: ${activeProject.live}` }]
              : [])
          );
        } else {
          push({ type: "error", text: `cat: ${file}: No such file or directory` });
        }
        break;
      }

      case "echo":
        push({ type: "output", text: sanitize(args.join(" ")) });
        break;

      case "clear":
        setLines([]);
        break;

      case "whoami":
        push({ type: "output", text: "visitor" });
        break;

      case "neofetch":
      case "fastfetch":
        push(...buildNeofetch(projects.length));
        break;

      default:
        push({ type: "error", text: `bash: ${cmd}: command not found` });
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      execute(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(histIdx + 1, cmdHistory.length - 1);
      setHistIdx(next);
      setInput(cmdHistory[next] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setInput(next === -1 ? "" : (cmdHistory[next] ?? ""));
    }
  };

  const lineColor = (type: LineType): string => {
    switch (type) {
      case "error":   return "#f87171";
      case "success": return "#10B981";
      case "info":    return "#a1a1aa";
      case "input":   return "#e4e4e7";
      case "dim":     return "#52525b";
      default:        return "#d4d4d8";
    }
  };

  return (
    <div
      className="glass"
      style={{ marginBottom: "40px", overflow: "hidden", borderRadius: "16px" }}
    >
      {/* Titlebar */}
      <div
        style={{
          background: "rgba(16,185,129,0.05)",
          borderBottom: "1px solid var(--border)",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        {/* Trafik ışıkları */}
        <div style={{ display: "flex", gap: "6px" }}>
          {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
          ))}
        </div>

        <span
          className="mono"
          style={{ fontSize: "0.75rem", color: "var(--accent)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {prompt}
        </span>

        {/* Info butonu */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowInfo((v) => !v)}
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              border: "1px solid var(--border)",
              background: showInfo ? "var(--accent-dim)" : "var(--panel)",
              color: showInfo ? "var(--accent)" : "var(--text-2)",
              cursor: "pointer",
              fontSize: "0.7rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
            }}
          >
            i
          </button>

          {showInfo && (
            <div
              className="glass"
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                width: "270px",
                padding: "16px",
                zIndex: 50,
                animation: "fadeInUp 0.2s var(--ease-out) both",
              }}
            >
              <p className="mono" style={{ fontSize: "0.72rem", color: "var(--accent)", marginBottom: "10px", fontWeight: 700 }}>
                Komutlar
              </p>
              {[
                "ls              — listele",
                "cd [proje]      — proje dizinine gir",
                "cd ..           — geri dön",
                "pwd             — mevcut yol",
                "cat README.md   — açıklama oku",
                "echo [metin]    — metin bas",
                "clear           — temizle",
                "whoami          — kullanıcı",
                "neofetch        — sistem bilgisi",
                "help            — tüm komutlar",
              ].map((c) => (
                <p key={c} className="mono" style={{ fontSize: "0.7rem", color: "var(--text-2)", lineHeight: 1.9 }}>
                  {c}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Output alanı — sadece bu div scroll edilir, sayfa değil */}
      <div
        ref={outputRef}
        onClick={() => inputRef.current?.focus()}
        style={{
          padding: "16px",
          minHeight: "240px",
          maxHeight: "680px",
          overflowY: "auto",
          cursor: "text",
          scrollbarWidth: "thin",
          scrollbarColor: "var(--border) transparent",
        }}
      >
        {lines.map((l, i) => (
          <div
            key={i}
            className="mono"
            style={{
              fontSize: "0.82rem",
              lineHeight: 1.75,
              color: lineColor(l.type),
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}
          >
            {l.text || "\u00A0"}
          </div>
        ))}

        {/* Input satırı */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
          <span
            className="mono"
            style={{ fontSize: "0.82rem", color: "var(--accent)", whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {prompt}
          </span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.82rem",
              caretColor: "var(--accent)",
            }}
          />
        </div>

      </div>
    </div>
  );
}
