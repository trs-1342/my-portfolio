"use client";
import { useEffect, useRef, useState } from "react";

function linkMeta(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = (u.hostname || "").replace(/^www\./, "");
    if (host.includes("instagram.com"))
      return { icon: "fa-brands fa-instagram", label: "Instagram" };
    if (host.includes("github.com"))
      return { icon: "fa-brands fa-github", label: "GitHub" };
    if (host.includes("linkedin.com"))
      return { icon: "fa-brands fa-linkedin", label: "LinkedIn" };
    if (host.includes("x.com") || host.includes("twitter.com"))
      return { icon: "fa-brands fa-x-twitter", label: "X" };
    if (u.protocol === "mailto:")
      return { icon: "fa-solid fa-envelope", label: "E-posta" };
    return { icon: "fa-solid fa-globe", label: host || "Bağlantı" };
  } catch {
    return { icon: "fa-solid fa-link", label: "Bağlantı" };
  }
}

export default function PersonChip({ person, color }) {
  const [open, setOpen] = useState(false);
  const closeBtnRef = useRef(null);
  const acc = color ? `accent-${color}` : "";

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    if (open) setTimeout(() => closeBtnRef.current?.focus(), 0);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const meta = linkMeta(person?.url);

  return (
    <>
      <li className={`thanks-chip ${acc}`}>
        <button
          type="button"
          className="chip-btn"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
        >
          {person?.name || "—"}
        </button>
      </li>

      <div
        className={`person-modal ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={`${person?.name} kartı`}
      >
        <button
          className="person-modal__overlay"
          aria-label="Kapat"
          onClick={() => setOpen(false)}
        />
        <div className="person-modal__card" role="document">
          <div className={`person-modal__header ${acc}`}>
            <h3 className="person-modal__title">{person?.name}</h3>
            <button
              ref={closeBtnRef}
              className="person-modal__close"
              onClick={() => setOpen(false)}
              aria-label="Kapat"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>

          <div className="person-modal__content">
            <p className="person-modal__bio">{person?.bio || "—"}</p>
            {person?.url && meta && (
              <a
                href={person.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`person-link ${acc}`}
              >
                <i className={meta.icon} aria-hidden="true" />
                <span>{meta.label}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
