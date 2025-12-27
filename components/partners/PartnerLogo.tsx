"use client";

/**
 * Partner Logo Component (PNG version)
 *
 * ALWAYS tries to load the PNG from /public/partners-png/{slug}.png
 * Falls back to colored badge with initial if image fails to load.
 *
 * hasAsset from registry is used only as a debug hint, NOT as a gate.
 * This prevents human error (forgetting to set hasAsset: true) from
 * hiding logos that actually exist in /public.
 *
 * Enable debug mode with NEXT_PUBLIC_LOGO_DEBUG=true to see asset status.
 */

import Image from "next/image";
import { useState, useEffect } from "react";
import {
  getPartnerFromRegistry,
  getPartnerAsset,
  getPartnerColorFromRegistry,
  getPartnerNameFromRegistry,
  hasPartnerAsset,
} from "@/lib/partners/registry";

// ============================================================================
// Types
// ============================================================================

type LogoSize = "sm" | "md" | "lg";

interface PartnerLogoProps {
  /** Partner slug (e.g., "decolar", "kayak") */
  slug: string;
  /** Size variant */
  size?: LogoSize;
  /** Additional CSS classes */
  className?: string;
  /** Show tooltip with partner name */
  showTooltip?: boolean;
  /** Enable debug mode (shows asset status) */
  debug?: boolean;
}

// ============================================================================
// Size Map
// ============================================================================

const SIZE_MAP: Record<LogoSize, number> = {
  sm: 32,
  md: 40,
  lg: 56,
};

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

export function PartnerLogo({
  slug,
  size = "md",
  className = "",
  showTooltip = false,
  debug = false,
}: PartnerLogoProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset error state if slug changes
  useEffect(() => {
    setImgError(false);
    setImgLoaded(false);
  }, [slug]);

  const lowerSlug = slug.toLowerCase();
  const partner = getPartnerFromRegistry(lowerSlug);
  const assetPath = getPartnerAsset(lowerSlug);
  const color = getPartnerColorFromRegistry(lowerSlug);
  const pixelSize = SIZE_MAP[size];
  const registryHasAsset = hasPartnerAsset(lowerSlug);

  const name = partner?.name || getPartnerNameFromRegistry(lowerSlug) || slug;
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

  // Wrapper with optional tooltip
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    if (showTooltip) {
      return (
        <div className="relative group">
          {children}
          <div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
            style={{
              background: "var(--ink)",
              color: "var(--cream)",
            }}
          >
            {name}
          </div>
        </div>
      );
    }
    return <>{children}</>;
  };

  // Always try to render the image first
  // The image will fallback on error
  if (assetPath && !imgError) {
    return (
      <Wrapper>
        <div
          className={`relative overflow-hidden rounded-lg flex items-center justify-center ${className}`}
          style={{
            width: pixelSize,
            height: pixelSize,
          }}
        >
          <Image
            src={assetPath}
            alt={name}
            width={pixelSize}
            height={pixelSize}
            className="object-contain"
            onError={() => setImgError(true)}
            onLoad={() => setImgLoaded(true)}
          />
          <DebugBadge status={imgLoaded ? "ok" : "pending"} />
        </div>
      </Wrapper>
    );
  }

  // Fallback: colored badge with initial
  return (
    <Wrapper>
      <div
        className={`relative rounded-lg flex items-center justify-center text-white font-bold ${className}`}
        style={{
          width: pixelSize,
          height: pixelSize,
          backgroundColor: color,
          fontSize: pixelSize * 0.4,
        }}
        role="img"
        aria-label={name}
      >
        {name.charAt(0).toUpperCase()}
        <DebugBadge status="missing" />
      </div>
    </Wrapper>
  );
}
