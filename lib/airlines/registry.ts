/**
 * Airline Registry - Source of Truth for PNG assets
 *
 * This is the manual registry for airline logos.
 * Each airline must be explicitly added with its PNG asset path.
 */

// ============================================================================
// Types
// ============================================================================

export interface AirlineRegistryItem {
  /** IATA code (e.g., "LA") */
  code: string;
  /** Full airline name */
  name: string;
  /** Brand color (hex) */
  color: string;
  /** Asset path relative to /public */
  asset: string;
  /** Whether the PNG file exists (set to true when you add the file) */
  hasAsset: boolean;
}

// ============================================================================
// Registry Data
// ============================================================================

/**
 * Manual registry of airlines.
 * Set hasAsset: true only after adding the PNG file.
 */
export const AIRLINE_REGISTRY: AirlineRegistryItem[] = [
  // Brazilian carriers
  { code: "LA", name: "LATAM", color: "#E4002B", asset: "/airlines-png/LA.png", hasAsset: false },
  { code: "JJ", name: "LATAM Brasil", color: "#E4002B", asset: "/airlines-png/JJ.png", hasAsset: false },
  { code: "AD", name: "Azul", color: "#0033A0", asset: "/airlines-png/AD.png", hasAsset: false },
  { code: "G3", name: "GOL", color: "#FF6600", asset: "/airlines-png/G3.png", hasAsset: false },

  // European carriers
  { code: "TP", name: "TAP Air Portugal", color: "#00B2A9", asset: "/airlines-png/TP.png", hasAsset: false },
  { code: "IB", name: "Iberia", color: "#D30032", asset: "/airlines-png/IB.png", hasAsset: false },
  { code: "AF", name: "Air France", color: "#002157", asset: "/airlines-png/AF.png", hasAsset: false },
  { code: "LH", name: "Lufthansa", color: "#05164D", asset: "/airlines-png/LH.png", hasAsset: false },
  { code: "BA", name: "British Airways", color: "#075AAA", asset: "/airlines-png/BA.png", hasAsset: false },
  { code: "KL", name: "KLM", color: "#00A1E4", asset: "/airlines-png/KL.png", hasAsset: false },
  { code: "UX", name: "Air Europa", color: "#004A99", asset: "/airlines-png/UX.png", hasAsset: false },

  // North American carriers
  { code: "AA", name: "American Airlines", color: "#0078D2", asset: "/airlines-png/AA.png", hasAsset: false },
  { code: "UA", name: "United Airlines", color: "#002244", asset: "/airlines-png/UA.png", hasAsset: false },
  { code: "DL", name: "Delta Air Lines", color: "#003366", asset: "/airlines-png/DL.png", hasAsset: false },
  { code: "AC", name: "Air Canada", color: "#F01428", asset: "/airlines-png/AC.png", hasAsset: false },
  { code: "WN", name: "Southwest", color: "#304CB2", asset: "/airlines-png/WN.png", hasAsset: false },

  // Middle East / Asia
  { code: "EK", name: "Emirates", color: "#D71A21", asset: "/airlines-png/EK.png", hasAsset: false },
  { code: "QR", name: "Qatar Airways", color: "#5C0632", asset: "/airlines-png/QR.png", hasAsset: false },
  { code: "EY", name: "Etihad", color: "#BD8B13", asset: "/airlines-png/EY.png", hasAsset: false },
  { code: "TK", name: "Turkish Airlines", color: "#E81932", asset: "/airlines-png/TK.png", hasAsset: false },
  { code: "SQ", name: "Singapore Airlines", color: "#F7BA00", asset: "/airlines-png/SQ.png", hasAsset: false },

  // South American carriers
  { code: "AR", name: "Aerolíneas Argentinas", color: "#0080C9", asset: "/airlines-png/AR.png", hasAsset: false },
  { code: "CM", name: "Copa Airlines", color: "#003876", asset: "/airlines-png/CM.png", hasAsset: false },
  { code: "AV", name: "Avianca", color: "#E31837", asset: "/airlines-png/AV.png", hasAsset: false },
];

// Create lookup map for O(1) access
const registryMap = new Map<string, AirlineRegistryItem>(
  AIRLINE_REGISTRY.map((item) => [item.code.toUpperCase(), item])
);

// ============================================================================
// Public API
// ============================================================================

/**
 * Get airline from registry by IATA code
 */
export function getAirlineFromRegistry(code: string): AirlineRegistryItem | null {
  return registryMap.get(code.toUpperCase()) || null;
}

/**
 * Get airline PNG asset path
 *
 * ALWAYS returns the expected asset path if the airline is in registry.
 * The component should try to load it and handle errors gracefully.
 * This prevents human error from hasAsset flag blocking logo display.
 *
 * @param code - IATA airline code
 * @returns Asset path (e.g., "/airlines-png/LA.png") or null if not in registry
 */
export function getAirlineAsset(code: string): string | null {
  const airline = getAirlineFromRegistry(code);
  if (!airline) {
    // Not in registry - return computed path for potential fallback
    return `/airlines-png/${code.toUpperCase()}.png`;
  }
  return airline.asset;
}

/**
 * Get airline name from registry
 */
export function getAirlineNameFromRegistry(code: string): string | null {
  const airline = getAirlineFromRegistry(code);
  return airline?.name || null;
}

/**
 * Get airline color from registry
 */
export function getAirlineColorFromRegistry(code: string): string {
  const airline = getAirlineFromRegistry(code);
  return airline?.color || "#4f7386"; // Default blue-soft
}

/**
 * Check if airline has a PNG asset ready
 */
export function hasAirlineAsset(code: string): boolean {
  const airline = getAirlineFromRegistry(code);
  return airline?.hasAsset ?? false;
}

/**
 * Get list of airlines missing PNG assets (for dev diagnostics)
 */
export function getMissingAirlineAssets(): AirlineRegistryItem[] {
  return AIRLINE_REGISTRY.filter((item) => !item.hasAsset);
}

/**
 * Get list of airlines with PNG assets ready
 */
export function getReadyAirlineAssets(): AirlineRegistryItem[] {
  return AIRLINE_REGISTRY.filter((item) => item.hasAsset);
}

/**
 * Log missing assets to console (dev only)
 */
export function logMissingAirlineAssets(): void {
  if (typeof window !== "undefined" || process.env.NODE_ENV === "production") {
    return;
  }

  const missing = getMissingAirlineAssets();
  if (missing.length > 0) {
    console.log("\n📦 [Airline Registry] Missing PNG assets:");
    missing.forEach((item) => {
      console.log(`   ❌ ${item.code} (${item.name}) → ${item.asset}`);
    });
    console.log(`\n   Total: ${missing.length} missing\n`);
  }
}

