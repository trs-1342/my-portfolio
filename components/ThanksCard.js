import PersonChip from "./PersonChip";

export default function ThanksCard({
  icon,
  title,
  people = [],
  footnote,
  color,
}) {
  return (
    <article className="thanks-card">
      <header className="thanks-card__header">
        <div className="thanks-card__title">
          {icon ? <i className={icon} aria-hidden="true" /> : null}
          <span>{title}</span>
        </div>
        <span className="thanks-card__count">{people.length}</span>
      </header>

      {people.length > 0 && (
        <ul className="thanks-list">
          {people.map((p, i) => (
            <PersonChip
              key={i}
              person={p}
              color={p.color || color} // ← DOKUNMA
            />
          ))}
        </ul>
      )}

      {footnote ? <div className="thanks-foot">{footnote}</div> : null}
    </article>
  );
}
