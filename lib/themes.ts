export interface Theme {
  id: string;
  label: string;
  bg: string;
  accent: string;
  dark: boolean;
}

export const THEMES: Theme[] = [
  /* Koyu temalar */
  { id: "dark-green",  label: "Siyah · Yeşil",   bg: "#09090B", accent: "#10B981", dark: true  },
  { id: "dark-white",  label: "Siyah · Beyaz",   bg: "#09090B", accent: "#E4E4E7", dark: true  },
  { id: "dark-red",    label: "Siyah · Kırmızı", bg: "#09090B", accent: "#EF4444", dark: true  },
  { id: "dark-blue",   label: "Siyah · Mavi",    bg: "#09090B", accent: "#3B82F6", dark: true  },
  /* Açık temalar */
  { id: "light-green", label: "Beyaz · Yeşil",   bg: "#FAFAFA", accent: "#059669", dark: false },
  { id: "light-black", label: "Beyaz · Siyah",   bg: "#FAFAFA", accent: "#18181B", dark: false },
  { id: "light-red",   label: "Beyaz · Kırmızı", bg: "#FAFAFA", accent: "#DC2626", dark: false },
  { id: "light-blue",  label: "Beyaz · Mavi",    bg: "#FAFAFA", accent: "#2563EB", dark: false },
];

/** Eski "dark"/"light" değerlerini yeni ID'ye çevir */
export function normalizeThemeId(raw: string | undefined | null): string {
  if (!raw || raw === "dark") return "dark-green";
  if (raw === "light")        return "light-green";
  if (THEMES.find((t) => t.id === raw)) return raw;
  return "dark-green";
}

/** HTML'e data-theme attribute uygula + localStorage'e kaydet + event yayınla */
export function applyTheme(id: string) {
  const el = document.documentElement;
  const normalized = normalizeThemeId(id);

  /* data-theme attribute ile tema uygula */
  el.setAttribute("data-theme", normalized);

  /* Eski html.light class'ını da yönet (geriye dönük uyumluluk) */
  if (normalized.startsWith("light-")) {
    el.classList.add("light");
  } else {
    el.classList.remove("light");
  }

  localStorage.setItem("theme", normalized);
  window.dispatchEvent(new CustomEvent("themechange", { detail: normalized }));
}

/**
 * Koyu/açık karşılığını döndür:
 * dark-green ↔ light-green
 * dark-white ↔ light-black  (beyaz aksan ↔ siyah aksan)
 * dark-red   ↔ light-red
 * dark-blue  ↔ light-blue
 */
export function getCounterpart(id: string): string {
  const flip: Record<string, string> = { white: "black", black: "white" };
  if (id.startsWith("dark-")) {
    const accent = id.slice(5);
    return `light-${flip[accent] ?? accent}`;
  } else {
    const accent = id.slice(6);
    return `dark-${flip[accent] ?? accent}`;
  }
}

/** Sayfa yüklenirken flash olmadan temayı uygula — layout <head> script'inde kullanılır */
export const INITIAL_THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('theme')||'dark-green';if(t==='light')t='light-green';if(t==='dark')t='dark-green';if(t!=='dark-green')document.documentElement.classList.add('theme-'+t);}catch(e){}})();`;
