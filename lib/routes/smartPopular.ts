/**
 * Smart Popular Routes Service
 *
 * Server-only service that generates holiday-based route suggestions
 * with real price data from the price history system.
 *
 * Rules:
 * - Only shows price if sampleCount >= MIN_SAMPLES
 * - Price shown is the minimum recorded in the last 30 days
 * - If no data, returns undefined price (UI shows "sem dados ainda")
 * - Origin is determined by client (last search) or fallback to SAO
 */

import "server-only";

import { getNextHolidayWindows, type HolidayWindow } from "@/lib/data/holidays/br";
import {
  pickDestinationsForHoliday,
  getDestinationByCode,
  type SuggestedDestination,
} from "@/lib/data/suggestedDestinations";
import { getPriceHistoryForRoute } from "@/lib/price/history";
import { getAirportByCode } from "@/lib/airports";
import { createRequestLogger } from "@/lib/logging/logger";

// ============================================================================
// Types
// ============================================================================

export interface SmartRouteCard {
  /** Unique ID for this suggestion */
  id: string;
  /** Origin IATA code */
  from: string;
  /** Origin city name */
  fromCity: string;
  /** Destination IATA code */
  to: string;
  /** Destination city name */
  toCity: string;
  /** Destination country */
  toCountry: string;
  /** Holiday name (e.g., "Carnaval") */
  holidayName: string;
  /** Holiday key for tracking */
  holidayKey: string;
  /** Suggested departure date (YYYY-MM-DD) */
  departDate: string;
  /** Suggested return date (YYYY-MM-DD) */
  returnDate: string;
  /** Trip duration in days */
  tripDays: number;
  /** Minimum price from history (undefined if no data) */
  price?: number;
  /** Number of price samples */
  sampleCount: number;
  /** Whether this has enough data to be considered reliable */
  hasReliableData: boolean;
}

export interface SmartRoutesResponse {
  /** Array of route suggestions */
  routes: SmartRouteCard[];
  /** Origin used for suggestions */
  origin: {
    code: string;
    city: string;
  };
  /** Holidays included */
  holidays: {
    key: string;
    name: string;
    startDate: string;
    endDate: string;
  }[];
  /** Metadata */
  meta: {
    fetchedAt: string;
    minSamplesRequired: number;
  };
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Minimum samples required to show a price
 */
const MIN_SAMPLES_FOR_PRICE = 5;

/**
 * Default origin if none provided
 */
const DEFAULT_ORIGIN = "GRU";

/**
 * Maximum destinations per holiday
 */
const DESTINATIONS_PER_HOLIDAY = 3;

/**
 * Maximum holidays to show
 */
const MAX_HOLIDAYS = 4;

// ============================================================================
// Functions
// ============================================================================

/**
 * Get origin city name from IATA code
 */
function getOriginCity(code: string): string {
  const airport = getAirportByCode(code);
  if (airport) {
    return airport.city.toLowerCase();
  }

  // Fallback for common codes
  const cityMap: Record<string, string> = {
    GRU: "são paulo",
    CGH: "são paulo",
    GIG: "rio de janeiro",
    SDU: "rio de janeiro",
    BSB: "brasília",
    CNF: "belo horizonte",
    POA: "porto alegre",
    CWB: "curitiba",
    REC: "recife",
    SSA: "salvador",
    FOR: "fortaleza",
  };

  return cityMap[code.toUpperCase()] || code.toLowerCase();
}

/**
 * Get smart popular routes for a given origin
 *
 * @param originCode - Origin IATA code (defaults to GRU)
 * @param now - Current date (for testing)
 * @returns Smart routes response
 */
export async function getSmartPopularRoutes(
  originCode: string = DEFAULT_ORIGIN,
  now: Date = new Date()
): Promise<SmartRoutesResponse> {
  const logger = createRequestLogger("smart-routes");
  const origin = originCode.toUpperCase() || DEFAULT_ORIGIN;
  const originCity = getOriginCity(origin);

  // Get upcoming holidays
  const holidayWindows = getNextHolidayWindows(now, MAX_HOLIDAYS);

  logger.info("SMART_ROUTES_START", {
    origin,
    holidayCount: holidayWindows.length,
  });

  const routes: SmartRouteCard[] = [];
  const processedHolidays: SmartRoutesResponse["holidays"] = [];

  // For each holiday, pick best destinations
  for (const window of holidayWindows) {
    const destinations = pickDestinationsForHoliday(
      window,
      origin,
      DESTINATIONS_PER_HOLIDAY
    );

    processedHolidays.push({
      key: window.key,
      name: window.name,
      startDate: window.startDate,
      endDate: window.endDate,
    });

    // Create route cards for each destination
    for (const dest of destinations) {
      try {
        // Get price history for this route and month
        const priceHistory = await getPriceHistoryForRoute(
          origin,
          dest.code,
          window.startDate
        );

        const sampleCount = priceHistory?.count ?? 0;
        const hasReliableData = sampleCount >= MIN_SAMPLES_FOR_PRICE;

        routes.push({
          id: `${window.key}-${dest.code}`,
          from: origin,
          fromCity: originCity,
          to: dest.code,
          toCity: dest.city,
          toCountry: dest.country,
          holidayName: window.name,
          holidayKey: window.key,
          departDate: window.startDate,
          returnDate: window.endDate,
          tripDays: window.days,
          price: hasReliableData ? priceHistory?.minPrice : undefined,
          sampleCount,
          hasReliableData,
        });
      } catch (error) {
        logger.error("SMART_ROUTE_PRICE_FETCH_FAILED", {
          origin,
          dest: dest.code,
          holiday: window.key,
          message: error instanceof Error ? error.message : "Unknown error",
        });

        // Still add the card without price
        routes.push({
          id: `${window.key}-${dest.code}`,
          from: origin,
          fromCity: originCity,
          to: dest.code,
          toCity: dest.city,
          toCountry: dest.country,
          holidayName: window.name,
          holidayKey: window.key,
          departDate: window.startDate,
          returnDate: window.endDate,
          tripDays: window.days,
          price: undefined,
          sampleCount: 0,
          hasReliableData: false,
        });
      }
    }
  }

  logger.info("SMART_ROUTES_COMPLETE", {
    origin,
    routeCount: routes.length,
    withPrice: routes.filter((r) => r.price !== undefined).length,
  });

  return {
    routes,
    origin: {
      code: origin,
      city: originCity,
    },
    holidays: processedHolidays,
    meta: {
      fetchedAt: now.toISOString(),
      minSamplesRequired: MIN_SAMPLES_FOR_PRICE,
    },
  };
}

