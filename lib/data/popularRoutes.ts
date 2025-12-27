/**
 * Popular Routes Dataset
 *
 * Curated list of popular flight routes to display on the home page.
 * These are routes with high search volume or strategic importance.
 *
 * Note: This is a seed dataset. In the future, this could be derived
 * from actual search traffic analytics.
 */

export interface PopularRouteDefinition {
  /** Origin IATA code */
  from: string;
  /** Destination IATA code */
  to: string;
  /** City name for display (lowercase) */
  labelCity: string;
  /** Country name for display (lowercase) */
  country: string;
  /** Origin city name for display (lowercase) */
  originCity: string;
  /** Whether this route is currently enabled */
  enabled: boolean;
  /** Optional priority for ordering (lower = higher priority) */
  priority?: number;
}

/**
 * Curated list of popular routes
 *
 * Based on common international and domestic routes from Brazil.
 * Priority determines display order when prices are equal.
 */
export const POPULAR_ROUTES: PopularRouteDefinition[] = [
  // International from São Paulo
  {
    from: "GRU",
    to: "LIS",
    labelCity: "lisboa",
    country: "portugal",
    originCity: "são paulo",
    enabled: true,
    priority: 1,
  },
  {
    from: "GRU",
    to: "MAD",
    labelCity: "madrid",
    country: "espanha",
    originCity: "são paulo",
    enabled: true,
    priority: 2,
  },
  {
    from: "GRU",
    to: "CDG",
    labelCity: "paris",
    country: "frança",
    originCity: "são paulo",
    enabled: true,
    priority: 3,
  },
  {
    from: "GRU",
    to: "LHR",
    labelCity: "londres",
    country: "reino unido",
    originCity: "são paulo",
    enabled: true,
    priority: 4,
  },
  {
    from: "GRU",
    to: "MIA",
    labelCity: "miami",
    country: "estados unidos",
    originCity: "são paulo",
    enabled: true,
    priority: 5,
  },
  {
    from: "GRU",
    to: "JFK",
    labelCity: "nova york",
    country: "estados unidos",
    originCity: "são paulo",
    enabled: true,
    priority: 6,
  },

  // Domestic Brazil
  {
    from: "GIG",
    to: "REC",
    labelCity: "recife",
    country: "brasil",
    originCity: "rio de janeiro",
    enabled: true,
    priority: 10,
  },
  {
    from: "GRU",
    to: "SSA",
    labelCity: "salvador",
    country: "brasil",
    originCity: "são paulo",
    enabled: true,
    priority: 11,
  },
  {
    from: "GRU",
    to: "FOR",
    labelCity: "fortaleza",
    country: "brasil",
    originCity: "são paulo",
    enabled: true,
    priority: 12,
  },

  // From other cities
  {
    from: "GIG",
    to: "LIS",
    labelCity: "lisboa",
    country: "portugal",
    originCity: "rio de janeiro",
    enabled: true,
    priority: 20,
  },
  {
    from: "BSB",
    to: "MIA",
    labelCity: "miami",
    country: "estados unidos",
    originCity: "brasília",
    enabled: true,
    priority: 21,
  },
];

/**
 * Get all enabled popular routes
 */
export function getEnabledPopularRoutes(): PopularRouteDefinition[] {
  return POPULAR_ROUTES.filter((route) => route.enabled).sort(
    (a, b) => (a.priority ?? 99) - (b.priority ?? 99)
  );
}

