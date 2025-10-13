// components/Avatar.js
"use client";
import Image from "next/image";
import { useState } from "react";

export default function Avatar({ src, alt = "avatar", size = 40 }) {
  const [error, setError] = useState(false);
  const fallback = "/images/default-avatar.png"; // public klasöründe bir default

  if (!src || error) {
    return (
      <Image
        src={fallback}
        alt={alt}
        width={size}
        height={size}
        className="avatar"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setError(true)}
      style={{ borderRadius: "9999px", objectFit: "cover" }}
      className="avatar"
    />
  );
}
