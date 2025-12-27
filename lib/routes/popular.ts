/**
 * Popular Routes Service
 *
 * Server-only service that provides popular routes with real price data
 * from the price history system.
 *
 * Rules:
 * - Only shows price if sampleCount >= MIN_SAMPLES
 * - Price shown is the minimum recorded in the last 30 days
 * - If no data, returns undefined price (UI shows "sem dados ainda")
 */

import "server-only";

import { getEnabledPopularRoutes, type PopularRouteDefinition } from "@/lib/data/popularRoutes";
import { getPriceHistory, buildPriceHistoryKey } from "@/lib/price/history";
import { getStore } from "@/lib/store";
import { createRequestLogger } from "@/lib/logging/logger";

// ============================================================================
// Types
// ============================================================================

export interface PopularRouteCard {
  /** Unique ID for this route */
  id: string;
  /** Origin IATA code */
  from: string;
  /** Destination IATA code */
  to: string;
  /** Display title (destination city) */
  title: string;
  /** Display subtitle (country) */
  subtitle: string;
  /** Route label for display (e.g., "são paulo → lisboa") */
  routeLabel: string;
  /** Minimum price from last 30 days (undefined if no data) */
  price?: number;
  /** Number of price samples */
  sampleCount: number;
  /** ISO timestamp of last price update */
  lastUpdated?: string;
  /** Whether this has enough data to be considered reliable */
  hasReliableData: boolean;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Minimum number of samples required to show a price
 * This ensures we don't show unreliable data from just one or two searches
 */
const MIN_SAMPLES_FOR_PRICE = 5;

// ============================================================================
// Functions
// ============================================================================

/**
 * Get the current and previous month keys for price history lookup
 *
 * Since price history is stored by month (e.g., "GRU-LIS-2025-01"),
 * we need to check both current and previous month to get last 30 days.
 */
function getRelevantMonthKeys(from: string, to: string): string[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

  // Previous month
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  // Format as YYYY-MM
  const currentKey = `${from.toUpperCase()}-${to.toUpperCase()}-${currentYear}-${String(currentMonth).padStart(2, "0")}`;
  const prevKey = `${from.toUpperCase()}-${to.toUpperCase()}-${prevYear}-${String(prevMonth).padStart(2, "0")}`;

  return [currentKey, prevKey];
}

/**
 * Get aggregated price data for a route from last 30 days
 *
 * Combines data from current and previous month if available.
 */
async function getRouteAggregatedData(
  from: string,
  to: string
): Promise<{
  minPrice?: number;
  sampleCount: number;
  lastUpdated?: string;
}> {
  const keys = getRelevantMonthKeys(from, to);

  let totalCount = 0;
  let overallMin: number | undefined;
  let latestUpdate: string | undefined;

  for (const routeKey of keys) {
    const history = await getPriceHistory(routeKey);

    if (history) {
      totalCount += history.count;

      if (overallMin === undefined || history.minPrice < overallMin) {
        overallMin = history.minPrice;
      }

      if (!latestUpdate || history.lastUpdated > latestUpdate) {
        latestUpdate = history.lastUpdated;
      }
    }
  }

  return {
    minPrice: overallMin,
    sampleCount: totalCount,
    lastUpdated: latestUpdate,
  };
}

/**
 * Get popular routes with real price data
 *
 * Returns a list of route cards ready for display on the home page.
 * Each card includes price data from the last 30 days if available.
 *
 * @param limit - Maximum number of routes to return (default: 6)
 * @returns Array of popular route cards
 */
export async function getPopularRoutesWithPrice(
  limit: number = 6
): Promise<PopularRouteCard[]> {
  const logger = createRequestLogger("popular-routes");
  const routes = getEnabledPopularRoutes();

  const cards: PopularRouteCard[] = [];

  for (const route of routes.slice(0, limit * 2)) {
    // Fetch more than needed in case some have no data
    try {
      const priceData = await getRouteAggregatedData(route.from, route.to);

      const hasReliableData = priceData.sampleCount >= MIN_SAMPLES_FOR_PRICE;

      cards.push({
        id: `${route.from}-${route.to}`,
        from: route.from,
        to: route.to,
        title: route.labelCity,
        subtitle: route.country,
        routeLabel: `${route.originCity} → ${route.labelCity}`,
        // Only show price if we have enough samples
        price: hasReliableData ? priceData.minPrice : undefined,
        sampleCount: priceData.sampleCount,
        lastUpdated: priceData.lastUpdated,
        hasReliableData,
      });
    } catch (error) {
      logger.error("POPULAR_ROUTE_FETCH_FAILED", {
        from: route.from,
        to: route.to,
        message: error instanceof Error ? error.message : "Unknown error",
      });

      // Still add the card, just without price data
      cards.push({
        id: `${route.from}-${route.to}`,
        from: route.from,
        to: route.to,
        title: route.labelCity,
        subtitle: route.country,
        routeLabel: `${route.originCity} → ${route.labelCity}`,
        price: undefined,
        sampleCount: 0,
        lastUpdated: undefined,
        hasReliableData: false,
      });
    }
  }

  // Sort by: 1) hasReliableData (true first), 2) priority (implied by order)
  // Then limit to requested count
  const sortedCards = cards.sort((a, b) => {
    // Prioritize cards with reliable data
    if (a.hasReliableData && !b.hasReliableData) return -1;
    if (!a.hasReliableData && b.hasReliableData) return 1;
    return 0;
  });

  const result = sortedCards.slice(0, limit);

  logger.info("POPULAR_ROUTES_FETCHED", {
    total: routes.length,
    returned: result.length,
    withPrice: result.filter((r) => r.price !== undefined).length,
  });

  return result;
}

/**
 * Get popular routes for API response (includes metadata)
 */
export async function getPopularRoutesForApi(limit: number = 6): Promise<{
  routes: PopularRouteCard[];
  meta: {
    fetchedAt: string;
    minSamplesRequired: number;
  };
}> {
  const routes = await getPopularRoutesWithPrice(limit);

  return {
    routes,
    meta: {
      fetchedAt: new Date().toISOString(),
      minSamplesRequired: MIN_SAMPLES_FOR_PRICE,
    },
  };
}

