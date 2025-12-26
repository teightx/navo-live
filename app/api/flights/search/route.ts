/**
 * Flight Search API Route
 *
 * POST /api/flights/search
 *
 * Searches for flights using Amadeus API or mock depending on configuration
 * Returns flight results in standardized format
 */

import { NextRequest, NextResponse } from "next/server";
import { searchFlights } from "@/lib/search/amadeusSearch";
import type { SearchState, CabinClass, TripType } from "@/lib/types/search";

// ============================================================================
// Validation
// ============================================================================

interface SearchRequestBody {
  tripType?: TripType;
  from?: {
    code: string;
    city: string;
    country: string;
    name: string;
  };
  to?: {
    code: string;
    city: string;
    country: string;
    name: string;
  };
  departDate?: string;
  returnDate?: string;
  pax?: {
    adults?: number;
    children?: number;
    infants?: number;
  };
  cabinClass?: CabinClass;
}

function validateSearchRequest(body: SearchRequestBody): {
  valid: boolean;
  error?: string;
  searchState?: SearchState;
} {
  // Required fields
  if (!body.from?.code) {
    return { valid: false, error: "Origin airport (from) is required" };
  }

  if (!body.to?.code) {
    return { valid: false, error: "Destination airport (to) is required" };
  }

  if (!body.departDate) {
    return { valid: false, error: "Departure date is required" };
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(body.departDate)) {
    return { valid: false, error: "Invalid departure date format (expected YYYY-MM-DD)" };
  }

  if (body.returnDate && !dateRegex.test(body.returnDate)) {
    return { valid: false, error: "Invalid return date format (expected YYYY-MM-DD)" };
  }

  // Validate pax
  const adults = body.pax?.adults ?? 1;
  if (adults < 1 || adults > 9) {
    return { valid: false, error: "Adults must be between 1 and 9" };
  }

  const children = body.pax?.children ?? 0;
  if (children < 0 || children > 9) {
    return { valid: false, error: "Children must be between 0 and 9" };
  }

  const infants = body.pax?.infants ?? 0;
  if (infants < 0 || infants > adults) {
    return { valid: false, error: "Infants cannot exceed number of adults" };
  }

  // Build valid SearchState
  const searchState: SearchState = {
    tripType: body.tripType ?? "roundtrip",
    from: {
      code: body.from.code,
      city: body.from.city || "",
      country: body.from.country || "",
      name: body.from.name || "",
    },
    to: {
      code: body.to.code,
      city: body.to.city || "",
      country: body.to.country || "",
      name: body.to.name || "",
    },
    departDate: body.departDate,
    returnDate: body.returnDate ?? null,
    pax: {
      adults,
      children,
      infants,
    },
    cabinClass: body.cabinClass ?? "economy",
  };

  return { valid: true, searchState };
}

// ============================================================================
// API Handlers
// ============================================================================

/**
 * POST /api/flights/search
 *
 * Request body: SearchState
 * Response: { flights: FlightResult[], source: string, meta: object }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: SearchRequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // Validate request
    const validation = validateSearchRequest(body);
    if (!validation.valid || !validation.searchState) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Perform search
    const startTime = Date.now();
    const result = await searchFlights(validation.searchState);
    const duration = Date.now() - startTime;

    // Return response
    return NextResponse.json({
      flights: result.flights,
      source: result.source,
      meta: {
        count: result.flights.length,
        durationMs: duration,
        ...(result.error && { warning: result.error }),
      },
    });
  } catch (error) {
    console.error("[API] Flight search error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Flight search failed",
        detail: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/flights/search
 *
 * Alternative endpoint with query parameters
 * Useful for simple searches and testing
 *
 * Query params:
 * - from: Origin IATA code (required)
 * - to: Destination IATA code (required)
 * - departDate: YYYY-MM-DD (required)
 * - returnDate: YYYY-MM-DD (optional)
 * - adults: Number (default: 1)
 * - children: Number (default: 0)
 * - infants: Number (default: 0)
 * - cabinClass: economy|premium_economy|business|first (default: economy)
 * - tripType: roundtrip|oneway (default: roundtrip)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Extract query params
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const departDate = searchParams.get("departDate");
  const returnDate = searchParams.get("returnDate");
  const adults = parseInt(searchParams.get("adults") || "1", 10);
  const children = parseInt(searchParams.get("children") || "0", 10);
  const infants = parseInt(searchParams.get("infants") || "0", 10);
  const cabinClass = (searchParams.get("cabinClass") || "economy") as CabinClass;
  const tripType = (searchParams.get("tripType") || "roundtrip") as TripType;

  // Build request body and delegate to POST handler logic
  const body: SearchRequestBody = {
    tripType,
    from: from ? { code: from, city: "", country: "", name: "" } : undefined,
    to: to ? { code: to, city: "", country: "", name: "" } : undefined,
    departDate: departDate || undefined,
    returnDate: returnDate || undefined,
    pax: { adults, children, infants },
    cabinClass,
  };

  // Validate
  const validation = validateSearchRequest(body);
  if (!validation.valid || !validation.searchState) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    );
  }

  try {
    // Perform search
    const startTime = Date.now();
    const result = await searchFlights(validation.searchState);
    const duration = Date.now() - startTime;

    return NextResponse.json({
      flights: result.flights,
      source: result.source,
      meta: {
        count: result.flights.length,
        durationMs: duration,
        ...(result.error && { warning: result.error }),
      },
    });
  } catch (error) {
    console.error("[API] Flight search error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Flight search failed",
        detail: errorMessage,
      },
      { status: 500 }
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
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

