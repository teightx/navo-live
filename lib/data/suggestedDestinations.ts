/**
 * Suggested Destinations Dataset
 *
 * Curated list of destinations for holiday suggestions.
 * Tagged for matching with holiday types and trip durations.
 */

import type { HolidayWindow } from "./holidays/br";

// ============================================================================
// Types
// ============================================================================

export interface SuggestedDestination {
  /** Destination IATA code */
  code: string;
  /** City name (lowercase, Portuguese) */
  city: string;
  /** Country name (lowercase, Portuguese) */
  country: string;
  /** Destination tags for matching */
  tags: (
    | "praia"
    | "frio"
    | "cidade"
    | "natureza"
    | "europa"
    | "curto"
    | "medio"
    | "longo"
    | "domestico"
    | "internacional"
  )[];
  /** Minimum flight hours from GRU (approximate) */
  flightHours: number;
  /** Priority for ordering (lower = higher priority) */
  priority: number;
}

// ============================================================================
// Destination Data
// ============================================================================

/**
 * Curated destinations - mix of international and domestic
 */
export const SUGGESTED_DESTINATIONS: SuggestedDestination[] = [
  // === International - Europe ===
  {
    code: "LIS",
    city: "lisboa",
    country: "portugal",
    tags: ["cidade", "europa", "medio", "longo", "internacional"],
    flightHours: 9,
    priority: 1,
  },
  {
    code: "MAD",
    city: "madrid",
    country: "espanha",
    tags: ["cidade", "europa", "medio", "longo", "internacional"],
    flightHours: 10,
    priority: 2,
  },
  {
    code: "CDG",
    city: "paris",
    country: "frança",
    tags: ["cidade", "frio", "europa", "longo", "internacional"],
    flightHours: 11,
    priority: 3,
  },
  {
    code: "FCO",
    city: "roma",
    country: "itália",
    tags: ["cidade", "europa", "longo", "internacional"],
    flightHours: 11,
    priority: 4,
  },
  {
    code: "LHR",
    city: "londres",
    country: "reino unido",
    tags: ["cidade", "frio", "europa", "longo", "internacional"],
    flightHours: 11,
    priority: 5,
  },
  {
    code: "AMS",
    city: "amsterdam",
    country: "holanda",
    tags: ["cidade", "frio", "europa", "longo", "internacional"],
    flightHours: 11,
    priority: 6,
  },

  // === International - Americas ===
  {
    code: "MIA",
    city: "miami",
    country: "estados unidos",
    tags: ["praia", "cidade", "medio", "internacional"],
    flightHours: 8,
    priority: 10,
  },
  {
    code: "MCO",
    city: "orlando",
    country: "estados unidos",
    tags: ["cidade", "medio", "longo", "internacional"],
    flightHours: 9,
    priority: 11,
  },
  {
    code: "JFK",
    city: "nova york",
    country: "estados unidos",
    tags: ["cidade", "frio", "medio", "longo", "internacional"],
    flightHours: 10,
    priority: 12,
  },
  {
    code: "EZE",
    city: "buenos aires",
    country: "argentina",
    tags: ["cidade", "frio", "curto", "medio", "internacional"],
    flightHours: 3,
    priority: 15,
  },
  {
    code: "SCL",
    city: "santiago",
    country: "chile",
    tags: ["cidade", "frio", "natureza", "curto", "medio", "internacional"],
    flightHours: 4,
    priority: 16,
  },
  {
    code: "CUN",
    city: "cancún",
    country: "méxico",
    tags: ["praia", "medio", "internacional"],
    flightHours: 8,
    priority: 20,
  },

  // === Domestic - Northeast (Beaches) ===
  {
    code: "REC",
    city: "recife",
    country: "brasil",
    tags: ["praia", "curto", "domestico"],
    flightHours: 3,
    priority: 30,
  },
  {
    code: "SSA",
    city: "salvador",
    country: "brasil",
    tags: ["praia", "cidade", "curto", "domestico"],
    flightHours: 2,
    priority: 31,
  },
  {
    code: "FOR",
    city: "fortaleza",
    country: "brasil",
    tags: ["praia", "curto", "domestico"],
    flightHours: 3,
    priority: 32,
  },
  {
    code: "NAT",
    city: "natal",
    country: "brasil",
    tags: ["praia", "curto", "domestico"],
    flightHours: 3,
    priority: 33,
  },
  {
    code: "MCZ",
    city: "maceió",
    country: "brasil",
    tags: ["praia", "curto", "domestico"],
    flightHours: 3,
    priority: 34,
  },

  // === Domestic - South ===
  {
    code: "FLN",
    city: "florianópolis",
    country: "brasil",
    tags: ["praia", "natureza", "curto", "domestico"],
    flightHours: 1,
    priority: 40,
  },
  {
    code: "POA",
    city: "porto alegre",
    country: "brasil",
    tags: ["cidade", "frio", "curto", "domestico"],
    flightHours: 2,
    priority: 41,
  },

  // === Domestic - Other ===
  {
    code: "SDU",
    city: "rio de janeiro",
    country: "brasil",
    tags: ["praia", "cidade", "curto", "domestico"],
    flightHours: 1,
    priority: 50,
  },
];

// ============================================================================
// Functions
// ============================================================================

/**
 * Filter destinations that can't be reached from an origin
 * (e.g., domestic flights from same city)
 */
function filterSameCity(dest: SuggestedDestination, originCode: string): boolean {
  // São Paulo airports
  const saoPauloAirports = ["GRU", "CGH", "VCP"];
  if (saoPauloAirports.includes(originCode)) {
    return !saoPauloAirports.includes(dest.code);
  }

  // Rio airports
  const rioAirports = ["GIG", "SDU"];
  if (rioAirports.includes(originCode)) {
    return !rioAirports.includes(dest.code);
  }

  return dest.code !== originCode;
}

/**
 * Score a destination for a holiday window
 *
 * Higher score = better match
 */
function scoreDestination(
  dest: SuggestedDestination,
  window: HolidayWindow
): number {
  let score = 100 - dest.priority; // Base score from priority

  // Match tags
  const matchingTags = dest.tags.filter((tag) =>
    window.tags.includes(tag as HolidayWindow["tags"][number])
  );
  score += matchingTags.length * 10;

  // Duration matching
  if (window.days <= 4 && dest.tags.includes("curto")) {
    score += 15;
  } else if (window.days >= 5 && window.days <= 7 && dest.tags.includes("medio")) {
    score += 15;
  } else if (window.days > 7 && dest.tags.includes("longo")) {
    score += 15;
  }

  // Penalize long flights for short trips
  if (window.days <= 4 && dest.flightHours > 6) {
    score -= 20;
  }

  // Boost domestic for short trips
  if (window.days <= 4 && dest.tags.includes("domestico")) {
    score += 10;
  }

  // Boost international for long trips
  if (window.days >= 7 && dest.tags.includes("internacional")) {
    score += 10;
  }

  return score;
}

/**
 * Pick best destinations for a holiday window
 *
 * @param window - The holiday window to match
 * @param originCode - Origin airport IATA code
 * @param limit - Maximum destinations to return (default: 6)
 * @returns Sorted array of matching destinations
 */
export function pickDestinationsForHoliday(
  window: HolidayWindow,
  originCode: string,
  limit: number = 6
): SuggestedDestination[] {
  // Filter out same-city destinations
  const filtered = SUGGESTED_DESTINATIONS.filter((d) =>
    filterSameCity(d, originCode)
  );

  // Score and sort
  const scored = filtered.map((dest) => ({
    dest,
    score: scoreDestination(dest, window),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.dest);
}

/**
 * Get destination by code
 */
export function getDestinationByCode(code: string): SuggestedDestination | null {
  return SUGGESTED_DESTINATIONS.find((d) => d.code === code) || null;
}

