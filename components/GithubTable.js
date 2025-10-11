"use client";
import { useEffect, useState } from "react";

const HEADERS = [
  "Proje",
  "Dil",
  "Commit",
  "Açıklama",
  "⭐",
  "🍴",
  "Güncelleme",
  "Repo",
];

function fmt(n) {
  return new Intl.NumberFormat("tr-TR").format(n ?? 0);
}
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
const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export default function GithubTable({ user = "trs-1342", limit = 8 }) {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `/api/gh?user=${encodeURIComponent(user)}&limit=${limit}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error("proxy " + res.status);
        const data = await res.json();
        setRows(data);
      } catch (e) {
        setErr(String(e));
        setRows([]);
      }
    })();
  }, [user, limit]);

  // mobil kart görünümü için td'lere etiket
  useEffect(() => {
    if (!rows || !rows.length) return;
    const table = document.querySelector(".projects-table");
    if (!table) return;
    const headers = HEADERS;
    table.querySelectorAll("tbody tr").forEach((tr) => {
      tr.querySelectorAll("td").forEach((td, i) => {
        td.setAttribute("data-th", headers[i] || "");
      });
    });
  }, [rows]);

  return (
    <section id="github">
      <header className="gh-header">
        <div className="gh-left">
          <i className="fa-brands fa-github"></i>
          <strong>GitHub Güncel</strong>
          <small>@{user} (beta)</small>
        </div>
        <div className="gh-right" id="ghBadges">
          {Array.isArray(rows) && rows.length ? (
            <>
              <span className="badge" title="Toplam Repo">
                <i className="fa-regular fa-folder-open"></i>
                {fmt(rows.length)} repos
              </span>
              <span className="badge" title="Toplam Star">
                <i className="fa-regular fa-star"></i>
                {fmt(
                  rows.reduce((s, r) => s + (r.stargazers_count || 0), 0)
                )}{" "}
                stars
              </span>
            </>
          ) : null}
        </div>
      </header>

      <div className="gh-table-wrap">
        <table className="projects-table" aria-label="Güncel GitHub Depoları">
          <colgroup>
            <col style={{ width: "18%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "30%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "5%" }} />
            <col style={{ width: "5%" }} />
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
            {rows === null && (
              <tr>
                <td colSpan={8} className="loading">
                  Yükleniyor…
                </td>
              </tr>
            )}
            {rows && rows.length === 0 && (
              <tr>
                <td colSpan={8}>
                  GitHub verisi alınamadı.{" "}
                  {err ? <small>({esc(err)})</small> : null}
                </td>
              </tr>
            )}
            {rows &&
              rows.map((r) => (
                <tr key={r.html_url}>
                  <td>
                    <span
                      className="ellipsis"
                      dangerouslySetInnerHTML={{ __html: esc(r.name) }}
                    />
                  </td>
                  <td title={r.language || "-"}>
                    <span
                      className="ellipsis"
                      dangerouslySetInnerHTML={{
                        __html: esc(r.language || "-"),
                      }}
                    />
                  </td>
                  <td title={r.commit_message || ""}>
                    <span
                      className="ellipsis"
                      dangerouslySetInnerHTML={{
                        __html: esc(r.commit_message || "—"),
                      }}
                    />
                  </td>
                  <td className="hide-sm" title={r.description || ""}>
                    <span
                      className="ellipsis"
                      dangerouslySetInnerHTML={{
                        __html: esc(r.description || "—"),
                      }}
                    />
                  </td>
                  <td>{fmt(r.stargazers_count ?? 0)}</td>
                  <td>{fmt(r.forks_count ?? 0)}</td>
                  <td title={r.pushed_at || r.commit_date || ""}>
                    {relTime(r.pushed_at || r.commit_date)}
                  </td>
                  <td>
                    <a href={r.html_url} target="_blank" rel="noopener">
                      GitHub
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
