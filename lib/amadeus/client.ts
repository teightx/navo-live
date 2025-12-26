/**
 * Amadeus API Client
 *
 * Robust HTTP wrapper for Amadeus API with retry, timeout, and error handling
 * Server-only module - do not import in client components
 */

import "server-only";
import { getAccessToken } from "./auth";
import { getAmadeusBaseUrl } from "./config";

// Re-export config functions for convenience
export { getAmadeusConfig, isAmadeusConfigured, getAmadeusBaseUrl } from "./config";

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2; // Total attempts = 3 (initial + 2 retries)
const RETRY_DELAYS_MS = [200, 500]; // Backoff delays

// ============================================================================
// Error Types
// ============================================================================

export interface AmadeusApiError {
  code: string;
  status: number;
  message: string;
  details?: unknown;
  requestId: string;
}

export class AmadeusError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;
  readonly requestId: string;

  constructor(error: AmadeusApiError) {
    super(error.message);
    this.name = "AmadeusError";
    this.code = error.code;
    this.status = error.status;
    this.details = error.details;
    this.requestId = error.requestId;

    // Maintains proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AmadeusError);
    }
  }

  toJSON(): AmadeusApiError {
    return {
      code: this.code,
      status: this.status,
      message: this.message,
      details: this.details,
      requestId: this.requestId,
    };
  }
}

// ============================================================================
// Types
// ============================================================================

export interface AmadeusFetchOptions {
  method?: "GET" | "POST";
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

interface AmadeusErrorResponseItem {
  code?: number;
  title?: string;
  detail?: string;
  status?: number;
  source?: {
    parameter?: string;
    pointer?: string;
  };
}

interface AmadeusErrorBody {
  errors?: AmadeusErrorResponseItem[];
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Generate unique request ID for tracing
 */
function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Build URL with encoded query parameters
 */
function buildUrl(
  baseUrl: string,
  path: string,
  query?: Record<string, string | number | boolean | undefined>
): string {
  const url = new URL(path, baseUrl);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

/**
 * Check if status code is retryable (429 rate limit or 5xx server error)
 */
function isRetryableStatus(status: number): boolean {
  return status === 429 || (status >= 500 && status < 600);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if running in development mode
 */
function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Parse Amadeus error response body
 */
function parseErrorBody(body: string): AmadeusErrorBody | null {
  try {
    return JSON.parse(body) as AmadeusErrorBody;
  } catch {
    return null;
  }
}

/**
 * Create AmadeusError from response
 */
function createErrorFromResponse(
  status: number,
  body: string,
  requestId: string,
  fallbackMessage: string
): AmadeusError {
  const parsed = parseErrorBody(body);
  const firstError = parsed?.errors?.[0];

  return new AmadeusError({
    code: firstError?.code ? String(firstError.code) : `HTTP_${status}`,
    status,
    message: firstError?.detail || firstError?.title || fallbackMessage,
    details: firstError?.source,
    requestId,
  });
}

/**
 * Create AmadeusError from network/timeout error
 */
function createNetworkError(
  error: unknown,
  requestId: string,
  isTimeout: boolean
): AmadeusError {
  if (isTimeout) {
    return new AmadeusError({
      code: "TIMEOUT",
      status: 408,
      message: "Request timeout",
      requestId,
    });
  }

  const message = error instanceof Error ? error.message : "Network error";

  return new AmadeusError({
    code: "NETWORK_ERROR",
    status: 0,
    message,
    requestId,
  });
}

/**
 * Log request (dev only)
 */
function logRequest(requestId: string, path: string, status: number, durationMs: number): void {
  if (isDev()) {
    console.log(`[Amadeus] ${requestId} | ${path} | ${status} | ${durationMs}ms`);
  }
}

// ============================================================================
// Main Function
// ============================================================================

/**
 * Make an authenticated request to Amadeus API
 *
 * Features:
 * - Automatic token management via getAmadeusAccessToken()
 * - Timeout handling with AbortController (default 10s)
 * - Retry logic: 2 retries (total 3 attempts) for 429 and 5xx errors
 * - Backoff delays: 200ms, 500ms
 * - Normalized error responses
 *
 * @param path - API endpoint path (e.g., "/v2/shopping/flight-offers")
 * @param options - Request options
 * @returns Typed API response
 * @throws AmadeusError on failure
 *
 * @example
 * // GET request with query params
 * const response = await amadeusFetch<FlightOffersResponse>("/v2/shopping/flight-offers", {
 *   query: {
 *     originLocationCode: "GRU",
 *     destinationLocationCode: "LIS",
 *     departureDate: "2025-03-15",
 *     adults: 1,
 *   },
 * });
 *
 * @example
 * // POST request with body
 * const response = await amadeusFetch<FlightPriceResponse>("/v1/shopping/flight-offers/pricing", {
 *   method: "POST",
 *   body: { data: { type: "flight-offer", flightOffers: [...] } },
 * });
 */
export async function amadeusFetch<T>(
  path: string,
  options: AmadeusFetchOptions = {}
): Promise<T> {
  const {
    method = "GET",
    query,
    body,
    headers: customHeaders,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;

  const requestId = generateRequestId();
  const baseUrl = getAmadeusBaseUrl();
  const url = buildUrl(baseUrl, path, query);

  let lastError: AmadeusError | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Get fresh token for each attempt (handles token expiration/refresh)
      const accessToken = await getAccessToken();

      const response = await fetch(url, {
        method,
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Request-Id": requestId,
          ...customHeaders,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      clearTimeout(timeoutId);
      const durationMs = Date.now() - startTime;
      logRequest(requestId, path, response.status, durationMs);

      // Success
      if (response.ok) {
        return (await response.json()) as T;
      }

      // Error response
      const errorBody = await response.text();
      const error = createErrorFromResponse(
        response.status,
        errorBody,
        requestId,
        `Amadeus API error: ${response.status}`
      );

      // Check if retryable
      if (isRetryableStatus(response.status) && attempt < MAX_RETRIES) {
        const delay = RETRY_DELAYS_MS[attempt] ?? 500;
        if (isDev()) {
          console.log(`[Amadeus] ${requestId} | Retry ${attempt + 1}/${MAX_RETRIES} in ${delay}ms`);
        }
        await sleep(delay);
        lastError = error;
        continue;
      }

      throw error;
    } catch (error) {
      clearTimeout(timeoutId);
      const durationMs = Date.now() - startTime;

      // If it's already an AmadeusError, handle retry or rethrow
      if (error instanceof AmadeusError) {
        if (isRetryableStatus(error.status) && attempt < MAX_RETRIES) {
          const delay = RETRY_DELAYS_MS[attempt] ?? 500;
          await sleep(delay);
          lastError = error;
          continue;
        }
        throw error;
      }

      // Network/timeout errors
      const isTimeout = error instanceof DOMException && error.name === "AbortError";
      const networkError = createNetworkError(error, requestId, isTimeout);

      logRequest(requestId, path, networkError.status, durationMs);

      // Retry network errors
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAYS_MS[attempt] ?? 500;
        if (isDev()) {
          console.log(`[Amadeus] ${requestId} | Network retry ${attempt + 1}/${MAX_RETRIES} in ${delay}ms`);
        }
        await sleep(delay);
        lastError = networkError;
        continue;
      }

      throw networkError;
    }
  }

  // All retries exhausted (shouldn't reach here, but TypeScript needs it)
  throw lastError ?? new AmadeusError({
    code: "UNKNOWN",
    status: 0,
    message: "Request failed after all retries",
    requestId,
  });
}

// ============================================================================
// Convenience Aliases
// ============================================================================

/**
 * Alias for amadeusFetch (backwards compatibility)
 * @deprecated Use amadeusFetch instead
 */
export const amadeusRequest = amadeusFetch;
