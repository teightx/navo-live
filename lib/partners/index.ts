/**
 * Partners Library
 *
 * Defines travel booking partners with branding and URLs.
 * Logos stored in /public/partners/{slug}.svg
 */

// ============================================================================
// Types
// ============================================================================

export interface Partner {
  /** Unique identifier/slug */
  slug: string;
  /** Public display name */
  name: string;
  /** Brand color (hex) */
  color: string;
  /** Base URL for the partner site */
  url: string;
  /** Whether this is an official airline website */
  official?: boolean;
  /** Whether we have a logo asset */
  hasLogo: boolean;
}

// ============================================================================
// Partner Database
// ============================================================================

/**
 * Known partners with logos and URLs
 */
export const PARTNERS: Record<string, Partner> = {
  // Airlines (official sites)
  latam: {
    slug: "latam",
    name: "LATAM",
    color: "#E4002B",
    url: "https://www.latam.com",
    official: true,
    hasLogo: true,
  },
  gol: {
    slug: "gol",
    name: "GOL",
    color: "#FF6600",
    url: "https://www.voegol.com.br",
    official: true,
    hasLogo: true,
  },
  azul: {
    slug: "azul",
    name: "Azul",
    color: "#0033A0",
    url: "https://www.voeazul.com.br",
    official: true,
    hasLogo: true,
  },
  tap: {
    slug: "tap",
    name: "TAP Portugal",
    color: "#00B2A9",
    url: "https://www.flytap.com",
    official: true,
    hasLogo: true,
  },

  // OTAs (Online Travel Agencies)
  decolar: {
    slug: "decolar",
    name: "Decolar",
    color: "#5C2D91",
    url: "https://www.decolar.com",
    hasLogo: true,
  },
  maxmilhas: {
    slug: "maxmilhas",
    name: "MaxMilhas",
    color: "#00A859",
    url: "https://www.maxmilhas.com.br",
    hasLogo: true,
  },
  "123milhas": {
    slug: "123milhas",
    name: "123 Milhas",
    color: "#FF6B35",
    url: "https://www.123milhas.com",
    hasLogo: true,
  },

  // Metasearch
  googleflights: {
    slug: "googleflights",
    name: "Google Flights",
    color: "#4285F4",
    url: "https://www.google.com/flights",
    hasLogo: true,
  },
  kayak: {
    slug: "kayak",
    name: "Kayak",
    color: "#FF690F",
    url: "https://www.kayak.com.br",
    hasLogo: true,
  },
  skyscanner: {
    slug: "skyscanner",
    name: "Skyscanner",
    color: "#0770E3",
    url: "https://www.skyscanner.com.br",
    hasLogo: true,
  },
  momondo: {
    slug: "momondo",
    name: "Momondo",
    color: "#0D47A1",
    url: "https://www.momondo.com.br",
    hasLogo: true,
  },
};

// ============================================================================
// Public API
// ============================================================================

/**
 * Get partner info by slug
 */
export function getPartner(slug: string): Partner | null {
  const key = slug.toLowerCase();
  return PARTNERS[key] || null;
}

/**
 * Get partner logo path
 * Returns null if no logo available
 */
export function getPartnerLogo(slug: string): {
  src: string;
  alt: string;
} | null {
  const partner = getPartner(slug);

  if (!partner || !partner.hasLogo) {
    return null;
  }

  return {
    src: `/partners/${partner.slug}.svg`,
    alt: partner.name,
  };
}

/**
 * Get partner brand color
 */
export function getPartnerColor(slug: string): string {
  const partner = getPartner(slug);
  return partner?.color || "#4f7386";
}

/**
 * Check if partner has a logo
 */
export function hasPartnerLogo(slug: string): boolean {
  const partner = getPartner(slug);
  return partner?.hasLogo ?? false;
}

/**
 * Get all partners as array
 */
export function getAllPartners(): Partner[] {
  return Object.values(PARTNERS);
}

/**
 * Get OTA partners (non-official)
 */
export function getOTAPartners(): Partner[] {
  return Object.values(PARTNERS).filter((p) => !p.official);
}

/**
 * Get official airline partners
 */
export function getOfficialPartners(): Partner[] {
  return Object.values(PARTNERS).filter((p) => p.official);
}

/**
 * Build deep link URL for a partner
 * TODO: Implement proper deep linking with affiliate params
 */
export function buildPartnerUrl(
  slug: string,
  params?: {
    from?: string;
    to?: string;
    departDate?: string;
    returnDate?: string;
  }
): string {
  const partner = getPartner(slug);
  if (!partner) return "#";

  // For now, just return base URL
  // TODO: Add affiliate parameters and route-specific deep links
  return partner.url;
}

