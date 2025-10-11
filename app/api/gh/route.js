// app/api/gh/route.js
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get("user") || "trs-1342";
  const limit = Math.min(parseInt(searchParams.get("limit") || "8", 10), 50);

  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "next-portfolio-gh",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    // 1) Kullanıcı bilgisi
    const uRes = await fetch(`https://api.github.com/users/${user}`, {
      headers,
      cache: "no-store",
    });
    if (!uRes.ok) {
      return NextResponse.json(
        { error: "user " + uRes.status },
        { status: uRes.status }
      );
    }
    const u = await uRes.json();

    // 2) Repositories (yalnızca owner)
    const rRes = await fetch(
      `https://api.github.com/users/${user}/repos?type=owner&sort=updated&direction=desc&per_page=${limit}`,
      { headers, cache: "no-store" }
    );
    if (!rRes.ok) {
      return NextResponse.json(
        { error: "repos " + rRes.status },
        { status: rRes.status }
      );
    }
    const repos = await rRes.json();

    // 3) Son commit mesajı/tarihi
    const rows = await Promise.all(
      repos.map(async (repo) => {
        let msg = "—";
        let date = null;
        try {
          const cRes = await fetch(
            `https://api.github.com/repos/${user}/${repo.name}/commits?sha=${
              repo.default_branch || "main"
            }&per_page=1`,
            { headers, cache: "no-store" }
          );
          if (cRes.ok) {
            const arr = await cRes.json();
            const c = Array.isArray(arr) ? arr[0] : null;
            msg = c?.commit?.message || "—";
            date =
              c?.commit?.committer?.date || c?.commit?.author?.date || null;
          }
        } catch {
          /* yoksay */
        }
        return {
          name: repo.name,
          html_url: repo.html_url,
          description: repo.description,
          language: repo.language,
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          open_issues_count: repo.open_issues_count,
          watchers_count: repo.watchers_count,
          default_branch: repo.default_branch,
          pushed_at: repo.pushed_at,
          latest_commit_message: msg,
          latest_commit_date: date,
        };
      })
    );

    // 4) Toplamlar + top diller
    const totals = rows.reduce(
      (acc, r) => {
        acc.stars += r.stargazers_count || 0;
        acc.forks += r.forks_count || 0;
        if (r.language) acc.lang[r.language] = (acc.lang[r.language] || 0) + 1;
        return acc;
      },
      { stars: 0, forks: 0, lang: {} }
    );
    const topLanguages = Object.entries(totals.lang)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k, v]) => ({ name: k, count: v }));

    // 5) Sıralı sonuç
    rows.sort(
      (a, b) =>
        new Date(b.pushed_at || b.latest_commit_date || 0) -
        new Date(a.pushed_at || a.latest_commit_date || 0)
    );

    return NextResponse.json({
      user: {
        login: u.login,
        html_url: u.html_url,
        avatar_url: u.avatar_url,
        followers: u.followers,
        following: u.following,
        public_repos: u.public_repos,
        public_gists: u.public_gists,
      },
      totals: {
        repos: rows.length,
        stars: totals.stars,
        forks: totals.forks,
        top_languages: topLanguages,
      },
      repos: rows,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
