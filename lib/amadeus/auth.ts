/**
 * Amadeus OAuth2 Authentication
 *
 * Handles token acquisition and caching for Amadeus API
 * Server-only module - do not import in client components
 */

import "server-only";
import type { AmadeusToken, AmadeusTokenResponse } from "./types";
import { getAmadeusConfig } from "./client";

// In-memory token cache
let cachedToken: AmadeusToken | null = null;

// Buffer time (5 minutes) to refresh before actual expiration
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;

/**
 * Check if cached token is still valid
 */
function isTokenValid(): boolean {
  if (!cachedToken) return false;
  return Date.now() < cachedToken.expiresAt - TOKEN_REFRESH_BUFFER_MS;
}

/**
 * Fetch a new access token from Amadeus OAuth2 endpoint
 */
async function fetchNewToken(): Promise<AmadeusToken> {
  const config = getAmadeusConfig();

  const response = await fetch(`${config.baseUrl}/v1/security/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: config.clientId,
      client_secret: config.clientSecret,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Amadeus Auth] Token fetch failed:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });
    throw new Error(`Amadeus authentication failed: ${response.status}`);
  }

  const data: AmadeusTokenResponse = await response.json();

  const token: AmadeusToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  console.log("[Amadeus Auth] New token acquired, expires in", data.expires_in, "seconds");

  return token;
}

/**
 * Get a valid access token
 *
 * Returns cached token if still valid, otherwise fetches a new one
 * Thread-safe with simple locking mechanism
 */
let tokenFetchPromise: Promise<AmadeusToken> | null = null;

export async function getAccessToken(): Promise<string> {
  // Return cached token if valid
  if (isTokenValid() && cachedToken) {
    return cachedToken.accessToken;
  }

  // If already fetching, wait for that promise
  if (tokenFetchPromise) {
    const token = await tokenFetchPromise;
    return token.accessToken;
  }

  // Start new token fetch
  try {
    tokenFetchPromise = fetchNewToken();
    cachedToken = await tokenFetchPromise;
    return cachedToken.accessToken;
  } finally {
    tokenFetchPromise = null;
  }
}

/**
 * Clear cached token (useful for testing or forced refresh)
 */
export function clearTokenCache(): void {
  cachedToken = null;
  tokenFetchPromise = null;
  console.log("[Amadeus Auth] Token cache cleared");
}

/**
 * Check if we have a valid cached token (for health checks)
 */
export function hasValidToken(): boolean {
  return isTokenValid();
}

