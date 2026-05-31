import React, { useState } from "react";

export const FALLBACK_IMAGE = "/icon-512.png";

export default function SafeImage({ src, alt = "", className = "", fallback = FALLBACK_IMAGE, ...props }) {
  const [currentSrc, setCurrentSrc] = useState(src || fallback);
  return (
    <img
      {...props}
      className={className}
      src={currentSrc || fallback}
      alt={alt}
      onError={() => {
        if (currentSrc !== fallback) setCurrentSrc(fallback);
      }}
    />
  );
}
