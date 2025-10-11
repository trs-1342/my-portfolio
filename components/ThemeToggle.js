"use client";

export default function ThemeToggle() {
  return (
    <button
      id="themeToggle"
      className="theme-toggle"
      title="Tema değiştir"
      onClick={() => {
        const root = document.documentElement;
        root.classList.toggle("light");
        localStorage.setItem(
          "theme",
          root.classList.contains("light") ? "light" : "dark"
        );
      }}
    >
      <i className="fa-solid fa-circle-half-stroke"></i>
    </button>
  );
}
