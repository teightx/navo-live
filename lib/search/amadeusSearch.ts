/**
 * Amadeus Search Integration
 *
 * Unified search function with feature flag support
 * Handles fallback to mock in development mode
 * Server-only module - do not import in client components
 */

import "server-only";
import type { SearchState } from "@/lib/types/search";
import type { FlightResult } from "@/lib/mocks/flights";
import { mockSearch, type SearchResult } from "./mockSearch";
import { searchFlightsAmadeus, isAmadeusConfigured } from "@/lib/amadeus";

// ============================================================================
// Configuration
// ============================================================================

/**
 * Check if Amadeus is enabled via feature flag
 */
function isAmadeusEnabled(): boolean {
  return process.env.USE_AMADEUS === "true";
}

/**
 * Check if we should fallback to mock on errors
 * Only in development mode
 */
function shouldFallbackToMock(): boolean {
  return process.env.NODE_ENV === "development";
}

// ============================================================================
// Main Search Function
// ============================================================================

export interface SearchFlightsResult {
  flights: FlightResult[];
  source: "amadeus" | "mock";
  error?: string;
}

/**
 * Search for flights using Amadeus or mock depending on configuration
 *
 * Behavior:
 * - If USE_AMADEUS=false or not set: Uses mock
 * - If USE_AMADEUS=true but not configured: Uses mock with warning
 * - If USE_AMADEUS=true and configured: Uses Amadeus API
 * - In development: Falls back to mock on errors
 * - In production: Throws error (no fallback)
 *
 * @param searchState - Search parameters
 * @returns Search results with source indicator
 */
export async function searchFlights(searchState: SearchState): Promise<SearchFlightsResult> {
  // Check feature flag
  if (!isAmadeusEnabled()) {
    console.log("[Search] Using mock (USE_AMADEUS not enabled)");
    const result = await mockSearch(searchState);
    return {
      flights: result.flights,
      source: "mock",
    };
  }

  // Check if Amadeus is properly configured
  if (!isAmadeusConfigured()) {
    console.warn("[Search] Amadeus enabled but not configured, falling back to mock");
    const result = await mockSearch(searchState);
    return {
      flights: result.flights,
      source: "mock",
      error: "Amadeus not configured",
    };
  }

  // Validate required search fields
  if (!searchState.from || !searchState.to || !searchState.departDate) {
    console.warn("[Search] Invalid search state, using mock");
    const result = await mockSearch(searchState);
    return {
      flights: result.flights,
      source: "mock",
      error: "Invalid search parameters",
    };
  }

  // Try Amadeus API
  try {
    console.log("[Search] Using Amadeus API");
    const flights = await searchFlightsAmadeus(searchState);
    return {
      flights,
      source: "amadeus",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Search] Amadeus API error:", errorMessage);

    // In development, fallback to mock
    if (shouldFallbackToMock()) {
      console.warn("[Search] Development mode - falling back to mock");
      const result = await mockSearch(searchState);
      return {
        flights: result.flights,
        source: "mock",
        error: `Amadeus error: ${errorMessage}`,
      };
    }

    // In production, throw the error
    throw error;
  }
}

/**
 * Get search status for debugging/monitoring
 */
export function getSearchStatus(): {
  amadeusEnabled: boolean;
  amadeusConfigured: boolean;
  fallbackEnabled: boolean;
  environment: string;
} {
  return {
    amadeusEnabled: isAmadeusEnabled(),
    amadeusConfigured: isAmadeusConfigured(),
    fallbackEnabled: shouldFallbackToMock(),
    environment: process.env.NODE_ENV || "unknown",
  };
}

