import { NextResponse } from "next/server";

// Basit XML entry parse (ilk <entry>'yi al)
function parseFirstEntry(xml) {
  const entry = xml.match(/<entry>[\s\S]*?<\/entry>/);
  if (!entry) return { title: "—", updated: null };
  const titleMatch = entry[0].match(/<title>([\s\S]*?)<\/title>/);
  const updatedMatch = entry[0].match(/<updated>([\s\S]*?)<\/updated>/);
  return {
    title: titleMatch ? titleMatch[1] : "—",
    updated: updatedMatch ? updatedMatch[1] : null,
  };
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get("user") || "trs-1342";
  const limit = Math.min(parseInt(searchParams.get("limit") || "8", 10), 20);

  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "next-gh-proxy",
  };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    // 1) Repos (API)
    const r = await fetch(
      `https://api.github.com/users/${user}/repos?sort=updated&per_page=${limit}`,
      { headers, cache: "no-store" }
    );
    let repos = [];
    if (r.ok) {
      repos = await r.json();
    } else {
      // API olmadı → user Atom feed (server tarafında CORS yok)
      const ra = await fetch(`https://github.com/${user}.atom`, {
        headers: { "User-Agent": "next-gh-proxy" },
      });
      if (!ra.ok) throw new Error("user atom " + ra.status);

      const xml = await ra.text();
      // Repo isimlerini feed linklerinden topla
      const entries = [
        ...xml.matchAll(
          /<link[^>]+href="https:\/\/github\.com\/([^/]+)\/([^/]+)\/[^"]*"/g
        ),
      ];
      const names = [];
      for (const m of entries) {
        const owner = m[1],
          repo = m[2];
        const full = `${owner}/${repo}`;
        if (!names.includes(full)) names.push(full);
        if (names.length >= limit) break;
      }
      repos = names.map((full) => {
        const [owner, name] = full.split("/");
        return {
          name,
          html_url: `https://github.com/${owner}/${name}`,
          language: null,
          description: null,
          stargazers_count: 0,
          forks_count: 0,
          pushed_at: null,
          owner: { login: owner },
          default_branch: "main",
        };
      });
    }

    // 2) Commit (API -> Atom)
    const rows = [];
    for (const repo of repos) {
      const ownerRepo = `${repo.owner.login}/${repo.name}`;
      let commit_message = "—",
        commit_date = null;

      // API dene
      try {
        const rc = await fetch(
          `https://api.github.com/repos/${ownerRepo}/commits?sha=${
            repo.default_branch || "main"
          }&per_page=1`,
          { headers, cache: "no-store" }
        );
        if (rc.ok) {
          const data = await rc.json();
          const c = Array.isArray(data) ? data[0] : null;
          commit_message = c?.commit?.message || "—";
          commit_date =
            c?.commit?.committer?.date || c?.commit?.author?.date || null;
        } else {
          throw new Error("commit api " + rc.status);
        }
      } catch {
        // Atom fallback
        try {
          const ra = await fetch(
            `https://github.com/${ownerRepo}/commits.atom`,
            { headers: { "User-Agent": "next-gh-proxy" } }
          );
          if (ra.ok) {
            const xml = await ra.text();
            const first = parseFirstEntry(xml);
            commit_message = first.title || "—";
            commit_date = first.updated || null;
          }
        } catch {}
      }

      rows.push({
        name: repo.name,
        html_url: repo.html_url,
        language: repo.language,
        description: repo.description,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        pushed_at: repo.pushed_at,
        default_branch: repo.default_branch,
        commit_message,
        commit_date,
      });
    }

    // Tarihe göre sırala
    rows.sort((a, b) => {
      const A = new Date(a.pushed_at || a.commit_date || 0).getTime();
      const B = new Date(b.pushed_at || b.commit_date || 0).getTime();
      return B - A;
    });

    return NextResponse.json(rows, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
