// components/GithubTable.js
"use client";
import { useEffect, useState } from "react";

const HEADERS = [
  "Proje",
  "Dil",
  "Commit",
  "Açıklama",
  "⭐",
  "🍴",
  "Güncel",
  "Repo",
];

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
const fmt = (n) => new Intl.NumberFormat("tr-TR").format(n ?? 0);
function relTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso),
    diff = Math.max(1, Math.floor((Date.now() - d) / 1000));
  const u = [
    ["yıl", 31536000],
    ["ay", 2592000],
    ["gün", 86400],
    ["saat", 3600],
    ["dk", 60],
    ["sn", 1],
  ];
  for (const [l, s] of u) {
    const v = Math.floor(diff / s);
    if (v >= 1) return `${v} ${l} önce`;
  }
  return "az önce";
}

export default function GithubTable({ user = "trs-1342", limit = 8 }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `/api/gh?user=${encodeURIComponent(user)}&limit=${limit}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error("api " + res.status);
        setData(await res.json());
      } catch (e) {
        setErr(String(e));
        setData({ user: {}, totals: {}, repos: [] });
      }
    })();
  }, [user, limit]);

  // mobil etiketleri
  useEffect(() => {
    if (!data?.repos?.length) return;
    const table = document.querySelector(".projects-table");
    if (!table) return;
    table.querySelectorAll("tbody tr").forEach((tr) => {
      tr.querySelectorAll("td").forEach((td, i) =>
        td.setAttribute("data-th", HEADERS[i] || "")
      );
    });
  }, [data]);

  const rows = data?.repos || [];
  const u = data?.user || {};
  const t = data?.totals || {};

  return (
    <section id="github">
      <header className="gh-header">
        <div className="gh-left">
          <i className="fa-brands fa-github"></i>
          <strong>GitHub Güncel</strong>
          <small>@{user}</small>
        </div>
        <div className="gh-right">
          <span className="badge" title="Takipçi">
            <i className="fa-regular fa-user"></i>
            {fmt(u.followers)} followers
          </span>
          <span className="badge" title="Takip">
            <i className="fa-regular fa-user-check"></i>
            {fmt(u.following)} following
          </span>
          <span className="badge" title="Repo">
            <i className="fa-regular fa-folder-open"></i>
            {fmt(u.public_repos || t.repos)} repos
          </span>
          <span className="badge" title="Gist">
            <i className="fa-regular fa-file-code"></i>
            {fmt(u.public_gists)} gists
          </span>
          <span className="badge" title="Toplam Star">
            <i className="fa-regular fa-star"></i>
            {fmt(t.stars)} stars
          </span>
          <span className="badge" title="Toplam Fork">
            <i className="fa-solid fa-code-fork"></i>
            {fmt(t.forks)} forks
          </span>
          {Array.isArray(t.top_languages) && t.top_languages.length > 0 && (
            <span className="badge" title="Top Diller">
              <i className="fa-solid fa-language"></i>
              {t.top_languages.map((l) => l.name).join(", ")}
            </span>
          )}
        </div>
      </header>

      <div className="gh-table-wrap">
        <table className="projects-table" aria-label="Güncel GitHub Depoları">
          <colgroup>
            <col style={{ width: "20%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "30%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "6%" }} />
            <col style={{ width: "6%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "4%" }} />
          </colgroup>
          <thead>
            <tr>
              {HEADERS.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!data && (
              <tr>
                <td className="loading" colSpan={8}>
                  Yükleniyor…
                </td>
              </tr>
            )}
            {data && rows.length === 0 && (
              <tr>
                <td colSpan={8}>
                  Veri bulunamadı {err ? <small>({esc(err)})</small> : null}
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.html_url}>
                <td>
                  <span className="ellipsis">{r.name}</span>
                </td>
                <td title={r.language || "-"}>
                  <span className="ellipsis">{r.language || "-"}</span>
                </td>
                <td title={r.latest_commit_message || ""}>
                  <span className="ellipsis">
                    {r.latest_commit_message || "—"}
                  </span>
                </td>
                <td className="hide-sm" title={r.description || ""}>
                  <span className="ellipsis">{r.description || "—"}</span>
                </td>
                <td>{fmt(r.stargazers_count)}</td>
                <td>{fmt(r.forks_count)}</td>
                <td title={r.pushed_at || r.latest_commit_date || ""}>
                  {relTime(r.pushed_at || r.latest_commit_date)}
                </td>
                <td>
                  <a
                    href={r.html_url}
                    target="_blank"
                    rel="noopener"
                    aria-label="GitHub repo"
                  >
                    ↗︎
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
