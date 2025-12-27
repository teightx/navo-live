/**
 * Feature Flags Configuration
 *
 * Server-only module for feature flag management.
 * Provides type-safe access to environment-based feature toggles.
 *
 * Uses lib/config/runtime.ts as the source of truth.
 */

import "server-only";
import { getRuntimeConfig, areMocksAllowed } from "./runtime";
import { logWarn } from "@/lib/logging/logger";

// ============================================================================
// Feature Flag Functions
// ============================================================================

/**
 * Check if Amadeus integration is enabled
 * @returns true if USE_AMADEUS === "true"
 */
export function isAmadeusEnabled(): boolean {
  return getRuntimeConfig().flags.useAmadeus;
}

/**
 * Check if mock data should be used
 * @returns true if USE_MOCKS === "true"
 */
export function isMocksEnabled(): boolean {
  return getRuntimeConfig().flags.useMocks;
}

/**
 * Production safety check for mock usage.
 * Throws an error if mocks are enabled in production environment,
 * UNLESS BETA_ALLOW_MOCKS_IN_PROD is explicitly set to true.
 *
 * Call this at API route entry points to prevent accidental mock usage in prod.
 *
 * @throws Error if mocks enabled in production without BETA override
 */
export function assertProdNoMocks(): void {
  const config = getRuntimeConfig();

  // Mocks not enabled - nothing to check
  if (!config.flags.useMocks) {
    return;
  }

  // Not production - mocks allowed
  if (config.appEnv !== "production") {
    return;
  }

  // Production with BETA override - allowed but warn
  if (config.flags.betaAllowMocksInProd) {
    logWarn("BETA_MOCKS_IN_PROD_USED", {
      message:
        "Mocks are being used in production. This is allowed via BETA_ALLOW_MOCKS_IN_PROD but should be temporary.",
    });
    return;
  }

  // Production without override - not allowed
  throw new Error(
    "[SECURITY] USE_MOCKS is enabled in production. " +
      "This is not allowed unless BETA_ALLOW_MOCKS_IN_PROD=true. " +
      "Set USE_MOCKS=false or remove the variable."
  );
}

// ============================================================================
// Re-exports from runtime
// ============================================================================

export { areMocksAllowed } from "./runtime";
