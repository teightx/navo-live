"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import {
  getAirlineFromRegistry,
  getAirlineAsset,
  getAirlineColorFromRegistry,
  getAirlineNameFromRegistry,
  hasAirlineAsset,
} from "@/lib/airlines/registry";

// ============================================================================
// Types
// ============================================================================

interface AirlineLogoProps {
  /** IATA airline code (e.g., "LA", "TP") */
  code: string;
  /** Airline name for accessibility */
  name?: string;
  /** Size in pixels (default 40) */
  size?: number;
  /** Additional CSS classes */
  className?: string;
  /** Enable debug mode (shows asset status) */
  debug?: boolean;
}

// ============================================================================
// Debug Mode
// ============================================================================

const isDebugEnabled = (): boolean => {
  if (typeof window === "undefined") return false;
  if (process.env.NODE_ENV === "production") return false;
  return process.env.NEXT_PUBLIC_LOGO_DEBUG === "true";
};

// ============================================================================
// Component
// ============================================================================

/**
 * Airline Logo Component (PNG version)
 *
 * ALWAYS tries to load the PNG from /public/airlines-png/{CODE}.png
 * Falls back to colored badge with airline code if image fails to load.
 *
 * hasAsset from registry is used only as a debug hint, NOT as a gate.
 * This prevents human error (forgetting to set hasAsset: true) from
 * hiding logos that actually exist in /public.
 *
 * Enable debug mode with NEXT_PUBLIC_LOGO_DEBUG=true to see asset status.
 */
export function AirlineLogo({
  code,
  name,
  size = 40,
  className = "",
  debug = false,
}: AirlineLogoProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset error state if code changes
  useEffect(() => {
    setImgError(false);
    setImgLoaded(false);
  }, [code]);

  const upperCode = code.toUpperCase();
  const assetPath = getAirlineAsset(upperCode);
  const color = getAirlineColorFromRegistry(upperCode);
  const airlineName = name || getAirlineNameFromRegistry(upperCode) || code;
  const registryHasAsset = hasAirlineAsset(upperCode);

  const showDebug = mounted && (debug || isDebugEnabled());

  // Debug badge component
  const DebugBadge = ({ status }: { status: "ok" | "missing" | "pending" }) => {
    if (!showDebug) return null;

    const colors = {
      ok: "#22c55e",      // green
      missing: "#ef4444", // red
      pending: "#f59e0b", // yellow
    };

    const labels = {
      ok: "OK",
      missing: "MISSING",
      pending: "...",
    };

    return (
      <div
        className="absolute -top-1 -right-1 px-1 py-0.5 rounded text-[8px] font-mono z-10 whitespace-nowrap"
        style={{
          backgroundColor: colors[status],
          color: "white",
        }}
        title={`${assetPath}${registryHasAsset ? "" : " (hasAsset: false in registry)"}`}
      >
        {labels[status]}
      </div>
    );
  };

  // Always try to render the image first
  // The image will fallback on error
  if (assetPath && !imgError) {
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
          src={assetPath}
          alt={airlineName}
          width={size - 8}
          height={size - 8}
          className="object-contain"
          onError={() => setImgError(true)}
          onLoad={() => setImgLoaded(true)}
        />
        <DebugBadge status={imgLoaded ? "ok" : "pending"} />
      </div>
    );
  }

  // Fallback: colored badge with code
  return (
    <div
      className={`relative rounded-lg flex items-center justify-center text-white font-bold ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: size * 0.35,
      }}
      role="img"
      aria-label={airlineName}
    >
      {upperCode.slice(0, 2)}
      <DebugBadge status="missing" />
    </div>
  );
}
