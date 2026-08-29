"use client";

import { useState } from "react";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
}

/**
 * Product tile image with graceful offline fallback.
 * If the image URL is missing or fails to load, it renders the
 * original VIA cart-icon placeholder so the layout never breaks.
 */
export function ProductImage({ src, alt, className = "" }: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-[#edf7ee] ${className}`}
        role="img"
        aria-label={alt}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-12 w-12 text-[#4DBE55]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="9" cy="20" r="1.5" />
          <circle cx="17" cy="20" r="1.5" />
          <path d="M3 4h2l2.6 12.9a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L20 8H6" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}