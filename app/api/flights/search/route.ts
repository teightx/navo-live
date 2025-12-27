/**
 * Flight Search API Route
 *
 * GET /api/flights/search
 *
 * Internal endpoint that calls Amadeus Flight Offers Search
 * Returns normalized SearchResponse format
 *
 * Features:
 * - Rate limiting (10 requests per minute per IP)
 * - Request ID tracking
 * - Structured logging
 * - Input validation
 * - Response caching
 */

import { NextRequest, NextResponse } from "next/server";
import {
  amadeusFetch,
  AmadeusError,
  mapFlightOffersToSearchResponse,
  createSearchResponse,
  type AmadeusFlightOffersResponse,
} from "@/lib/amadeus";
import type { SearchResponse, SearchError, SearchState } from "@/lib/search/types";
import { cacheFlights } from "@/lib/search/flightCache";
import { isAmadeusEnabled, assertProdNoMocks } from "@/lib/config/flags";
import { createRequestLogger } from "@/lib/logging/logger";
import {
  getRateLimiter,
  buildRateLimitKeyForSearch,
  DEFAULT_RATE_LIMITS,
} from "@/lib/rate-limit";
import { createSearchSession } from "@/lib/search/session";
import { recordSearchPrices, getPriceInsightsForFlights } from "@/lib/price";

// ============================================================================
// Types
// ============================================================================

interface CacheEntry {
  expiresAtMs: number;
  data: SearchResponse;
}

interface ValidationError {
  field: string;
  message: string;
}

interface ValidatedParams {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  travelClass?: string;
  nonStop?: boolean;
  max: number;
  currencyCode: string;
}

// ============================================================================
// Constants
// ============================================================================

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const VALID_CABINS = ["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST"] as const;
const IATA_REGEX = /^[A-Z]{3}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Rate limit configuration
const RATE_LIMIT_CONFIG = DEFAULT_RATE_LIMITS.search;

// ============================================================================
// In-Memory Cache
// ============================================================================

const cache = new Map<string, CacheEntry>();

function getCacheKey(params: ValidatedParams): string {
  return JSON.stringify({
    o: params.originLocationCode,
    d: params.destinationLocationCode,
    dep: params.departureDate,
    ret: params.returnDate,
    a: params.adults,
    c: params.travelClass,
    ns: params.nonStop,
    m: params.max,
    cur: params.currencyCode,
  });
}

function getFromCache(key: string): SearchResponse | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAtMs) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

function setCache(key: string, data: SearchResponse): void {
  cache.set(key, {
    expiresAtMs: Date.now() + CACHE_TTL_MS,
    data,
  });
}

// ============================================================================
// Validation
// ============================================================================

function isValidDate(dateStr: string): boolean {
  if (!DATE_REGEX.test(dateStr)) return false;

  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function validateParams(searchParams: URLSearchParams): {
  valid: true;
  params: ValidatedParams;
} | {
  valid: false;
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];

  // Required: from (IATA 3 letters)
  const from = searchParams.get("from")?.toUpperCase();
  if (!from) {
    errors.push({ field: "from", message: "Required parameter" });
  } else if (!IATA_REGEX.test(from)) {
    errors.push({ field: "from", message: "Must be 3 uppercase letters (IATA code)" });
  }

  // Required: to (IATA 3 letters)
  const to = searchParams.get("to")?.toUpperCase();
  if (!to) {
    errors.push({ field: "to", message: "Required parameter" });
  } else if (!IATA_REGEX.test(to)) {
    errors.push({ field: "to", message: "Must be 3 uppercase letters (IATA code)" });
  }

  // Required: depart (YYYY-MM-DD)
  const depart = searchParams.get("depart");
  if (!depart) {
    errors.push({ field: "depart", message: "Required parameter" });
  } else if (!isValidDate(depart)) {
    errors.push({ field: "depart", message: "Must be valid date in YYYY-MM-DD format" });
  }

  // Optional: return (YYYY-MM-DD)
  const returnDate = searchParams.get("return");
  if (returnDate && !isValidDate(returnDate)) {
    errors.push({ field: "return", message: "Must be valid date in YYYY-MM-DD format" });
  }

  // Optional: adults (1-9, default 1)
  const adultsStr = searchParams.get("adults") || "1";
  const adults = parseInt(adultsStr, 10);
  if (isNaN(adults) || adults < 1 || adults > 9) {
    errors.push({ field: "adults", message: "Must be integer between 1 and 9" });
  }

  // Optional: cabin (ECONOMY|PREMIUM_ECONOMY|BUSINESS|FIRST)
  const cabin = searchParams.get("cabin")?.toUpperCase();
  if (cabin && !VALID_CABINS.includes(cabin as typeof VALID_CABINS[number])) {
    errors.push({
      field: "cabin",
      message: `Must be one of: ${VALID_CABINS.join(", ")}`,
    });
  }

  // Optional: nonStop ("true"|"false")
  const nonStopStr = searchParams.get("nonStop");
  let nonStop: boolean | undefined;
  if (nonStopStr !== null) {
    if (nonStopStr !== "true" && nonStopStr !== "false") {
      errors.push({ field: "nonStop", message: "Must be 'true' or 'false'" });
    } else {
      nonStop = nonStopStr === "true";
    }
  }

  // Optional: max (1-50, default 20)
  const maxStr = searchParams.get("max") || "20";
  const max = parseInt(maxStr, 10);
  if (isNaN(max) || max < 1 || max > 50) {
    errors.push({ field: "max", message: "Must be integer between 1 and 50" });
  }

  // Optional: currency (default BRL)
  const currency = searchParams.get("currency")?.toUpperCase() || "BRL";

  // Return errors if any
  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Build validated params
  return {
    valid: true,
    params: {
      originLocationCode: from!,
      destinationLocationCode: to!,
      departureDate: depart!,
      returnDate: returnDate || undefined,
      adults,
      travelClass: cabin,
      nonStop,
      max,
      currencyCode: currency,
    },
  };
}

// ============================================================================
// Response Helpers
// ============================================================================

function createResponseHeaders(
  requestId: string,
  rateLimitHeaders?: { retryAfter?: number }
): HeadersInit {
  const headers: HeadersInit = {
    "X-Request-Id": requestId,
  };

  if (rateLimitHeaders?.retryAfter !== undefined) {
    headers["Retry-After"] = String(rateLimitHeaders.retryAfter);
  }

  return headers;
}

// ============================================================================
// Route Handler
// ============================================================================

/**
 * GET /api/flights/search
 *
 * Query params:
 * - from: IATA code (required)
 * - to: IATA code (required)
 * - depart: YYYY-MM-DD (required)
 * - return: YYYY-MM-DD (optional)
 * - adults: 1-9 (default: 1)
 * - cabin: ECONOMY|PREMIUM_ECONOMY|BUSINESS|FIRST (optional)
 * - nonStop: true|false (optional)
 * - max: 1-50 (default: 20)
 * - currency: currency code (default: BRL)
 *
 * Returns: SearchResponse (normalized format)
 */
export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const logger = createRequestLogger(requestId);
  const startTime = Date.now();

  // Production safety check
  try {
    assertProdNoMocks();
  } catch (error) {
    logger.error("PROD_MOCKS_ENABLED", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }

  logger.info("FLIGHT_SEARCH_START", {
    url: request.url,
  });

  // ============================================================================
  // Rate Limiting (before any validation or processing)
  // ============================================================================

  const rateLimiter = getRateLimiter();
  const rateLimitKey = await buildRateLimitKeyForSearch(request);

  const rateLimitResult = await rateLimiter.check(
    rateLimitKey,
    RATE_LIMIT_CONFIG.limit,
    RATE_LIMIT_CONFIG.windowSec
  );

  if (!rateLimitResult.allowed) {
    logger.warn("RATE_LIMITED", {
      resetSec: rateLimitResult.resetSec,
      keySuffix: rateLimitKey.slice(-8),
    });

    const error: SearchError = {
      code: "RATE_LIMITED",
      message: "Muitas buscas em pouco tempo. Tente novamente em alguns segundos.",
      details: { resetSec: rateLimitResult.resetSec },
      requestId,
    };

    return NextResponse.json(error, {
      status: 429,
      headers: createResponseHeaders(requestId, {
        retryAfter: rateLimitResult.resetSec,
      }),
    });
  }

  // ============================================================================
  // Feature Flag Check
  // ============================================================================

  if (!isAmadeusEnabled()) {
    logger.warn("AMADEUS_DISABLED", {
      message: "Amadeus integration is disabled",
    });

    const error: SearchError = {
      code: "AMADEUS_DISABLED",
      message: "Amadeus integration is disabled. Set USE_AMADEUS=true to enable.",
      requestId,
    };
    return NextResponse.json(error, {
      status: 503,
      headers: createResponseHeaders(requestId),
    });
  }

  // ============================================================================
  // Parameter Validation
  // ============================================================================

  const { searchParams } = new URL(request.url);
  const validation = validateParams(searchParams);

  if (!validation.valid) {
    logger.warn("VALIDATION_ERROR", {
      errors: validation.errors,
    });

    const error: SearchError = {
      code: "VALIDATION_ERROR",
      message: "Invalid request parameters",
      errors: validation.errors,
      requestId,
    };
    return NextResponse.json(error, {
      status: 400,
      headers: createResponseHeaders(requestId),
    });
  }

  const params = validation.params;

  logger.info("SEARCH_PARAMS_VALIDATED", {
    from: params.originLocationCode,
    to: params.destinationLocationCode,
    departureDate: params.departureDate,
    returnDate: params.returnDate,
    adults: params.adults,
    travelClass: params.travelClass,
  });

  // ============================================================================
  // Cache Check
  // ============================================================================

  const cacheKey = getCacheKey(params);
  const cached = getFromCache(cacheKey);

  if (cached !== null) {
    const durationMs = Date.now() - startTime;

    logger.info("CACHE_HIT", {
      durationMs,
      flightCount: cached.flights.length,
    });

    // Create new session for cached results (so sid is always fresh)
    let sid: string | undefined;
    try {
      const searchStateForSession: SearchState = {
        tripType: params.returnDate ? "roundtrip" : "oneway",
        from: { code: params.originLocationCode, city: "", country: "", name: "" },
        to: { code: params.destinationLocationCode, city: "", country: "", name: "" },
        departDate: params.departureDate,
        returnDate: params.returnDate || null,
        pax: { adults: params.adults, children: 0, infants: 0 },
        cabinClass: params.travelClass?.toLowerCase() as SearchState["cabinClass"] || "economy",
      };

      sid = await createSearchSession(searchStateForSession, cached.flights, cached.source);
    } catch (sessionError) {
      logger.error("SESSION_STORE_FAILED", {
        message: sessionError instanceof Error ? sessionError.message : "Unknown error",
      });
    }

    // Return cached response with updated meta and sid
    const response: SearchResponse = {
      ...cached,
      sid,
      meta: {
        ...cached.meta,
        durationMs,
        cached: true,
      },
    };

    return NextResponse.json(response, {
      headers: createResponseHeaders(requestId),
    });
  }

  // ============================================================================
  // Amadeus API Call
  // ============================================================================

  try {
    const amadeusResponse = await amadeusFetch<AmadeusFlightOffersResponse>(
      "/v2/shopping/flight-offers",
      {
        method: "GET",
        query: {
          originLocationCode: params.originLocationCode,
          destinationLocationCode: params.destinationLocationCode,
          departureDate: params.departureDate,
          returnDate: params.returnDate,
          adults: params.adults,
          travelClass: params.travelClass,
          nonStop: params.nonStop,
          max: params.max,
          currencyCode: params.currencyCode,
        },
      }
    );

    const durationMs = Date.now() - startTime;

    // Map to normalized format
    const { flights, skipped } = mapFlightOffersToSearchResponse(amadeusResponse, {
      from: params.originLocationCode,
      to: params.destinationLocationCode,
      depart: params.departureDate,
      return: params.returnDate,
      adults: params.adults,
      currency: params.currencyCode,
    });

    // Create response
    const response = createSearchResponse(flights, {
      durationMs,
      cached: false,
      skipped,
    });

    // Cache the response (search-level cache)
    setCache(cacheKey, response);

    // Cache individual flights for detail page lookup (legacy)
    cacheFlights(flights, {
      from: params.originLocationCode,
      to: params.destinationLocationCode,
      depart: params.departureDate,
      return: params.returnDate,
      adults: params.adults,
      cabin: params.travelClass,
    });

    // Create search session for persistent storage
    let sid: string | undefined;
    try {
      // Build minimal SearchState for session
      const searchStateForSession: SearchState = {
        tripType: params.returnDate ? "roundtrip" : "oneway",
        from: { code: params.originLocationCode, city: "", country: "", name: "" },
        to: { code: params.destinationLocationCode, city: "", country: "", name: "" },
        departDate: params.departureDate,
        returnDate: params.returnDate || null,
        pax: { adults: params.adults, children: 0, infants: 0 },
        cabinClass: params.travelClass?.toLowerCase() as SearchState["cabinClass"] || "economy",
      };

      sid = await createSearchSession(searchStateForSession, flights, "amadeus");
      logger.info("SESSION_CREATED", { sid: sid.slice(0, 8) });
    } catch (sessionError) {
      // Session creation failure should not break the response
      logger.error("SESSION_STORE_FAILED", {
        message: sessionError instanceof Error ? sessionError.message : "Unknown error",
      });
    }

    // Record prices for price history (async, best-effort)
    // This enables honest price insights based on real data
    if (flights.length > 0) {
      const prices = flights.map((f) => f.price);
      recordSearchPrices(
        params.originLocationCode,
        params.destinationLocationCode,
        params.departureDate,
        prices
      ).catch((err) => {
        logger.error("PRICE_HISTORY_RECORD_FAILED", {
          message: err instanceof Error ? err.message : "Unknown error",
        });
      });
    }

    // Enrich flights with price insights (based on historical data)
    // This is best-effort - if no history, insight will be null
    let flightsWithInsights = flights;
    try {
      const insights = await getPriceInsightsForFlights(
        params.originLocationCode,
        params.destinationLocationCode,
        params.departureDate,
        flights.map((f) => f.price)
      );

      flightsWithInsights = flights.map((flight, index) => {
        const insight = insights[index];
        if (!insight) return flight;

        return {
          ...flight,
          priceInsight: {
            avgPrice: insight.historicalAverage,
            minPrice: insight.minRecorded,
            maxPrice: insight.maxRecorded,
            priceDifference: insight.priceDifference,
            percentageDifference: insight.percentageDifference,
            isBelowAverage: insight.isBelowAverage,
            isLowestRecorded: insight.isLowestRecorded,
            sampleCount: insight.sampleCount,
          },
        };
      });
    } catch (insightError) {
      // Insight enrichment failure should not break the response
      logger.warn("PRICE_INSIGHTS_FAILED", {
        message: insightError instanceof Error ? insightError.message : "Unknown error",
      });
    }

    // Include sid in response
    const responseWithSid: SearchResponse = {
      ...response,
      flights: flightsWithInsights,
      sid,
    };

    logger.info("FLIGHT_SEARCH_SUCCESS", {
      durationMs,
      flightCount: flightsWithInsights.length,
      skipped,
      hasSid: !!sid,
    });

    return NextResponse.json(responseWithSid, {
      headers: createResponseHeaders(requestId),
    });
  } catch (error) {
    const durationMs = Date.now() - startTime;

    // Handle AmadeusError
    if (error instanceof AmadeusError) {
      logger.error("AMADEUS_ERROR", {
        code: error.code,
        message: error.message,
        amadeusRequestId: error.requestId,
        durationMs,
      });

      const errorResponse: SearchError = {
        code: error.code,
        message: error.message,
        details: error.details as SearchError["details"],
        requestId: error.requestId,
      };
      return NextResponse.json(
        { ...errorResponse, _meta: { durationMs } },
        {
          status: 502,
          headers: createResponseHeaders(requestId),
        }
      );
    }

    // Handle unexpected errors
    logger.error("INTERNAL_ERROR", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      durationMs,
    });

    const errorResponse: SearchError = {
      code: "INTERNAL_ERROR",
      message: error instanceof Error ? error.message : "Unknown error",
      requestId,
    };
    return NextResponse.json(
      { ...errorResponse, _meta: { durationMs } },
      {
        status: 502,
        headers: createResponseHeaders(requestId),
      }
    );
  }
}

/**
 * OPTIONS /api/flights/search
 *
 * CORS preflight handler
 */
export async function OPTIONS() {
  const requestId = crypto.randomUUID();

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "X-Request-Id": requestId,
    },
  });
}
