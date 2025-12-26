/**
 * Amadeus API Integration
 *
 * Re-exports for convenient imports
 * All modules are server-only
 */

// Auth
export { getAccessToken, clearTokenCache, hasValidToken } from "./auth";

// Config
export { getAmadeusConfig, isAmadeusConfigured, getAmadeusBaseUrl } from "./config";

// Client
export {
  amadeusFetch,
  amadeusRequest, // deprecated alias
  AmadeusError,
  type AmadeusApiError,
  type AmadeusFetchOptions,
} from "./client";

// Flights
export { searchFlightsAmadeus } from "./flights";

// Types
export type * from "./types";
