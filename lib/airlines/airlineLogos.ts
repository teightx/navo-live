/**
 * Airline Logos Library
 *
 * Maps IATA airline codes to logo assets and colors.
 * Logos stored in /public/airlines/{CODE}.svg
 */

// ============================================================================
// Types
// ============================================================================

export interface AirlineInfo {
  /** Airline name */
  name: string;
  /** Brand color (hex) */
  color: string;
  /** Whether we have a logo asset */
  hasLogo: boolean;
}

// ============================================================================
// Airline Database
// ============================================================================

/**
 * Known airlines with logos and brand colors
 * Source: Official brand guidelines
 */
export const AIRLINES: Record<string, AirlineInfo> = {
  // Brazilian carriers
  LA: { name: "LATAM", color: "#E4002B", hasLogo: true },
  JJ: { name: "LATAM Brasil", color: "#E4002B", hasLogo: true },
  AD: { name: "Azul", color: "#0033A0", hasLogo: true },
  G3: { name: "GOL", color: "#FF6600", hasLogo: true },

  // European carriers
  TP: { name: "TAP Air Portugal", color: "#00B2A9", hasLogo: true },
  IB: { name: "Iberia", color: "#D30032", hasLogo: true },
  AF: { name: "Air France", color: "#002157", hasLogo: true },
  LH: { name: "Lufthansa", color: "#05164D", hasLogo: true },
  BA: { name: "British Airways", color: "#075AAA", hasLogo: true },
  KL: { name: "KLM", color: "#00A1E4", hasLogo: true },
  UX: { name: "Air Europa", color: "#004A99", hasLogo: true },

  // North American carriers
  AA: { name: "American Airlines", color: "#0078D2", hasLogo: true },
  UA: { name: "United Airlines", color: "#002244", hasLogo: true },
  DL: { name: "Delta Air Lines", color: "#003366", hasLogo: true },
  AC: { name: "Air Canada", color: "#F01428", hasLogo: true },
  WN: { name: "Southwest", color: "#304CB2", hasLogo: true },

  // Middle East / Asia
  EK: { name: "Emirates", color: "#D71A21", hasLogo: true },
  QR: { name: "Qatar Airways", color: "#5C0632", hasLogo: true },
  EY: { name: "Etihad", color: "#BD8B13", hasLogo: true },
  TK: { name: "Turkish Airlines", color: "#E81932", hasLogo: true },
  SQ: { name: "Singapore Airlines", color: "#F7BA00", hasLogo: true },

  // South American carriers
  AR: { name: "Aerolíneas Argentinas", color: "#0080C9", hasLogo: true },
  CM: { name: "Copa Airlines", color: "#003876", hasLogo: true },
  AV: { name: "Avianca", color: "#E31837", hasLogo: true },
};

// ============================================================================
// Public API
// ============================================================================

/**
 * Get airline info by IATA code
 */
export function getAirlineInfo(code: string): AirlineInfo | null {
  const upperCode = code.toUpperCase();
  return AIRLINES[upperCode] || null;
}

/**
 * Get airline logo path
 * Returns null if no logo available
 */
export function getAirlineLogo(code: string): {
  src: string;
  alt: string;
} | null {
  const upperCode = code.toUpperCase();
  const airline = AIRLINES[upperCode];

  if (!airline || !airline.hasLogo) {
    return null;
  }

  return {
    src: `/airlines/${upperCode}.svg`,
    alt: airline.name,
  };
}

/**
 * Get airline brand color
 * Falls back to neutral blue if unknown
 */
export function getAirlineColor(code: string): string {
  const upperCode = code.toUpperCase();
  const airline = AIRLINES[upperCode];
  return airline?.color || "#4f7386"; // --blue-soft fallback
}

/**
 * Get airline display name
 * Falls back to code if unknown
 */
export function getAirlineName(code: string): string {
  const upperCode = code.toUpperCase();
  const airline = AIRLINES[upperCode];
  return airline?.name || code;
}

/**
 * Check if airline has a logo
 */
export function hasAirlineLogo(code: string): boolean {
  const upperCode = code.toUpperCase();
  const airline = AIRLINES[upperCode];
  return airline?.hasLogo ?? false;
}

