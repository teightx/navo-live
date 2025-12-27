/**
 * Mock Price Generator
 *
 * Generates deterministic mock prices for route suggestions.
 * Prices are consistent for the same route within a 24h window.
 *
 * This is used when real price history data is not available.
 */

// ============================================================================
// Configuration
// ============================================================================

/**
 * Base price ranges by destination type (in BRL)
 */
const PRICE_RANGES = {
  // Domestic Brazilian destinations
  domestic: { min: 350, max: 900 },
  // South American destinations
  southAmerica: { min: 800, max: 2200 },
  // North American destinations (USA, Canada, Mexico)
  northAmerica: { min: 2500, max: 5500 },
  // European destinations
  europe: { min: 3200, max: 7000 },
  // Other international
  other: { min: 2800, max: 6000 },
} as const;

/**
 * Destination classification by IATA code
 */
const DESTINATION_TYPES: Record<string, keyof typeof PRICE_RANGES> = {
  // Domestic
  REC: "domestic",
  SSA: "domestic",
  FLN: "domestic",
  POA: "domestic",
  CWB: "domestic",
  BSB: "domestic",
  FOR: "domestic",
  NAT: "domestic",
  MCZ: "domestic",
  CNF: "domestic",
  VIX: "domestic",
  MAO: "domestic",
  BEL: "domestic",

  // South America
  EZE: "southAmerica", // Buenos Aires
  SCL: "southAmerica", // Santiago
  BOG: "southAmerica", // Bogotá
  LIM: "southAmerica", // Lima
  MVD: "southAmerica", // Montevideo
  UIO: "southAmerica", // Quito
  CCS: "southAmerica", // Caracas

  // North America
  MIA: "northAmerica", // Miami
  MCO: "northAmerica", // Orlando
  JFK: "northAmerica", // New York
  LAX: "northAmerica", // Los Angeles
  ATL: "northAmerica", // Atlanta
  DFW: "northAmerica", // Dallas
  ORD: "northAmerica", // Chicago
  MEX: "northAmerica", // Mexico City
  CUN: "northAmerica", // Cancun
  YYZ: "northAmerica", // Toronto

  // Europe
  LIS: "europe", // Lisboa
  MAD: "europe", // Madrid
  CDG: "europe", // Paris
  FCO: "europe", // Roma
  AMS: "europe", // Amsterdam
  FRA: "europe", // Frankfurt
  LHR: "europe", // Londres
  BCN: "europe", // Barcelona
  MXP: "europe", // Milão
  ZRH: "europe", // Zurique
};

// ============================================================================
// Functions
// ============================================================================

/**
 * Simple deterministic hash function
 * Returns a number between 0 and 1
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Normalize to 0-1 range
  return Math.abs(hash % 10000) / 10000;
}

/**
 * Get the current date key (changes every 24h at midnight UTC)
 */
function getDateKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
}

/**
 * Get destination type for price calculation
 */
function getDestinationType(destinationCode: string): keyof typeof PRICE_RANGES {
  return DESTINATION_TYPES[destinationCode.toUpperCase()] || "other";
}

/**
 * Generate a mock price for a route
 *
 * @param from - Origin IATA code
 * @param to - Destination IATA code
 * @param holidayKey - Holiday identifier (for variation)
 * @returns Price in BRL
 */
export function generateMockPrice(
  from: string,
  to: string,
  holidayKey: string
): number {
  const dateKey = getDateKey();
  const routeKey = `${from}-${to}-${holidayKey}-${dateKey}`;

  const hash = hashString(routeKey);
  const destType = getDestinationType(to);
  const range = PRICE_RANGES[destType];

  // Calculate price with some randomness based on hash
  const basePrice = range.min + hash * (range.max - range.min);

  // Round to nearest 10
  return Math.round(basePrice / 10) * 10;
}

/**
 * Generate mock price with variation based on origin
 * (different origins might have different prices for same destination)
 */
export function generateMockPriceWithOrigin(
  from: string,
  to: string,
  holidayKey: string,
  originSeed: string
): number {
  const dateKey = getDateKey();
  const routeKey = `${from}-${to}-${holidayKey}-${originSeed}-${dateKey}`;

  const hash = hashString(routeKey);
  const destType = getDestinationType(to);
  const range = PRICE_RANGES[destType];

  // Add origin-based variation (±15%)
  const originHash = hashString(originSeed);
  const originVariation = 0.85 + originHash * 0.3; // 0.85 to 1.15

  const basePrice = range.min + hash * (range.max - range.min);
  const adjustedPrice = basePrice * originVariation;

  // Round to nearest 10
  return Math.round(adjustedPrice / 10) * 10;
}

/**
 * Check if mock prices should be used
 * (when real price data is not available)
 */
export function shouldUseMockPrice(sampleCount: number): boolean {
  return sampleCount < 5;
}

