/**
 * Rate Limiting Module
 *
 * Provides rate limiting functionality for API endpoints.
 *
 * Implementation selection:
 * - Production with KV/Redis: Uses StoreRateLimiter (distributed)
 * - Development: Uses MemoryRateLimiter (in-process)
 */

import "server-only";
import type { RateLimiter, RateLimitResult, RateLimitConfig } from "./types";
import { getMemoryRateLimiter } from "./memoryRateLimiter";
import { getStoreRateLimiter } from "./storeRateLimiter";

// ============================================================================
// Re-exports
// ============================================================================

export type { RateLimiter, RateLimitResult, RateLimitConfig };
export { DEFAULT_RATE_LIMITS } from "./types";
export { getClientIp, hashIp, buildRateLimitKeyForSearch, buildRateLimitKeyForDetail } from "./ip";

// ============================================================================
// Environment Detection
// ============================================================================

/**
 * Check if a persistent store is configured
 */
function hasDistributedStore(): boolean {
  return !!(
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL
  );
}

// ============================================================================
// Rate Limiter Factory
// ============================================================================

/**
 * Get the configured rate limiter instance
 *
 * - In production with KV/Redis configured: Uses StoreRateLimiter
 * - In development or without store: Uses MemoryRateLimiter
 *
 * The StoreRateLimiter shares state across instances, providing
 * accurate rate limiting in serverless environments.
 *
 * @returns Configured RateLimiter instance
 */
export function getRateLimiter(): RateLimiter {
  // Use store-based rate limiter if a distributed store is configured
  if (process.env.NODE_ENV === "production" && hasDistributedStore()) {
    return getStoreRateLimiter();
  }

  // Fallback to in-memory rate limiter
  return getMemoryRateLimiter();
}

