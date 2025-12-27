/**
 * Flight Search Client
 *
 * Client-side function to call /api/flights/search
 * Used by the results page to fetch real flight data
 *
 * MOCK POLICY:
 * - Production: NEVER use mocks, errors surface to UI
 * - Development: Use mocks ONLY if USE_MOCKS === "true" (via NEXT_PUBLIC_USE_MOCKS)
 * - 429 Rate Limited: ALWAYS surface error (never fallback to mock)
 */

import type {
  SearchState,
  SearchResponse,
  SearchError,
  FlightResult,
  TravelClass,
} from "./types";

// ============================================================================
// Types
// ============================================================================

export interface SearchFlightsOptions {
  /** Maximum results (1-50, default 20) */
  max?: number;
  /** Currency code (default BRL) */
  currency?: string;
  /** Non-stop flights only */
  nonStop?: boolean;
  /** Abort signal for cancellation */
  signal?: AbortSignal;
}

export interface SearchFlightsResult {
  /** Flight results */
  flights: FlightResult[];
  /** Data source */
  source: "amadeus" | "mock";
  /** Session ID for retrieving results later */
  sid?: string;
  /** Response metadata */
  meta: {
    count: number;
    durationMs: number;
    cached?: boolean;
    warning?: string;
  };
  /** Error info (if any) */
  error?: {
    code: string;
    message: string;
    /** Request ID for support/debugging */
    requestId?: string;
    /** Additional details */
    details?: {
      resetSec?: number;
      [key: string]: unknown;
    };
  };
}

// ============================================================================
// Environment Detection
// ============================================================================

/**
 * Check if running in production
 */
function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Check if mocks are enabled (via public env var)
 * Only valid in development
 */
function areMocksEnabled(): boolean {
  if (isProduction()) {
    return false; // Never enable mocks in production
  }
  return process.env.NEXT_PUBLIC_USE_MOCKS === "true";
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Map CabinClass to TravelClass
 */
function mapCabinToTravelClass(cabin: string): TravelClass | undefined {
  const mapping: Record<string, TravelClass> = {
    economy: "ECONOMY",
    premium_economy: "PREMIUM_ECONOMY",
    business: "BUSINESS",
    first: "FIRST",
  };
  return mapping[cabin];
}

/**
 * Build query string from search state
 */
function buildQueryString(
  searchState: SearchState,
  options: SearchFlightsOptions = {}
): string {
  const params = new URLSearchParams();

  // Required params
  if (searchState.from?.code) {
    params.set("from", searchState.from.code);
  }
  if (searchState.to?.code) {
    params.set("to", searchState.to.code);
  }
  if (searchState.departDate) {
    params.set("depart", searchState.departDate);
  }

  // Optional params
  if (searchState.returnDate && searchState.tripType === "roundtrip") {
    params.set("return", searchState.returnDate);
  }

  if (searchState.pax.adults > 1) {
    params.set("adults", String(searchState.pax.adults));
  }

  const travelClass = mapCabinToTravelClass(searchState.cabinClass);
  if (travelClass && travelClass !== "ECONOMY") {
    params.set("cabin", travelClass);
  }

  // Options
  if (options.max) {
    params.set("max", String(options.max));
  }

  if (options.currency && options.currency !== "BRL") {
    params.set("currency", options.currency);
  }

  if (options.nonStop) {
    params.set("nonStop", "true");
  }

  return params.toString();
}

/**
 * Extract request ID from response headers
 */
function extractRequestId(response: Response): string | undefined {
  return response.headers.get("X-Request-Id") ?? undefined;
}

// ============================================================================
// Main Function
// ============================================================================

/**
 * Search for flights using the API
 *
 * @param searchState - Search parameters from the form
 * @param options - Additional options
 * @returns Search results or error
 *
 * @example
 * const result = await searchFlights(searchState);
 * if (result.error) {
 *   console.error(result.error.message);
 * } else {
 *   console.log(`Found ${result.flights.length} flights`);
 * }
 */
export async function searchFlights(
  searchState: SearchState,
  options: SearchFlightsOptions = {}
): Promise<SearchFlightsResult> {
  // Validate required fields
  if (!searchState.from?.code || !searchState.to?.code || !searchState.departDate) {
    return {
      flights: [],
      source: "mock",
      meta: { count: 0, durationMs: 0 },
      error: {
        code: "INVALID_PARAMS",
        message: "Origem, destino e data de partida são obrigatórios",
      },
    };
  }

  const queryString = buildQueryString(searchState, options);
  const url = `/api/flights/search?${queryString}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: options.signal,
    });

    const requestId = extractRequestId(response);
    const data = await response.json();

    // Handle error responses
    if (!response.ok) {
      const errorData = data as SearchError;

      // ========================================================================
      // RATE LIMITED - Never fallback to mock
      // ========================================================================
      if (response.status === 429 || errorData.code === "RATE_LIMITED") {
        return {
          flights: [],
          source: "amadeus",
          meta: { count: 0, durationMs: 0 },
          error: {
            code: "RATE_LIMITED",
            message: errorData.message || "Muitas buscas em pouco tempo. Tente novamente.",
            requestId: requestId || errorData.requestId,
            details: errorData.details,
          },
        };
      }

      // ========================================================================
      // AMADEUS DISABLED - Mock only in dev with flag
      // ========================================================================
      if (errorData.code === "AMADEUS_DISABLED") {
        // In production or if mocks disabled: surface error
        if (isProduction() || !areMocksEnabled()) {
          return {
            flights: [],
            source: "amadeus",
            meta: { count: 0, durationMs: 0 },
            error: {
              code: "AMADEUS_DISABLED",
              message: "Busca de voos temporariamente indisponível. Tente novamente mais tarde.",
              requestId: requestId || errorData.requestId,
            },
          };
        }

        // Dev with mocks enabled: will be handled by calling code
        // Return error so caller can decide to use mock
        return {
          flights: [],
          source: "amadeus",
          meta: { count: 0, durationMs: 0 },
          error: {
            code: "AMADEUS_DISABLED",
            message: "Amadeus disabled, mocks available",
            requestId: requestId || errorData.requestId,
          },
        };
      }

      // ========================================================================
      // VALIDATION ERRORS
      // ========================================================================
      if (errorData.code === "VALIDATION_ERROR") {
        return {
          flights: [],
          source: "amadeus",
          meta: { count: 0, durationMs: 0 },
          error: {
            code: "VALIDATION_ERROR",
            message: errorData.message || "Parâmetros de busca inválidos",
            requestId: requestId || errorData.requestId,
          },
        };
      }

      // ========================================================================
      // OTHER API ERRORS (5xx, etc.)
      // ========================================================================
      // In production: always surface error
      // In dev with mocks: caller can decide to use mock
      return {
        flights: [],
        source: "amadeus",
        meta: { count: 0, durationMs: data._meta?.durationMs || 0 },
        error: {
          code: errorData.code || "API_ERROR",
          message: errorData.message || "Erro ao buscar voos",
          requestId: requestId || errorData.requestId,
        },
      };
    }

    // Success response
    const searchResponse = data as SearchResponse;

    return {
      flights: searchResponse.flights,
      source: searchResponse.source,
      sid: searchResponse.sid,
      meta: searchResponse.meta,
    };
  } catch (error) {
    // Handle network errors
    if (error instanceof Error) {
      // Abort error (user cancelled)
      if (error.name === "AbortError") {
        return {
          flights: [],
          source: "amadeus",
          meta: { count: 0, durationMs: 0 },
          error: {
            code: "ABORTED",
            message: "Busca cancelada",
          },
        };
      }

      // Network error - never use mock in production
      return {
        flights: [],
        source: "amadeus",
        meta: { count: 0, durationMs: 0 },
        error: {
          code: "NETWORK_ERROR",
          message: "Erro de conexão. Verifique sua internet.",
        },
      };
    }

    // Unknown error
    return {
      flights: [],
      source: "amadeus",
      meta: { count: 0, durationMs: 0 },
      error: {
        code: "UNKNOWN_ERROR",
        message: "Erro desconhecido ao buscar voos",
      },
    };
  }
}

/**
 * Check if Amadeus is available (quick health check)
 */
export async function checkAmadeusStatus(): Promise<boolean> {
  try {
    // Make a minimal request to check status
    const response = await fetch("/api/flights/search?from=GRU&to=LIS&depart=2025-12-01&max=1");
    return response.ok || response.status !== 503;
  } catch {
    return false;
  }
}

/**
 * Check if mocks should be used for fallback
 * Export for use in UI components
 */
export function shouldUseMockFallback(): boolean {
  return !isProduction() && areMocksEnabled();
}
