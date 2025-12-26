/**
 * Amadeus API Integration
 *
 * Re-exports for convenient imports
 * All modules are server-only
 */

export { getAccessToken, clearTokenCache, hasValidToken } from "./auth";
export { amadeusRequest, getAmadeusConfig, isAmadeusConfigured } from "./client";
export { searchFlightsAmadeus } from "./flights";
export type * from "./types";

