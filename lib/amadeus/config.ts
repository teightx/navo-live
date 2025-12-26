/**
 * Amadeus Configuration
 *
 * Centralized configuration from environment variables
 * Server-only module - do not import in client components
 */

import "server-only";
import type { AmadeusConfig } from "./types";

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

/**
 * Get base URL for Amadeus API
 */
export function getAmadeusBaseUrl(): string {
  const baseUrl = process.env.AMADEUS_BASE_URL;
  if (!baseUrl) {
    throw new Error("AMADEUS_BASE_URL is not configured");
  }
  return baseUrl;
}

