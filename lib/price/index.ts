/**
 * Price Module
 *
 * Provides price history recording and insights based on real data.
 */

export {
  // History
  recordPrice,
  recordSearchPrices,
  getPriceHistory,
  getPriceHistoryForRoute,
  buildRouteKey,
  buildPriceHistoryKey,
  PRICE_HISTORY_TTL_SEC,
  type PriceHistory,
} from "./history";

export {
  // Insights
  getPriceInsight,
  getPriceInsightsForFlights,
  getInsightLabel,
  type PriceInsight,
  type InsightLabel,
} from "./insight";

