import React from 'react';

// Çekilecek verilerin tipleri
interface GitHubData {
  repos: number;
  stars: number;
  forks: number;
  followers: number;
  following: number;
  totalCommits: number;
  calendar: {
    contributionCount: number;
    date: string;
  }[];
  recentRepos: {
    name: string;
    description: string | null;
    url: string;
    pushedAt: string;
    primaryLanguage: {
      name: string;
      color: string;
    } | null;
    lastCommit: string | null;
  }[];
}

// GitHub GraphQL API İstek Fonksiyonu
async function getGitHubData(username: string): Promise<GitHubData | null> {
  const token = process.env.GITHUB_TOKEN_API;

  if (!token) {
    console.error("GITHUB_TOKEN_API bulunamadı!");
    return null;
  }

  const query = `
    query($login: String!) {
      user(login: $login) {
        repositories(first: 100, ownerAffiliations: OWNER, isFork: false, orderBy: {field: PUSHED_AT, direction: DESC}) {
          totalCount
          nodes {
            name
            description
            url
            pushedAt
            stargazerCount
            forkCount
            primaryLanguage {
              name
              color
            }
            defaultBranchRef {
              target {
                ... on Commit {
                  message
                }
              }
            }
          }
        }
        followers { totalCount }
        following { totalCount }
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables: { login: username } }),
      // Next.js önbelleğe alma (1 saatte bir güncellenir)
      next: { revalidate: 3600 }
    });

    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0].message);

    const user = json.data.user;

    // Yıldız ve Fork sayılarını toplama
    let totalStars = 0;
    let totalForks = 0;
    user.repositories.nodes.forEach((repo: any) => {
      totalStars += repo.stargazerCount;
      totalForks += repo.forkCount;
    });

    // Takvim günlerini düz bir diziye çevirme
    const calendarDays = user.contributionsCollection.contributionCalendar.weeks
      .flatMap((week: any) => week.contributionDays);

    // Son 5 güncel repoyu alıyoruz ve commit mesajlarını dahil ediyoruz
    const recentRepos = user.repositories.nodes.slice(0, 5).map((repo: any) => ({
      name: repo.name,
      description: repo.description,
      url: repo.url,
      pushedAt: repo.pushedAt,
      primaryLanguage: repo.primaryLanguage,
      lastCommit: repo.defaultBranchRef?.target?.message || null
    }));

    return {
      repos: user.repositories.totalCount,
      stars: totalStars,
      forks: totalForks,
      followers: user.followers.totalCount,
      following: user.following.totalCount,
      totalCommits: user.contributionsCollection.contributionCalendar.totalContributions,
      calendar: calendarDays,
      recentRepos: recentRepos,
    };
  } catch (error) {
    console.error("GitHub verisi çekilemedi:", error);
    return null;
  }
}

// Renk yoğunluğunu hesaplayan yardımcı fonksiyon
function getContributionLevel(count: number) {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
}

// Tarih formatlama (Örn: "12 Eki 2023")
function formatDate(dateString: string) {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('tr-TR', options);
}

export default async function GitHubStats() {
  const username = "trs-1342";
  const data = await getGitHubData(username);

  // Veri gelmezse gösterilecek varsayılan yapı
  if (!data) {
    return (
      <section style={{ marginTop: "60px" }} id="github">
        <div className="glass p-8 text-center text-gray-400">
          GitHub verileri şu an yüklenemiyor. Lütfen API anahtarınızı kontrol edin.
        </div>
      </section>
    );
  }

  const stats = [
    { value: data.repos.toString(), label: "Repo" },
    { value: data.stars.toString(), label: "Yıldız" },
    { value: data.forks.toString(), label: "Fork" },
    { value: data.followers.toString(), label: "Takipçi" },
    { value: data.following.toString(), label: "Takip" },
    { value: data.totalCommits.toLocaleString(), label: "Katkı (1 Yıl)" },
  ];

  return (
    <section style={{ marginTop: "60px" }} id="github" className="px-2 md:px-0">
      <div
        className="glass anim-fade-up flex flex-col gap-8"
        style={{ padding: "32px", borderRadius: "20px" }}
      >
        {/* Üst Kısım: Profil ve Etiket */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span style={{ fontSize: "1.6rem" }}>⌨️</span>
            <div className="flex flex-col">
              <h2 className="mono font-bold text-gray-200 text-lg leading-tight">
                {username}
              </h2>
              <a
                href={`https://github.com/${username}`}
                target="_blank"
                rel="noreferrer"
                className="mono hover:text-blue-400 transition-colors text-xs text-gray-500"
              >
                github.com/{username}
              </a>
            </div>
          </div>

          <span
            className="mono flex items-center gap-2"
            style={{
              fontSize: "0.7rem",
              color: "rgba(16, 185, 129, 0.9)",
              padding: "4px 12px",
              borderRadius: "999px",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              backgroundColor: "rgba(16, 185, 129, 0.05)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Live API
          </span>
        </div>

        {/* İstatistik Rakamları */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 border-b border-gray-800/50 pb-6">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-1">
              <div className="font-bold text-xl text-gray-200">{s.value}</div>
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Katkı Grafiği (Contribution Graph) */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <p className="mono text-[0.7rem] text-gray-500 uppercase tracking-widest">
              Son 1 Yıl Katkı Grafiği
            </p>
          </div>

          {/* scroll kapsayıcısı: tooltip'in üste taşabilmesi için pt-10 eklendi */}
          <div className="w-full overflow-x-auto pb-4 pt-10 scrollbar-hide">
            <div
              style={{
                display: "grid",
                gridAutoFlow: "column",
                gridTemplateRows: "repeat(7, 1fr)",
                gap: "4px",
                width: "max-content",
              }}
            >
              {data.calendar.map((day, i) => {
                const level = getContributionLevel(day.contributionCount);
                return (
                  <div
                    key={i}
                    className="relative group cursor-pointer"
                  >
                    {/* Hücre (Boyutları 14px yapıldı) */}
                    <div
                      className="contrib-cell transition-all duration-300 hover:ring-1 ring-gray-400"
                      data-l={level > 0 ? String(level) : undefined}
                      style={{
                        width: "14px",
                        height: "14px",
                        borderRadius: "3px",
                      }}
                    />

                    {/* CSS Custom Tooltip (Hover Card) */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-[#1e1e2e] border border-gray-700/50 text-xs py-1.5 px-3 rounded-md shadow-2xl whitespace-nowrap flex items-center gap-2">
                        <span className="font-bold text-gray-200">{day.contributionCount} katkı</span>
                        <span className="text-gray-500 text-[10px]">{formatDate(day.date)}</span>
                      </div>
                      <div className="w-2 h-2 bg-[#1e1e2e] border-b border-r border-gray-700/50 rotate-45 -mt-1.5"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Son 5 Aktivite (Güncel Repolar) */}
        <div className="mt-6 pt-8">
          <p className="mono text-[0.75rem] text-gray-500 uppercase tracking-widest mb-4 px-2">
            Son 5 Güncel Aktivite
          </p>
          <div className="flex flex-col gap-4">
            {data.recentRepos.map((repo, idx) => (
              <a
                key={idx}
                href={repo.url}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col px-6 py-5 rounded-2xl border border-gray-800/60 bg-[#14141e]/50 hover:bg-[#1e1e2e] hover:border-gray-700 transition-all gap-4 overflow-hidden"
              >
                {/* Üst Kısım: Başlık, Açıklama, Dil ve Tarih */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">

                  {/* Sol Taraf: Başlık ve Açıklama */}
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-200 font-bold text-[15px] group-hover:text-blue-400 transition-colors truncate">
                        {repo.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-gray-700/60 text-gray-400 bg-gray-800/30 shrink-0">
                        Public
                      </span>
                    </div>
                    <p className="text-[13px] text-gray-400 line-clamp-1 pr-4">
                      {repo.description || "Açıklama bulunmuyor..."}
                    </p>
                  </div>

                  {/* Sağ Taraf: Dil ve Tarih */}
                  <div className="flex items-center gap-4 text-[12px] font-mono text-gray-500 whitespace-nowrap md:pt-1 shrink-0">
                    {repo.primaryLanguage && (
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: repo.primaryLanguage.color }}
                        ></span>
                        {repo.primaryLanguage.name}
                      </div>
                    )}
                    <div className="text-gray-500">
                      {formatDate(repo.pushedAt)}
                    </div>
                  </div>
                </div>

                {/* Alt Kısım: Son Commit (Varsa Göster) */}
                {repo.lastCommit && (
                  <div className="flex items-center gap-2.5 text-[12px] text-gray-400 font-mono bg-[#0a0a0f]/60 py-2.5 px-3.5 rounded-xl border border-gray-800/40 w-full mt-1">
                    <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                    <span className="truncate opacity-90">{repo.lastCommit}</span>
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
