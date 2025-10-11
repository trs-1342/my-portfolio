"use client";
import { useEffect } from "react";

export default function CustomCursor() {
  useEffect(() => {
    const c = document.createElement("div");
    c.className = "custom-cursor";
    document.body.appendChild(c);
    const onMove = (e) => {
      c.style.left = e.clientX + "px";
      c.style.top = e.clientY + "px";
    };
    document.addEventListener("mousemove", onMove);
    return () => {
      document.removeEventListener("mousemove", onMove);
      c.remove();
    };
  }, []);
  return null;
}
