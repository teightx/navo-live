/**
 * Runtime Configuration
 *
 * Server-only module that provides a single source of truth for
 * all runtime configuration. Handles environment detection and
 * BETA flags for production debugging.
 *
 * BETA FLAGS:
 * - BETA_USE_TEST_CONFIG_IN_PROD: Use test credentials in production (temporary)
 * - BETA_ALLOW_MOCKS_IN_PROD: Allow mocks in production (dangerous, use sparingly)
 */

import "server-only";
import { logWarn, logError } from "@/lib/logging/logger";

// ============================================================================
// Types
// ============================================================================

export type AppEnv = "production" | "preview" | "development";

export interface AmadeusCredentials {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
}

export interface RuntimeConfig {
  /** Application environment */
  appEnv: AppEnv;

  /** Amadeus API credentials */
  amadeus: AmadeusCredentials;

  /** Feature flags */
  flags: {
    /** Use Amadeus API (vs mocks) */
    useAmadeus: boolean;
    /** Use mock data */
    useMocks: boolean;
    /** BETA: Use test config in production */
    betaUseTestConfigInProd: boolean;
    /** BETA: Allow mocks in production */
    betaAllowMocksInProd: boolean;
  };

  /** Metadata about config resolution */
  _meta: {
    /** Whether test config was used */
    usingTestConfig: boolean;
    /** Whether mocks are allowed in prod */
    mocksAllowedInProd: boolean;
    /** Config resolved at */
    resolvedAt: string;
  };
}

interface EnvVarOptions {
  /** If true, throw error when var is missing */
  required?: boolean;
  /** If true, redact value in logs */
  redact?: boolean;
  /** Default value if not set */
  defaultValue?: string;
}

// ============================================================================
// Singleton State
// ============================================================================

let _cachedConfig: RuntimeConfig | null = null;
let _bootWarningsLogged = false;

// ============================================================================
// Env Var Helpers
// ============================================================================

/**
 * Resolve an environment variable with options
 */
export function resolveEnv(
  name: string,
  options: EnvVarOptions = {}
): string | undefined {
  const value = process.env[name];

  if (!value && options.required) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value || options.defaultValue;
}

/**
 * Derive application environment from Vercel or NODE_ENV
 */
function deriveAppEnv(): AppEnv {
  // Vercel sets VERCEL_ENV for preview/production
  const vercelEnv = process.env.VERCEL_ENV;

  if (vercelEnv === "production") return "production";
  if (vercelEnv === "preview") return "preview";
  if (vercelEnv === "development") return "development";

  // Fallback to NODE_ENV
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === "production") return "production";
  if (nodeEnv === "test") return "development";

  return "development";
}

/**
 * Parse boolean env var (case-insensitive "true" = true)
 */
function parseBoolEnv(name: string, defaultValue = false): boolean {
  const value = process.env[name];
  if (!value) return defaultValue;
  return value.toLowerCase() === "true";
}

// ============================================================================
// Credential Resolution
// ============================================================================

/**
 * Get Amadeus credentials, respecting BETA_USE_TEST_CONFIG_IN_PROD
 */
function resolveAmadeusCredentials(
  appEnv: AppEnv,
  useTestConfig: boolean
): { credentials: AmadeusCredentials; usingTestConfig: boolean } {
  // In production with BETA flag, try test credentials first
  if (appEnv === "production" && useTestConfig) {
    const testBaseUrl =
      process.env.TEST_AMADEUS_BASE_URL || process.env.AMADEUS_BASE_URL_TEST;
    const testClientId =
      process.env.TEST_AMADEUS_CLIENT_ID || process.env.AMADEUS_CLIENT_ID_TEST;
    const testClientSecret =
      process.env.TEST_AMADEUS_CLIENT_SECRET ||
      process.env.AMADEUS_CLIENT_SECRET_TEST;

    // All test vars must be present
    if (testBaseUrl && testClientId && testClientSecret) {
      return {
        credentials: {
          baseUrl: testBaseUrl,
          clientId: testClientId,
          clientSecret: testClientSecret,
        },
        usingTestConfig: true,
      };
    }

    // Test config requested but vars missing - fail explicitly
    throw new Error(
      "[CONFIG] BETA_USE_TEST_CONFIG_IN_PROD=true but test credentials are missing. " +
        "Required: TEST_AMADEUS_BASE_URL, TEST_AMADEUS_CLIENT_ID, TEST_AMADEUS_CLIENT_SECRET " +
        "(or AMADEUS_*_TEST variants)"
    );
  }

  // Normal flow: use standard credentials
  const baseUrl = process.env.AMADEUS_BASE_URL;
  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

  // In production, credentials are required
  if (appEnv === "production") {
    if (!baseUrl || !clientId || !clientSecret) {
      throw new Error(
        "[CONFIG] Missing Amadeus credentials in production. " +
          "Required: AMADEUS_BASE_URL, AMADEUS_CLIENT_ID, AMADEUS_CLIENT_SECRET"
      );
    }
  }

  return {
    credentials: {
      baseUrl: baseUrl || "https://test.api.amadeus.com",
      clientId: clientId || "",
      clientSecret: clientSecret || "",
    },
    usingTestConfig: false,
  };
}

// ============================================================================
// Main Config Function
// ============================================================================

/**
 * Get runtime configuration (singleton, cached after first call)
 *
 * This is the single source of truth for all runtime config.
 * Call this at app startup or in API routes.
 *
 * @throws Error if required config is missing
 */
export function getRuntimeConfig(): RuntimeConfig {
  // Return cached config if available
  if (_cachedConfig) {
    return _cachedConfig;
  }

  const appEnv = deriveAppEnv();

  // Parse BETA flags
  const betaUseTestConfigInProd = parseBoolEnv("BETA_USE_TEST_CONFIG_IN_PROD");
  const betaAllowMocksInProd = parseBoolEnv("BETA_ALLOW_MOCKS_IN_PROD");

  // Parse feature flags
  const useAmadeus = parseBoolEnv("USE_AMADEUS");
  const useMocks = parseBoolEnv("USE_MOCKS");

  // Resolve Amadeus credentials
  const { credentials, usingTestConfig } = resolveAmadeusCredentials(
    appEnv,
    betaUseTestConfigInProd
  );

  // Build config
  const config: RuntimeConfig = {
    appEnv,
    amadeus: credentials,
    flags: {
      useAmadeus,
      useMocks,
      betaUseTestConfigInProd,
      betaAllowMocksInProd,
    },
    _meta: {
      usingTestConfig,
      mocksAllowedInProd: appEnv === "production" && betaAllowMocksInProd,
      resolvedAt: new Date().toISOString(),
    },
  };

  // Log boot warnings (once)
  if (!_bootWarningsLogged) {
    _bootWarningsLogged = true;

    if (usingTestConfig) {
      logWarn("BETA_PROD_USING_TEST_CONFIG", {
        message:
          "Production is using TEST Amadeus credentials. This is a temporary BETA configuration.",
        appEnv,
        baseUrlHost: new URL(credentials.baseUrl).host,
      });
    }

    if (config._meta.mocksAllowedInProd) {
      logWarn("BETA_MOCKS_ALLOWED_IN_PROD", {
        message:
          "Mocks are allowed in production via BETA_ALLOW_MOCKS_IN_PROD. This should be temporary.",
        appEnv,
      });
    }
  }

  // Cache and return
  _cachedConfig = config;
  return config;
}

/**
 * Reset cached config (for testing)
 */
export function _resetConfigCache(): void {
  _cachedConfig = null;
  _bootWarningsLogged = false;
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Get Amadeus credentials from runtime config
 */
export function getAmadeusCredentials(): AmadeusCredentials {
  return getRuntimeConfig().amadeus;
}

/**
 * Check if using test config in production
 */
export function isUsingTestConfigInProd(): boolean {
  return getRuntimeConfig()._meta.usingTestConfig;
}

/**
 * Check if app is running in production
 */
export function isProduction(): boolean {
  return getRuntimeConfig().appEnv === "production";
}

/**
 * Check if mocks are allowed (respecting BETA flag)
 */
export function areMocksAllowed(): boolean {
  const config = getRuntimeConfig();

  // In production, only allow if BETA flag is set
  if (config.appEnv === "production") {
    return config.flags.betaAllowMocksInProd;
  }

  // In dev/preview, always allow
  return true;
}

// ============================================================================
// Validation at Boot
// ============================================================================

/**
 * Validate configuration at application boot
 * Call this early (e.g., in instrumentation.ts or layout.tsx)
 *
 * @throws Error if configuration is invalid
 */
export function validateConfigAtBoot(): void {
  try {
    getRuntimeConfig();
  } catch (error) {
    logError("CONFIG_VALIDATION_FAILED", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}

