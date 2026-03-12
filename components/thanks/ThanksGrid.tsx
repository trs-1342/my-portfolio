interface Person {
  name: string;
  bio: string;
  url?: string;
  color: string;
  highlight: boolean;
}

interface Group {
  key: string;
  title: string;
  icon: string;
  people: Person[];
}

/* Renk keyword → hex eşleşmesi */
const COLOR_MAP: Record<string, string> = {
  red:    "#ef4444",
  green:  "#10B981",
  blue:   "#3b82f6",
  yellow: "#f59e0b",
  purple: "#a855f7",
  orange: "#f97316",
  pink:   "#ec4899",
};

function resolveColor(color: string): string {
  if (color.startsWith("#")) return color;
  return COLOR_MAP[color.toLowerCase()] ?? "#10B981";
}

function PersonCard({ person }: { person: Person }) {
  const color = resolveColor(person.color);
  const isHighlight = person.highlight;

  return (
    <div
      style={{
        borderRadius: "16px",
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        position: "relative",
        overflow: "hidden",
        background: "var(--panel)",
        backdropFilter: "blur(16px)",
        border: `1px solid ${color}30`,
        boxShadow: isHighlight ? `0 0 28px ${color}15, inset 0 0 16px ${color}06` : "none",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
      }}
      className="glass-hover"
    >
      {/* Renk çizgisi — sol kenar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: "16px",
          bottom: "16px",
          width: "3px",
          borderRadius: "0 2px 2px 0",
          background: color,
          opacity: 0.8,
        }}
      />

      {/* Sağ üst köşe glow */}
      <div
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 90,
          height: 90,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* İsim + link */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
        <p
          style={{
            fontWeight: 700,
            fontSize: "0.95rem",
            color: isHighlight ? color : "var(--text)",
          }}
        >
          {person.name}
        </p>
        {person.url && (
          <a
            href={person.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mono"
            style={{
              fontSize: "0.68rem",
              color: color,
              textDecoration: "none",
              padding: "3px 9px",
              borderRadius: "999px",
              border: `1px solid ${color}35`,
              background: `${color}0e`,
              flexShrink: 0,
              transition: "background 0.15s",
            }}
          >
            ↗
          </a>
        )}
      </div>

      {/* Bio */}
      <p
        style={{
          fontSize: "0.84rem",
          color: "var(--text-2)",
          lineHeight: 1.7,
          fontStyle: isHighlight ? "italic" : "normal",
        }}
      >
        {person.bio}
      </p>
    </div>
  );
}

/* İlk/son Annem kartı — tam genişlik, büyük */
function HeroCard({ person }: { person: Person }) {
  const color = resolveColor(person.color);

  return (
    <div
      style={{
        borderRadius: "20px",
        padding: "32px 36px",
        position: "relative",
        overflow: "hidden",
        background: "var(--panel)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${color}40`,
        boxShadow: `0 0 48px ${color}12, inset 0 0 30px ${color}06`,
        display: "flex",
        alignItems: "center",
        gap: "28px",
        flexWrap: "wrap",
      }}
    >
      {/* Büyük arka plan glow */}
      <div
        style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}14 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -40,
          left: -40,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}0a 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Sol kenar çizgisi */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: "20px",
          bottom: "20px",
          width: "4px",
          borderRadius: "0 3px 3px 0",
          background: `linear-gradient(to bottom, transparent, ${color}, transparent)`,
        }}
      />

      {/* Emoji avatar */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "16px",
          background: `${color}18`,
          border: `1px solid ${color}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2rem",
          flexShrink: 0,
          boxShadow: `0 0 20px ${color}20`,
        }}
      >
        🤍
      </div>

      {/* Metin */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: "1.15rem", color, marginBottom: "8px" }}>
          {person.name}
        </p>
        <p style={{ fontSize: "0.92rem", color: "var(--text-2)", lineHeight: 1.75, fontStyle: "italic" }}>
          &ldquo;{person.bio}&rdquo;
        </p>
      </div>

      {person.url && (
        <a
          href={person.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mono"
          style={{
            fontSize: "0.72rem",
            color,
            textDecoration: "none",
            padding: "6px 14px",
            borderRadius: "999px",
            border: `1px solid ${color}35`,
            background: `${color}0e`,
            flexShrink: 0,
          }}
        >
          ↗ Profil
        </a>
      )}
    </div>
  );
}

export default function ThanksGrid({ groups }: { groups: Group[] }) {
  const firstGroup = groups[0];
  const firstPerson = firstGroup?.people[0]; // Annem — ilk

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "60px" }}>

      {/* Annemle başla */}
      {firstPerson && (
        <div className="anim-fade-up">
          <HeroCard person={firstPerson} />
        </div>
      )}

      {/* Tüm gruplar */}
      {groups.map((group, gi) => {
        /* İlk gruptaki ilk kişiyi (Annem) atla — zaten üstte gösterildi */
        const people = gi === 0 ? group.people.slice(1) : group.people;
        if (people.length === 0) return null;

        return (
          <section key={group.key} className={`anim-fade-up d${Math.min(gi + 2, 8)}`}>
            {/* Grup başlığı */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "20px",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>{group.icon}</span>
              <p
                className="mono"
                style={{
                  fontSize: "0.72rem",
                  color: "var(--text-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                {group.title}
              </p>
              <div style={{ flex: 1, height: "1px", background: "var(--border)", marginLeft: "4px" }} />
            </div>

            {/* Kart grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "14px",
              }}
            >
              {people.map((p) => (
                <PersonCard key={p.name} person={p} />
              ))}
            </div>
          </section>
        );
      })}

      {/* Annemle bitir */}
      {firstPerson && (
        <div className="anim-fade-up">
          <HeroCard
            person={{
              ...firstPerson,
              bio: "Her şey seninle başladı, her şey seninle biter. Bu site de dahil.",
            }}
          />
        </div>
      )}

    </div>
  );
}
