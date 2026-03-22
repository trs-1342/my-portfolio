"use client";

import { useEffect, useState } from "react";
import { getThanksCategories, ThanksCategory } from "@/lib/firestore";
import ThanksGrid, { Group } from "./ThanksGrid";

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

export default function ThanksContent() {
  const [groups,  setGroups]  = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getThanksCategories().then((cats) => {
      if (cats.length > 0) {
        setGroups(cats.slice().sort((a, b) => a.order - b.order).map(toGroup));
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <p className="mono" style={{ fontSize: "0.82rem", color: "var(--text-3)", paddingBottom: "80px" }}>Yükleniyor...</p>;
  }

  if (groups.length === 0) {
    return <p style={{ fontSize: "0.9rem", color: "var(--text-3)", paddingBottom: "80px" }}>Henüz içerik eklenmemiş.</p>;
  }

  return <ThanksGrid groups={groups} />;
}
