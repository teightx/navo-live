/**
 * Price History Module
 *
 * Records and retrieves aggregated price history for routes.
 * Used to provide honest price insights based on real search data.
 *
 * Key format: price-history:{routeKey}
 * Route key format: {from}-{to}-{YYYY-MM}
 */

import "server-only";

import { getStore } from "@/lib/store";
import { createRequestLogger } from "@/lib/logging/logger";

// ============================================================================
// Types
// ============================================================================

/**
 * Aggregated price history for a route
 */
export interface PriceHistory {
  /** Route key (e.g., "GRU-LIS-2025-02") */
  routeKey: string;
  /** Number of price samples recorded */
  count: number;
  /** Average price (rounded to integer) */
  avgPrice: number;
  /** Minimum price recorded */
  minPrice: number;
  /** Maximum price recorded */
  maxPrice: number;
  /** ISO timestamp of last update */
  lastUpdated: string;
}

/**
 * Internal storage format (includes sum for incremental averaging)
 */
interface PriceHistoryEntry extends PriceHistory {
  /** Sum of all prices (for calculating average) */
  sumPrice: number;
}

// ============================================================================
// Constants
// ============================================================================

/** TTL for price history: 30 days */
export const PRICE_HISTORY_TTL_SEC = 30 * 24 * 60 * 60;

/** Key prefix for price history */
const KEY_PREFIX = "price-history:";

// ============================================================================
// Key Builders
// ============================================================================

/**
 * Build a route key from origin, destination, and date
 *
 * @param from - Origin IATA code
 * @param to - Destination IATA code
 * @param departureDate - Departure date (YYYY-MM-DD)
 * @returns Route key (e.g., "GRU-LIS-2025-02")
 */
export function buildRouteKey(
  from: string,
  to: string,
  departureDate: string
): string {
  // Extract year and month from date
  const [year, month] = departureDate.split("-");
  return `${from.toUpperCase()}-${to.toUpperCase()}-${year}-${month}`;
}

/**
 * Build the storage key from a route key
 */
export function buildPriceHistoryKey(routeKey: string): string {
  return `${KEY_PREFIX}${routeKey}`;
}

// ============================================================================
// Functions
// ============================================================================

/**
 * Record a price for a route
 *
 * Updates the aggregated statistics incrementally:
 * - Increments count
 * - Updates sum (for average calculation)
 * - Updates min/max if needed
 *
 * @param routeKey - Route key (use buildRouteKey to generate)
 * @param price - Price to record (must be positive integer)
 */
export async function recordPrice(
  routeKey: string,
  price: number
): Promise<void> {
  if (!routeKey || price <= 0) {
    return;
  }

  const store = getStore();
  const key = buildPriceHistoryKey(routeKey);
  const logger = createRequestLogger("price-history");

  try {
    // Get existing entry
    const existing = await store.get<PriceHistoryEntry>(key);

    let entry: PriceHistoryEntry;

    if (existing) {
      // Update existing entry
      const newCount = existing.count + 1;
      const newSum = existing.sumPrice + price;

      entry = {
        routeKey,
        count: newCount,
        sumPrice: newSum,
        avgPrice: Math.round(newSum / newCount),
        minPrice: Math.min(existing.minPrice, price),
        maxPrice: Math.max(existing.maxPrice, price),
        lastUpdated: new Date().toISOString(),
      };
    } else {
      // Create new entry
      entry = {
        routeKey,
        count: 1,
        sumPrice: price,
        avgPrice: price,
        minPrice: price,
        maxPrice: price,
        lastUpdated: new Date().toISOString(),
      };
    }

    // Store with TTL
    await store.set(key, entry, PRICE_HISTORY_TTL_SEC);

    // Log only on first record or every 100th record
    if (entry.count === 1 || entry.count % 100 === 0) {
      logger.info("PRICE_HISTORY_RECORDED", {
        routeKey,
        count: entry.count,
        avgPrice: entry.avgPrice,
      });
    }
  } catch (error) {
    // Don't throw - price history is best-effort
    logger.error("PRICE_HISTORY_RECORD_FAILED", {
      routeKey,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Record prices for multiple flights in a search
 *
 * @param from - Origin IATA code
 * @param to - Destination IATA code
 * @param departureDate - Departure date (YYYY-MM-DD)
 * @param prices - Array of prices to record
 */
export async function recordSearchPrices(
  from: string,
  to: string,
  departureDate: string,
  prices: number[]
): Promise<void> {
  if (!from || !to || !departureDate || prices.length === 0) {
    return;
  }

  const routeKey = buildRouteKey(from, to, departureDate);

  // Record each price (could batch, but keeping simple for now)
  // Using Promise.allSettled to not fail on individual errors
  await Promise.allSettled(
    prices.map((price) => recordPrice(routeKey, price))
  );
}

/**
 * Get price history for a route
 *
 * @param routeKey - Route key (use buildRouteKey to generate)
 * @returns Price history if exists, null otherwise
 */
export async function getPriceHistory(
  routeKey: string
): Promise<PriceHistory | null> {
  if (!routeKey) {
    return null;
  }

  const store = getStore();
  const key = buildPriceHistoryKey(routeKey);

  try {
    const entry = await store.get<PriceHistoryEntry>(key);

    if (!entry) {
      return null;
    }

    // Return without internal sumPrice field
    return {
      routeKey: entry.routeKey,
      count: entry.count,
      avgPrice: entry.avgPrice,
      minPrice: entry.minPrice,
      maxPrice: entry.maxPrice,
      lastUpdated: entry.lastUpdated,
    };
  } catch {
    // On error, return null (no insight is better than wrong insight)
    return null;
  }
}

/**
 * Get price history for a route by origin, destination, and date
 *
 * @param from - Origin IATA code
 * @param to - Destination IATA code
 * @param departureDate - Departure date (YYYY-MM-DD)
 * @returns Price history if exists, null otherwise
 */
export async function getPriceHistoryForRoute(
  from: string,
  to: string,
  departureDate: string
): Promise<PriceHistory | null> {
  const routeKey = buildRouteKey(from, to, departureDate);
  return getPriceHistory(routeKey);
}

