/**
 * Rate Limiting Types
 *
 * Shared types for rate limiting implementation.
 * Designed to be adapter-agnostic (memory, Redis, Vercel KV, etc.)
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Result of a rate limit check
 */
export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Number of requests remaining in current window */
  remaining: number;
  /** Seconds until the rate limit window resets */
  resetSec: number;
}

/**
 * Rate limiter interface
 *
 * Implementations can use different backends:
 * - Memory (dev/single instance)
 * - Upstash Redis (production, distributed)
 * - Vercel KV (production, Vercel-hosted)
 */
export interface RateLimiter {
  /**
   * Check if a request is allowed under the rate limit
   *
   * @param key - Unique identifier for the rate limit bucket (e.g., "search:hashedIp")
   * @param limit - Maximum number of requests allowed in the window
   * @param windowSec - Time window in seconds
   * @returns Rate limit result with allowed status and metadata
   */
  check(key: string, limit: number, windowSec: number): Promise<RateLimitResult>;
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Rate limit configuration for a specific endpoint
 */
export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSec: number;
}

/**
 * Default rate limit configurations by endpoint
 */
export const DEFAULT_RATE_LIMITS: Record<string, RateLimitConfig> = {
  /** Flight search endpoint - 10 requests per minute */
  search: {
    limit: 10,
    windowSec: 60,
  },
  /** Flight detail endpoint - 30 requests per minute */
  detail: {
    limit: 30,
    windowSec: 60,
  },
} as const;

