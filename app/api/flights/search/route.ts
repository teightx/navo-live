/**
 * Flight Search API Route
 *
 * GET /api/flights/search
 *
 * Internal endpoint that calls Amadeus Flight Offers Search
 * Returns normalized SearchResponse format
 */

import { NextRequest, NextResponse } from "next/server";
import {
  amadeusFetch,
  AmadeusError,
  mapFlightOffersToSearchResponse,
  createSearchResponse,
  type AmadeusFlightOffersResponse,
} from "@/lib/amadeus";
import type { SearchResponse, SearchError } from "@/lib/search/types";

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
  const startTime = Date.now();

  // Check feature flag
  if (process.env.USE_AMADEUS !== "true") {
    const error: SearchError = {
      code: "AMADEUS_DISABLED",
      message: "Amadeus integration is disabled. Set USE_AMADEUS=true to enable.",
    };
    return NextResponse.json(error, { status: 503 });
  }

  // Parse and validate query params
  const { searchParams } = new URL(request.url);
  const validation = validateParams(searchParams);

  if (!validation.valid) {
    const error: SearchError = {
      code: "VALIDATION_ERROR",
      message: "Invalid request parameters",
      errors: validation.errors,
    };
    return NextResponse.json(error, { status: 400 });
  }

  const params = validation.params;

  // Check cache
  const cacheKey = getCacheKey(params);
  const cached = getFromCache(cacheKey);

  if (cached !== null) {
    const durationMs = Date.now() - startTime;

    // Return cached response with updated meta
    const response: SearchResponse = {
      ...cached,
      meta: {
        ...cached.meta,
        durationMs,
        cached: true,
      },
    };

    return NextResponse.json(response);
  }

  // Call Amadeus API
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

    // Cache the response
    setCache(cacheKey, response);

    return NextResponse.json(response);
  } catch (error) {
    const durationMs = Date.now() - startTime;

    // Handle AmadeusError
    if (error instanceof AmadeusError) {
      const errorResponse: SearchError = {
        code: error.code,
        message: error.message,
        details: error.details,
        requestId: error.requestId,
      };
      return NextResponse.json(
        { ...errorResponse, _meta: { durationMs } },
        { status: 502 }
      );
    }

    // Handle unexpected errors
    console.error("[API] Unexpected error:", error);

    const errorResponse: SearchError = {
      code: "INTERNAL_ERROR",
      message: error instanceof Error ? error.message : "Unknown error",
    };
    return NextResponse.json(
      { ...errorResponse, _meta: { durationMs } },
      { status: 502 }
    );
  }
}

/**
 * OPTIONS /api/flights/search
 *
 * CORS preflight handler
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
