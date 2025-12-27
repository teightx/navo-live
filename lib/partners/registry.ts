/**
 * Partner Registry - Source of Truth for PNG assets
 *
 * This is the manual registry for partner logos.
 * Each partner must be explicitly added with its PNG asset path.
 */

// ============================================================================
// Types
// ============================================================================

export interface PartnerRegistryItem {
  /** Unique slug (e.g., "decolar") */
  slug: string;
  /** Display name */
  name: string;
  /** Brand color (hex) */
  color: string;
  /** Base URL */
  url: string;
  /** Asset path relative to /public */
  asset: string;
  /** Whether the PNG file exists (set to true when you add the file) */
  hasAsset: boolean;
  /** Whether this is an official airline site */
  official?: boolean;
}

// ============================================================================
// Registry Data
// ============================================================================

/**
 * Manual registry of partners.
 * Set hasAsset: true only after adding the PNG file.
 */
export const PARTNER_REGISTRY: PartnerRegistryItem[] = [
  // Airlines (official sites)
  {
    slug: "latam",
    name: "LATAM",
    color: "#E4002B",
    url: "https://www.latam.com",
    asset: "/partners-png/latam.png",
    hasAsset: false,
    official: true,
  },
  {
    slug: "gol",
    name: "GOL",
    color: "#FF6600",
    url: "https://www.voegol.com.br",
    asset: "/partners-png/gol.png",
    hasAsset: false,
    official: true,
  },
  {
    slug: "azul",
    name: "Azul",
    color: "#0033A0",
    url: "https://www.voeazul.com.br",
    asset: "/partners-png/azul.png",
    hasAsset: false,
    official: true,
  },
  {
    slug: "tap",
    name: "TAP Portugal",
    color: "#00B2A9",
    url: "https://www.flytap.com",
    asset: "/partners-png/tap.png",
    hasAsset: false,
    official: true,
  },

  // OTAs (Online Travel Agencies)
  {
    slug: "decolar",
    name: "Decolar",
    color: "#5C2D91",
    url: "https://www.decolar.com",
    asset: "/partners-png/decolar.png",
    hasAsset: false,
  },
  {
    slug: "maxmilhas",
    name: "MaxMilhas",
    color: "#00A859",
    url: "https://www.maxmilhas.com.br",
    asset: "/partners-png/maxmilhas.png",
    hasAsset: false,
  },
  {
    slug: "123milhas",
    name: "123 Milhas",
    color: "#FF6B35",
    url: "https://www.123milhas.com",
    asset: "/partners-png/123milhas.png",
    hasAsset: false,
  },

  // Metasearch
  {
    slug: "googleflights",
    name: "Google Flights",
    color: "#4285F4",
    url: "https://www.google.com/flights",
    asset: "/partners-png/googleflights.png",
    hasAsset: false,
  },
  {
    slug: "kayak",
    name: "Kayak",
    color: "#FF690F",
    url: "https://www.kayak.com.br",
    asset: "/partners-png/kayak.png",
    hasAsset: false,
  },
  {
    slug: "skyscanner",
    name: "Skyscanner",
    color: "#0770E3",
    url: "https://www.skyscanner.com.br",
    asset: "/partners-png/skyscanner.png",
    hasAsset: false,
  },
  {
    slug: "momondo",
    name: "Momondo",
    color: "#0D47A1",
    url: "https://www.momondo.com.br",
    asset: "/partners-png/momondo.png",
    hasAsset: false,
  },
];

// Create lookup map for O(1) access
const registryMap = new Map<string, PartnerRegistryItem>(
  PARTNER_REGISTRY.map((item) => [item.slug.toLowerCase(), item])
);

// ============================================================================
// Public API
// ============================================================================

/**
 * Get partner from registry by slug
 */
export function getPartnerFromRegistry(slug: string): PartnerRegistryItem | null {
  return registryMap.get(slug.toLowerCase()) || null;
}

/**
 * Get partner PNG asset path
 *
 * ALWAYS returns the expected asset path if the partner is in registry.
 * The component should try to load it and handle errors gracefully.
 * This prevents human error from hasAsset flag blocking logo display.
 *
 * @param slug - Partner slug (lowercase)
 * @returns Asset path (e.g., "/partners-png/decolar.png") or computed path if not in registry
 */
export function getPartnerAsset(slug: string): string | null {
  const partner = getPartnerFromRegistry(slug);
  if (!partner) {
    // Not in registry - return computed path for potential fallback
    return `/partners-png/${slug.toLowerCase()}.png`;
  }
  return partner.asset;
}

/**
 * Get partner name from registry
 */
export function getPartnerNameFromRegistry(slug: string): string | null {
  const partner = getPartnerFromRegistry(slug);
  return partner?.name || null;
}

/**
 * Get partner color from registry
 */
export function getPartnerColorFromRegistry(slug: string): string {
  const partner = getPartnerFromRegistry(slug);
  return partner?.color || "#4f7386";
}

/**
 * Check if partner has a PNG asset ready
 */
export function hasPartnerAsset(slug: string): boolean {
  const partner = getPartnerFromRegistry(slug);
  return partner?.hasAsset ?? false;
}

/**
 * Get list of partners missing PNG assets (for dev diagnostics)
 */
export function getMissingPartnerAssets(): PartnerRegistryItem[] {
  return PARTNER_REGISTRY.filter((item) => !item.hasAsset);
}

/**
 * Get list of partners with PNG assets ready
 */
export function getReadyPartnerAssets(): PartnerRegistryItem[] {
  return PARTNER_REGISTRY.filter((item) => item.hasAsset);
}

/**
 * Log missing assets to console (dev only)
 */
export function logMissingPartnerAssets(): void {
  if (typeof window !== "undefined" || process.env.NODE_ENV === "production") {
    return;
  }

  const missing = getMissingPartnerAssets();
  if (missing.length > 0) {
    console.log("\n📦 [Partner Registry] Missing PNG assets:");
    missing.forEach((item) => {
      console.log(`   ❌ ${item.slug} (${item.name}) → ${item.asset}`);
    });
    console.log(`\n   Total: ${missing.length} missing\n`);
  }
}

