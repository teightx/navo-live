/**
 * Feature Flags Configuration
 *
 * Server-only module for feature flag management.
 * Provides type-safe access to environment-based feature toggles.
 */

import "server-only";

// ============================================================================
// Feature Flag Functions
// ============================================================================

/**
 * Check if Amadeus integration is enabled
 * @returns true if USE_AMADEUS === "true"
 */
export function isAmadeusEnabled(): boolean {
  return process.env.USE_AMADEUS === "true";
}

/**
 * Check if mock data should be used
 * @returns true if USE_MOCKS === "true"
 */
export function isMocksEnabled(): boolean {
  return process.env.USE_MOCKS === "true";
}

/**
 * Production safety check for mock usage.
 * Throws an error if mocks are enabled in production environment.
 *
 * Call this at API route entry points to prevent accidental mock usage in prod.
 *
 * @throws Error if NODE_ENV === "production" and USE_MOCKS === "true"
 */
export function assertProdNoMocks(): void {
  if (process.env.NODE_ENV === "production" && isMocksEnabled()) {
    throw new Error(
      "[SECURITY] USE_MOCKS is enabled in production. " +
        "This is not allowed. Set USE_MOCKS=false or remove the variable."
    );
  }
}

// ============================================================================
// Initialization Check
// ============================================================================

// Perform check at module load time in production
if (process.env.NODE_ENV === "production" && process.env.USE_MOCKS === "true") {
  throw new Error(
    "[SECURITY] USE_MOCKS is enabled in production. " +
      "This is not allowed. Set USE_MOCKS=false or remove the variable."
  );
}

