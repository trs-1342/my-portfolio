"use client";

import { useEffect, useState } from "react";
import { getThanksCategories, ThanksCategory } from "@/lib/firestore";
import ThanksGrid, { Group } from "./ThanksGrid";

/* ThanksCategory → ThanksGrid Group formatına dönüştür */
function toGroup(cat: ThanksCategory): Group {
  return {
    id:     cat.id,
    title:  cat.title,
    icon:   cat.icon,
    people: cat.people
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((p) => ({
        id:        p.id,
        name:      p.name,
        message:   p.message,
        url:       p.url,
        color:     p.color,
        highlight: p.highlight,
      })),
  };
}

export default function ThanksContent({ fallback }: { fallback: Group[] }) {
  const [groups, setGroups] = useState<Group[]>(fallback);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getThanksCategories().then((cats) => {
      if (cats.length > 0) {
        setGroups(cats.slice().sort((a, b) => a.order - b.order).map(toGroup));
      }
      setLoaded(true);
    });
  }, []);

  if (!loaded && fallback.length === 0) {
    return (
      <p className="mono" style={{ fontSize: "0.82rem", color: "var(--text-3)", paddingBottom: "80px" }}>
        Yükleniyor...
      </p>
    );
  }

  if (loaded && groups.length === 0) {
    return (
      <p style={{ fontSize: "0.9rem", color: "var(--text-3)", paddingBottom: "80px" }}>
        Henüz içerik eklenmemiş.
      </p>
    );
  }

  return <ThanksGrid groups={groups} />;
}
