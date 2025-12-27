/**
 * Partner Outbound URL Builder
 *
 * Generates outbound URLs for partner redirects.
 * Currently uses partner base URL (home). Deep links will be added
 * when we have verified, real deep link patterns per partner.
 *
 * RULES:
 * - Never invent fake querystrings per partner
 * - Only add params when we have verified patterns
 * - For now, just redirect to partner home
 */

import { getPartner, type Partner } from "./index";
import type { FlightResult } from "@/lib/search/types";

// ============================================================================
// Types
// ============================================================================

export interface SearchContext {
  /** Origin airport code */
  from?: string;
  /** Destination airport code */
  to?: string;
  /** Departure date (YYYY-MM-DD) */
  departDate?: string;
  /** Return date (YYYY-MM-DD) */
  returnDate?: string;
}

export interface OutboundUrlOptions {
  /** Partner slug */
  partnerSlug: string;
  /** Flight data */
  flight?: FlightResult;
  /** Search context for deep linking */
  searchContext?: SearchContext;
}

// ============================================================================
// Deep Link Patterns (to be populated with real, verified patterns)
// ============================================================================

/**
 * Partner-specific deep link builders.
 * Only add patterns here when we have verified them with the partner.
 *
 * For now, this is empty - we just use base URLs.
 * TODO: Add verified deep link patterns per partner
 */
const DEEP_LINK_BUILDERS: Record<
  string,
  (partner: Partner, flight?: FlightResult, ctx?: SearchContext) => string | null
> = {
  // Example (DO NOT USE until verified):
  // googleflights: (partner, flight, ctx) => {
  //   if (!ctx?.from || !ctx?.to || !ctx?.departDate) return null;
  //   const url = new URL("https://www.google.com/travel/flights");
  //   url.searchParams.set("q", `${ctx.from} to ${ctx.to}`);
  //   return url.toString();
  // },
};

// ============================================================================
// Public API
// ============================================================================

/**
 * Build outbound URL for a partner
 *
 * Rules:
 * - Uses verified deep link pattern if available
 * - Falls back to partner base URL (home)
 * - Never invents fake querystrings
 *
 * @param partnerSlug - Partner identifier
 * @param flight - Optional flight data
 * @param searchContext - Optional search context
 * @returns URL string
 */
export function buildOutboundUrl(
  partnerSlug: string,
  flight?: FlightResult,
  searchContext?: SearchContext
): string {
  const partner = getPartner(partnerSlug);

  if (!partner) {
    // Unknown partner - return generic search fallback
    console.warn(`[outbound] Unknown partner: ${partnerSlug}`);
    return "#";
  }

  // Check if we have a verified deep link builder
  const deepLinkBuilder = DEEP_LINK_BUILDERS[partnerSlug.toLowerCase()];

  if (deepLinkBuilder) {
    const deepLink = deepLinkBuilder(partner, flight, searchContext);
    if (deepLink) {
      return deepLink;
    }
  }

  // Default: return partner base URL
  // This is honest - we don't pretend to have deep links we don't have
  return partner.url;
}

/**
 * Get partner info with outbound URL
 *
 * Convenience function that returns partner data + computed outbound URL
 */
export function getPartnerWithUrl(
  partnerSlug: string,
  flight?: FlightResult,
  searchContext?: SearchContext
): (Partner & { outboundUrl: string }) | null {
  const partner = getPartner(partnerSlug);

  if (!partner) {
    return null;
  }

  return {
    ...partner,
    outboundUrl: buildOutboundUrl(partnerSlug, flight, searchContext),
  };
}

/**
 * Get list of active partners with URLs
 *
 * Returns partners that should be displayed in "where to buy" section
 */
export function getActivePartnersWithUrls(
  flight?: FlightResult,
  searchContext?: SearchContext
): Array<Partner & { outboundUrl: string }> {
  // For now, return a curated list of partners
  // In the future, this could be dynamic based on route/airline
  const activePartnerSlugs = [
    "decolar",
    "maxmilhas",
    "skyscanner",
    "kayak",
    "googleflights",
  ];

  return activePartnerSlugs
    .map((slug) => getPartnerWithUrl(slug, flight, searchContext))
    .filter((p): p is Partner & { outboundUrl: string } => p !== null);
}

