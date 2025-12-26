/**
 * Amadeus API Client
 *
 * Base client for making authenticated requests to Amadeus API
 * Server-only module - do not import in client components
 */

import "server-only";
import type { AmadeusConfig, AmadeusErrorResponse } from "./types";
import { getAccessToken } from "./auth";

// ============================================================================
// Configuration
// ============================================================================

/**
 * Get Amadeus configuration from environment variables
 * Throws if required variables are not set
 */
export function getAmadeusConfig(): AmadeusConfig {
  const baseUrl = process.env.AMADEUS_BASE_URL;
  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

  if (!baseUrl || !clientId || !clientSecret) {
    throw new Error(
      "Missing Amadeus configuration. Required env vars: AMADEUS_BASE_URL, AMADEUS_CLIENT_ID, AMADEUS_CLIENT_SECRET"
    );
  }

  return {
    baseUrl,
    clientId,
    clientSecret,
  };
}

/**
 * Check if Amadeus is configured (all env vars present)
 */
export function isAmadeusConfigured(): boolean {
  return !!(
    process.env.AMADEUS_BASE_URL &&
    process.env.AMADEUS_CLIENT_ID &&
    process.env.AMADEUS_CLIENT_SECRET
  );
}

// ============================================================================
// HTTP Client
// ============================================================================

interface RequestOptions {
  method?: "GET" | "POST";
  params?: Record<string, string | number | boolean | undefined>;
  body?: Record<string, unknown>;
  retries?: number;
}

const DEFAULT_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Calculate exponential backoff delay
 */
function getRetryDelay(attempt: number): number {
  return RETRY_DELAY_MS * Math.pow(2, attempt);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable (rate limit or server error)
 */
function isRetryableError(status: number): boolean {
  // Rate limit (429) or server errors (5xx)
  return status === 429 || (status >= 500 && status < 600);
}

/**
 * Make an authenticated request to Amadeus API
 */
export async function amadeusRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", params, body, retries = DEFAULT_RETRIES } = options;
  const config = getAmadeusConfig();

  // Build URL with query params
  const url = new URL(`${config.baseUrl}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Get fresh token for each attempt (handles token expiration)
      const accessToken = await getAccessToken();

      const response = await fetch(url.toString(), {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      // Success
      if (response.ok) {
        return await response.json();
      }

      // Handle Amadeus errors
      const errorBody = await response.text();
      let errorData: AmadeusErrorResponse | null = null;

      try {
        errorData = JSON.parse(errorBody) as AmadeusErrorResponse;
      } catch {
        // Not JSON error response
      }

      const errorMessage =
        errorData?.errors?.[0]?.detail ||
        errorData?.errors?.[0]?.title ||
        `Amadeus API error: ${response.status}`;

      console.error("[Amadeus Client] Request failed:", {
        attempt: attempt + 1,
        status: response.status,
        endpoint,
        error: errorMessage,
      });

      // Check if we should retry
      if (isRetryableError(response.status) && attempt < retries) {
        const delay = getRetryDelay(attempt);
        console.log(`[Amadeus Client] Retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }

      // Non-retryable error or max retries exceeded
      throw new Error(errorMessage);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Network errors - retry if we have retries left
      if (attempt < retries) {
        const delay = getRetryDelay(attempt);
        console.log(`[Amadeus Client] Network error, retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }
    }
  }

  // All retries exhausted
  throw lastError || new Error("Amadeus request failed after all retries");
}

