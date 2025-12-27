/**
 * Price Insight Module
 *
 * Provides honest price insights based on real historical data.
 * If no historical data exists, returns null (UI should not show insight).
 *
 * No mocks. No fake predictions. No ML.
 * If we don't have data, we don't pretend.
 */

import "server-only";

import {
  getPriceHistoryForRoute,
  buildRouteKey,
  type PriceHistory,
} from "./history";

// ============================================================================
// Types
// ============================================================================

/**
 * Price insight for a flight
 */
export interface PriceInsight {
  /** Route info */
  route: {
    from: string;
    to: string;
  };
  /** Current flight price */
  currentPrice: number;
  /** Historical average price */
  historicalAverage: number;
  /** Minimum price recorded in history */
  minRecorded: number;
  /** Maximum price recorded in history */
  maxRecorded: number;
  /** Difference from average (positive = cheaper than average) */
  priceDifference: number;
  /** Percentage difference from average */
  percentageDifference: number;
  /** Whether current price is below average */
  isBelowAverage: boolean;
  /** Whether current price is the lowest recorded */
  isLowestRecorded: boolean;
  /** Number of samples in history */
  sampleCount: number;
}

/**
 * Insight label for UI display
 */
export type InsightLabel =
  | "below_average"    // Price is significantly below average
  | "above_average"    // Price is significantly above average
  | "around_average"   // Price is close to average
  | null;              // Not enough data or insight not meaningful

// ============================================================================
// Thresholds
// ============================================================================

/** Minimum samples required to show insight */
const MIN_SAMPLES_FOR_INSIGHT = 5;

/** Minimum percentage difference to show "below" or "above" average */
const SIGNIFICANCE_THRESHOLD_PERCENT = 5;

// ============================================================================
// Functions
// ============================================================================

/**
 * Get price insight for a flight
 *
 * Returns null if:
 * - Missing route information
 * - No historical data exists
 * - Not enough samples (< MIN_SAMPLES_FOR_INSIGHT)
 *
 * @param from - Origin IATA code
 * @param to - Destination IATA code
 * @param departureDate - Departure date (YYYY-MM-DD)
 * @param currentPrice - Current flight price
 * @returns Price insight or null if insufficient data
 */
export async function getPriceInsight(
  from: string,
  to: string,
  departureDate: string,
  currentPrice: number
): Promise<PriceInsight | null> {
  // Validate inputs
  if (!from || !to || !departureDate || currentPrice <= 0) {
    return null;
  }

  // Get historical data
  const history = await getPriceHistoryForRoute(from, to, departureDate);

  // No history = no insight
  if (!history) {
    return null;
  }

  // Not enough samples = no insight
  if (history.count < MIN_SAMPLES_FOR_INSIGHT) {
    return null;
  }

  // Calculate differences
  const priceDifference = history.avgPrice - currentPrice;
  const percentageDifference =
    history.avgPrice > 0
      ? Math.round((priceDifference / history.avgPrice) * 100)
      : 0;

  const isBelowAverage = priceDifference > 0;
  const isLowestRecorded = currentPrice <= history.minPrice;

  return {
    route: { from: from.toUpperCase(), to: to.toUpperCase() },
    currentPrice,
    historicalAverage: history.avgPrice,
    minRecorded: history.minPrice,
    maxRecorded: history.maxPrice,
    priceDifference,
    percentageDifference: Math.abs(percentageDifference),
    isBelowAverage,
    isLowestRecorded,
    sampleCount: history.count,
  };
}

/**
 * Get a simple insight label for UI display
 *
 * @param insight - Price insight object
 * @returns Label or null if not significant enough
 */
export function getInsightLabel(insight: PriceInsight | null): InsightLabel {
  if (!insight) {
    return null;
  }

  if (insight.percentageDifference < SIGNIFICANCE_THRESHOLD_PERCENT) {
    return null; // Not significant enough to show
  }

  if (insight.isBelowAverage) {
    return "below_average";
  }

  return "above_average";
}

/**
 * Calculate price insights for multiple flights
 *
 * @param from - Origin IATA code
 * @param to - Destination IATA code
 * @param departureDate - Departure date (YYYY-MM-DD)
 * @param prices - Array of prices
 * @returns Array of insights (null for flights without enough data)
 */
export async function getPriceInsightsForFlights(
  from: string,
  to: string,
  departureDate: string,
  prices: number[]
): Promise<(PriceInsight | null)[]> {
  // Get history once
  const history = await getPriceHistoryForRoute(from, to, departureDate);

  // If no history or not enough samples, return all nulls
  if (!history || history.count < MIN_SAMPLES_FOR_INSIGHT) {
    return prices.map(() => null);
  }

  // Calculate insight for each price
  return prices.map((currentPrice) => {
    if (currentPrice <= 0) {
      return null;
    }

    const priceDifference = history.avgPrice - currentPrice;
    const percentageDifference =
      history.avgPrice > 0
        ? Math.round((priceDifference / history.avgPrice) * 100)
        : 0;

    return {
      route: { from: from.toUpperCase(), to: to.toUpperCase() },
      currentPrice,
      historicalAverage: history.avgPrice,
      minRecorded: history.minPrice,
      maxRecorded: history.maxPrice,
      priceDifference,
      percentageDifference: Math.abs(percentageDifference),
      isBelowAverage: priceDifference > 0,
      isLowestRecorded: currentPrice <= history.minPrice,
      sampleCount: history.count,
    };
  });
}

// ============================================================================
// Re-exports
// ============================================================================

export { buildRouteKey } from "./history";

