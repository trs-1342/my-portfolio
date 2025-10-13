"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

export default function Avatar({
  src,
  alt = "avatar",
  size = 32,
  className = "",
}) {
  const [errored, setErrored] = useState(false);

  // Google avatarları için stabil boyut (s96-c) ekle
  const normalizedSrc = useMemo(() => {
    if (!src) return "";
    try {
      const u = new URL(src);
      if (
        u.hostname.endsWith("googleusercontent.com") &&
        !u.search.includes("=s")
      ) {
        // url ...?s96-c biçimini garanti et (varsa dokunma)
        u.search = (u.search ? u.search + "&" : "?") + "s96-c";
        return u.toString();
      }
      return src;
    } catch {
      return src;
    }
  }, [src]);

  // Görsel yoksa veya hata aldıysa harf balonu
  if (!normalizedSrc || errored) {
    const ch = (alt || "?").slice(0, 1).toUpperCase();
    return (
      <div
        className={`rounded-full bg-neutral-700 grid place-items-center text-sm ${className}`}
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
        aria-label={alt}
        title={alt}
      >
        {ch}
      </div>
    );
  }

  return (
    <Image
      src={normalizedSrc}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      decoding="async"
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setErrored(true)}
    />
  );
}
