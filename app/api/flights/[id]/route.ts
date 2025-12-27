/**
 * Flight Detail API Route
 *
 * GET /api/flights/[id]
 *
 * Returns a single flight offer by ID.
 *
 * Priority:
 * 1. Direct flight lookup in store (flight:{id})
 * 2. Session lookup with sid (session:{sid} -> flights)
 * 3. Legacy in-memory cache lookup
 * 4. Re-fetch from search (if params provided)
 * 5. 404 with FLIGHT_CONTEXT_MISSING
 */

import { NextRequest, NextResponse } from "next/server";
import { getFlightFromCache } from "@/lib/search/flightCache";
import type { FlightResult, SearchError } from "@/lib/search/types";
import { assertProdNoMocks } from "@/lib/config/flags";
import { createRequestLogger } from "@/lib/logging/logger";
import { getFlightById, getFlightFromSession } from "@/lib/search/session";

// ============================================================================
// Types
// ============================================================================

interface FlightDetailResponse {
  flight: FlightResult;
  source: "store" | "session" | "cache" | "refetch";
  searchContext?: {
    from: string;
    to: string;
    depart: string;
    return?: string;
  };
}

// ============================================================================
// Response Helpers
// ============================================================================

function createResponseHeaders(requestId: string): HeadersInit {
  return {
    "X-Request-Id": requestId,
  };
}

// ============================================================================
// Route Handler
// ============================================================================

/**
 * GET /api/flights/[id]
 *
 * Query params:
 * - sid: Session ID (primary lookup method)
 * - from, to, depart, return: Search context for re-fetch fallback
 *
 * Returns: FlightDetailResponse or error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID();
  const logger = createRequestLogger(requestId);
  const { id } = await params;

  // Production safety check
  try {
    assertProdNoMocks();
  } catch (error) {
    logger.error("PROD_MOCKS_ENABLED", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }

  logger.info("FLIGHT_DETAIL_START", {
    flightId: id,
  });

  if (!id) {
    logger.warn("INVALID_ID", {
      message: "Flight ID is required",
    });

    const error: SearchError = {
      code: "INVALID_ID",
      message: "Flight ID is required",
      requestId,
    };
    return NextResponse.json(error, {
      status: 400,
      headers: createResponseHeaders(requestId),
    });
  }

  const { searchParams } = new URL(request.url);
  const sid = searchParams.get("sid");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const depart = searchParams.get("depart");
  const returnDate = searchParams.get("return");

  // ============================================================================
  // Priority 1: Direct flight lookup in store
  // ============================================================================

  try {
    const storedFlight = await getFlightById(id);

    if (storedFlight) {
      logger.info("STORE_HIT", {
        flightId: id,
        source: "store",
      });

      const response: FlightDetailResponse = {
        flight: storedFlight,
        source: "store",
      };

      return NextResponse.json(response, {
        headers: createResponseHeaders(requestId),
      });
    }
  } catch (storeError) {
    logger.warn("STORE_LOOKUP_FAILED", {
      flightId: id,
      message: storeError instanceof Error ? storeError.message : "Unknown error",
    });
    // Continue to next lookup method
  }

  // ============================================================================
  // Priority 2: Session lookup with sid
  // ============================================================================

  if (sid) {
    try {
      const sessionFlight = await getFlightFromSession(sid, id);

      if (sessionFlight) {
        logger.info("SESSION_HIT", {
          flightId: id,
          sid: sid.slice(0, 8),
          source: "session",
        });

        const response: FlightDetailResponse = {
          flight: sessionFlight,
          source: "session",
        };

        return NextResponse.json(response, {
          headers: createResponseHeaders(requestId),
        });
      }

      logger.info("SESSION_MISS", {
        flightId: id,
        sid: sid.slice(0, 8),
      });
    } catch (sessionError) {
      logger.warn("SESSION_LOOKUP_FAILED", {
        flightId: id,
        sid: sid.slice(0, 8),
        message: sessionError instanceof Error ? sessionError.message : "Unknown error",
      });
      // Continue to next lookup method
    }
  }

  // ============================================================================
  // Priority 3: Legacy in-memory cache lookup
  // ============================================================================

  const cached = getFlightFromCache(id);

  if (cached) {
    logger.info("CACHE_HIT", {
      flightId: id,
      source: "cache",
    });

    const response: FlightDetailResponse = {
      flight: cached.flight,
      source: "cache",
      searchContext: cached.searchContext
        ? {
            from: cached.searchContext.from,
            to: cached.searchContext.to,
            depart: cached.searchContext.depart,
            return: cached.searchContext.return,
          }
        : undefined,
    };

    return NextResponse.json(response, {
      headers: createResponseHeaders(requestId),
    });
  }

  // ============================================================================
  // Priority 4: Re-fetch from search (if params provided)
  // ============================================================================

  if (from && to && depart) {
    logger.info("CACHE_MISS_REFETCH", {
      flightId: id,
      from,
      to,
      depart,
      returnDate,
    });

    try {
      // Build search URL
      const searchUrl = new URL("/api/flights/search", request.url);
      searchUrl.searchParams.set("from", from);
      searchUrl.searchParams.set("to", to);
      searchUrl.searchParams.set("depart", depart);
      if (returnDate) searchUrl.searchParams.set("return", returnDate);
      searchUrl.searchParams.set("max", "50"); // Get more results to find our ID

      // Fetch search results
      const searchResponse = await fetch(searchUrl.toString());

      if (searchResponse.ok) {
        const data = await searchResponse.json();
        const flights = data.flights as FlightResult[];

        // Find the flight by ID
        const found = flights.find((f) => f.id === id);

        if (found) {
          logger.info("REFETCH_SUCCESS", {
            flightId: id,
          });

          const response: FlightDetailResponse = {
            flight: found,
            source: "refetch",
            searchContext: {
              from,
              to,
              depart,
              return: returnDate || undefined,
            },
          };

          return NextResponse.json(response, {
            headers: createResponseHeaders(requestId),
          });
        }

        logger.warn("REFETCH_NOT_FOUND", {
          flightId: id,
          totalFlights: flights.length,
        });
      } else {
        logger.error("REFETCH_FAILED", {
          flightId: id,
          status: searchResponse.status,
        });
      }
    } catch (error) {
      logger.error("REFETCH_ERROR", {
        flightId: id,
        message: error instanceof Error ? error.message : "Unknown error",
      });
      // Fall through to 404
    }
  } else {
    logger.info("CACHE_MISS_NO_PARAMS", {
      flightId: id,
      hasSid: !!sid,
    });
  }

  // ============================================================================
  // Priority 5: 404 with FLIGHT_CONTEXT_MISSING
  // ============================================================================

  logger.warn("FLIGHT_NOT_FOUND", {
    flightId: id,
    hasSid: !!sid,
    hasSearchParams: !!(from && to && depart),
  });

  // Determine error code based on context
  const errorCode = sid || (from && to && depart) 
    ? "FLIGHT_NOT_FOUND" 
    : "FLIGHT_CONTEXT_MISSING";

  const errorMessage = errorCode === "FLIGHT_CONTEXT_MISSING"
    ? "Contexto da busca não encontrado. Por favor, volte para os resultados ou faça uma nova busca."
    : "Voo não encontrado ou oferta expirada. Por favor, faça uma nova busca.";

  const error: SearchError = {
    code: errorCode,
    message: errorMessage,
    requestId,
  };

  return NextResponse.json(error, {
    status: 404,
    headers: createResponseHeaders(requestId),
  });
}
