// components/ThanksChips.js
// Sunucu uyumlu (hooks yok). Chip yapısını ve grup renderini sağlar.

export function Chip({ children, dim = false }) {
  return (
    <li className={`thanks-chip${dim ? " dim" : ""}`}>
      <span>{children}</span>
    </li>
  );
}

export function NameChip({ person }) {
  if (!person || !person.name) return null;
  const { name, url } = person;
  return (
    <li className="thanks-chip">
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          // Link varsa altı çizili, yoksa çizgi yok talebine göre:
          style={{ textDecoration: "underline" }}
        >
          {name}
        </a>
      ) : (
        <span>{name}</span>
      )}
    </li>
  );
}

/**
 * label: Grup başlığı (ör. "Değerli arkadaşlarıma")
 * items: [{name, url?}, ...]
 * tailText: Sonda opsiyonel çip (ör. "ve diğer adını yazmadıklarım")
 */
export function ChipsGroup({ label, items = [], tailText }) {
  return (
    <>
      <Chip>{label}</Chip>
      {items.map((p, i) => (
        <NameChip key={`${label}-${i}`} person={p} />
      ))}
      {tailText ? <Chip dim>{tailText}</Chip> : null}
    </>
  );
}

export default ChipsGroup;
