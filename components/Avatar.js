"use client";

import Image from "next/image";
import { useState } from "react";

export default function Avatar({
  src,
  alt = "avatar",
  size = 32,
  className = "",
}) {
  const [errored, setErrored] = useState(false);

  // Görsel yoksa veya hata aldıysa harf balonu
  if (!src || errored) {
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
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setErrored(true)}
    />
  );
}
