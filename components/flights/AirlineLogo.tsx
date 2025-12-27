"use client";

import Image from "next/image";
import { useState } from "react";
import { getAirlineLogo, getAirlineColor, getAirlineName } from "@/lib/airlines";

interface AirlineLogoProps {
  /** IATA airline code (e.g., "LA", "TP") */
  code: string;
  /** Airline name for accessibility */
  name?: string;
  /** Size in pixels (default 40) */
  size?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Airline Logo Component
 *
 * Displays airline logo from /public/airlines/{CODE}.svg
 * Falls back to colored badge with airline code if logo unavailable
 */
export function AirlineLogo({
  code,
  name,
  size = 40,
  className = "",
}: AirlineLogoProps) {
  const [imgError, setImgError] = useState(false);
  const logo = getAirlineLogo(code);
  const color = getAirlineColor(code);
  const airlineName = name || getAirlineName(code);

  // Show logo if available and not errored
  if (logo && !imgError) {
    return (
      <div
        className={`relative overflow-hidden rounded-lg flex items-center justify-center ${className}`}
        style={{
          width: size,
          height: size,
          backgroundColor: "#fff",
        }}
      >
        <Image
          src={logo.src}
          alt={logo.alt}
          width={size - 8}
          height={size - 8}
          className="object-contain"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Fallback: colored badge with code
  return (
    <div
      className={`rounded-lg flex items-center justify-center text-white font-bold ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: size * 0.35,
      }}
      role="img"
      aria-label={airlineName}
    >
      {code.toUpperCase().slice(0, 2)}
    </div>
  );
}

