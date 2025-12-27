/**
 * Flight Detail API Route
 *
 * GET /api/flights/[id]
 *
 * Returns a single flight offer by ID from cache.
 * Falls back to re-fetching from search if cache miss and search params provided.
 */

import { NextRequest, NextResponse } from "next/server";
import { getFlightFromCache } from "@/lib/search/flightCache";
import type { FlightResult, SearchError } from "@/lib/search/types";

// ============================================================================
// Types
// ============================================================================

interface FlightDetailResponse {
  flight: FlightResult;
  source: "cache" | "refetch";
  searchContext?: {
    from: string;
    to: string;
    depart: string;
    return?: string;
  };
}

// ============================================================================
// Route Handler
// ============================================================================

/**
 * GET /api/flights/[id]
 *
 * Query params (optional, for re-fetch fallback):
 * - from: IATA code
 * - to: IATA code
 * - depart: YYYY-MM-DD
 * - return: YYYY-MM-DD
 *
 * Returns: FlightDetailResponse or 404 error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    const error: SearchError = {
      code: "INVALID_ID",
      message: "Flight ID is required",
    };
    return NextResponse.json(error, { status: 400 });
  }

  // Try to get from cache first
  const cached = getFlightFromCache(id);

  if (cached) {
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

    return NextResponse.json(response);
  }

  // Cache miss - check if we can do a re-fetch
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const depart = searchParams.get("depart");
  const returnDate = searchParams.get("return");

  // If we have search params, try to re-fetch
  if (from && to && depart) {
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

          return NextResponse.json(response);
        }
      }
    } catch (error) {
      console.error("[API] Re-fetch error:", error);
      // Fall through to 404
    }
  }

  // Flight not found
  const error: SearchError = {
    code: "FLIGHT_NOT_FOUND",
    message: "Flight offer not found or expired. Please search again.",
  };

  return NextResponse.json(error, { status: 404 });
}

