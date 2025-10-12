// components/ThanksCard.js
export function PersonChip({ person }) {
  if (!person || !person.name) return null;
  return (
    <li className="thanks-chip">
      {person.url ? (
        <a href={person.url} target="_blank" rel="noopener noreferrer">
          {person.name}
        </a>
      ) : (
        <span>{person.name}</span>
      )}
    </li>
  );
}

export default function ThanksCard({ icon, title, people = [], footnote }) {
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
            <PersonChip key={i} person={p} />
          ))}
        </ul>
      )}

      {footnote ? <div className="thanks-foot">{footnote}</div> : null}
    </article>
  );
}
