/**
 * Structured Logging Utility
 *
 * Server-only module for structured JSON logging with:
 * - Request ID propagation
 * - Automatic redaction of sensitive fields
 * - Consistent log format
 */

import "server-only";

// ============================================================================
// Types
// ============================================================================

type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  event: string;
  requestId?: string;
  ts: string;
  [key: string]: unknown;
}

// ============================================================================
// Redaction Configuration
// ============================================================================

/**
 * Field names that should be redacted from logs (case-insensitive matching)
 */
const SENSITIVE_FIELDS = new Set([
  "token",
  "authorization",
  "secret",
  "password",
  "client_secret",
  "clientsecret",
  "access_token",
  "accesstoken",
  "refresh_token",
  "refreshtoken",
  "api_key",
  "apikey",
  "bearer",
  "credential",
  "credentials",
  "amadeus_client_secret",
]);

/**
 * Environment variables that should never be logged
 */
const REDACTED_ENV_VARS = new Set([
  "AMADEUS_CLIENT_SECRET",
  "AMADEUS_CLIENT_ID",
]);

const REDACTED_VALUE = "[REDACTED]";

// ============================================================================
// Redaction Logic
// ============================================================================

/**
 * Check if a field name should be redacted
 */
function isSensitiveField(fieldName: string): boolean {
  const normalized = fieldName.toLowerCase().replace(/[-_]/g, "");
  return SENSITIVE_FIELDS.has(normalized) || SENSITIVE_FIELDS.has(fieldName.toLowerCase());
}

/**
 * Deep clone and redact sensitive fields from an object
 */
function redactSensitiveData(data: unknown, depth = 0): unknown {
  // Prevent infinite recursion
  if (depth > 10) {
    return "[MAX_DEPTH_EXCEEDED]";
  }

  // Handle null/undefined
  if (data === null || data === undefined) {
    return data;
  }

  // Handle primitives
  if (typeof data !== "object") {
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item, depth + 1));
  }

  // Handle objects
  const result: Record<string, unknown> = {};
  const obj = data as Record<string, unknown>;

  for (const key of Object.keys(obj)) {
    if (isSensitiveField(key)) {
      result[key] = REDACTED_VALUE;
    } else {
      result[key] = redactSensitiveData(obj[key], depth + 1);
    }
  }

  return result;
}

/**
 * Redact any environment variable values that appear in strings
 */
function redactEnvVarsFromString(value: string): string {
  let result = value;

  for (const envVar of REDACTED_ENV_VARS) {
    const envValue = process.env[envVar];
    if (envValue && envValue.length > 4) {
      // Only redact non-trivial values
      result = result.replaceAll(envValue, REDACTED_VALUE);
    }
  }

  return result;
}

/**
 * Process data for logging with full redaction
 */
function processLogData(data: Record<string, unknown>): Record<string, unknown> {
  const redacted = redactSensitiveData(data) as Record<string, unknown>;

  // Additional pass to redact env var values from string fields
  const processStrings = (obj: Record<string, unknown>): Record<string, unknown> => {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        result[key] = redactEnvVarsFromString(value);
      } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        result[key] = processStrings(value as Record<string, unknown>);
      } else {
        result[key] = value;
      }
    }

    return result;
  };

  return processStrings(redacted);
}

// ============================================================================
// Core Logging Functions
// ============================================================================

/**
 * Create a log entry and output as JSON
 */
function log(level: LogLevel, event: string, data: Record<string, unknown>): void {
  const entry: LogEntry = {
    level,
    event,
    ts: new Date().toISOString(),
    ...processLogData(data),
  };

  const output = JSON.stringify(entry);

  switch (level) {
    case "error":
      console.error(output);
      break;
    case "warn":
      console.warn(output);
      break;
    default:
      console.log(output);
  }
}

/**
 * Log an info-level event
 */
export function logInfo(event: string, data: Record<string, unknown> = {}): void {
  log("info", event, data);
}

/**
 * Log a warning-level event
 */
export function logWarn(event: string, data: Record<string, unknown> = {}): void {
  log("warn", event, data);
}

/**
 * Log an error-level event
 */
export function logError(event: string, data: Record<string, unknown> = {}): void {
  log("error", event, data);
}

// ============================================================================
// Request-Scoped Logger Factory
// ============================================================================

export interface RequestLogger {
  info: (event: string, data?: Record<string, unknown>) => void;
  warn: (event: string, data?: Record<string, unknown>) => void;
  error: (event: string, data?: Record<string, unknown>) => void;
  requestId: string;
}

/**
 * Create a logger instance with a bound requestId
 */
export function createRequestLogger(requestId: string): RequestLogger {
  return {
    requestId,
    info: (event: string, data: Record<string, unknown> = {}) => {
      logInfo(event, { requestId, ...data });
    },
    warn: (event: string, data: Record<string, unknown> = {}) => {
      logWarn(event, { requestId, ...data });
    },
    error: (event: string, data: Record<string, unknown> = {}) => {
      logError(event, { requestId, ...data });
    },
  };
}

