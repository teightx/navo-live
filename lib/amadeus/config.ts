/**
 * Amadeus Configuration
 *
 * Centralized configuration from environment variables
 * Server-only module - do not import in client components
 *
 * Uses lib/config/runtime.ts as the source of truth for credentials.
 */

import "server-only";
import type { AmadeusConfig } from "./types";
import { getAmadeusCredentials, getRuntimeConfig } from "@/lib/config/runtime";

/**
 * Get Amadeus configuration from runtime config
 * Throws if required variables are not set
 */
export function getAmadeusConfig(): AmadeusConfig {
  const credentials = getAmadeusCredentials();

  if (!credentials.baseUrl || !credentials.clientId || !credentials.clientSecret) {
    throw new Error(
      "Missing Amadeus configuration. Required env vars: AMADEUS_BASE_URL, AMADEUS_CLIENT_ID, AMADEUS_CLIENT_SECRET"
    );
  }

  return {
    baseUrl: credentials.baseUrl,
    clientId: credentials.clientId,
    clientSecret: credentials.clientSecret,
  };
}

/**
 * Check if Amadeus is configured (all env vars present)
 */
export function isAmadeusConfigured(): boolean {
  try {
    const credentials = getAmadeusCredentials();
    return !!(
      credentials.baseUrl &&
      credentials.clientId &&
      credentials.clientSecret
    );
  } catch {
    return false;
  }
}

/**
 * Get base URL for Amadeus API
 */
export function getAmadeusBaseUrl(): string {
  const credentials = getAmadeusCredentials();
  if (!credentials.baseUrl) {
    throw new Error("AMADEUS_BASE_URL is not configured");
  }
  return credentials.baseUrl;
}

/**
 * Check if using test configuration in production
 */
export function isUsingTestConfig(): boolean {
  return getRuntimeConfig()._meta.usingTestConfig;
}
