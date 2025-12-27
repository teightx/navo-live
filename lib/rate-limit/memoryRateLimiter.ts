/**
 * In-Memory Rate Limiter
 *
 * Simple fixed-window rate limiter using in-memory storage.
 *
 * ⚠️ LIMITATIONS:
 * - Not persistent (resets on server restart)
 * - Not distributed (doesn't work across multiple instances)
 * - Suitable for development and single-instance deployments only
 *
 * For production, use:
 * - Upstash Redis
 * - Vercel KV
 * - Other distributed solutions
 */

import "server-only";
import type { RateLimiter, RateLimitResult } from "./types";

// ============================================================================
// Types
// ============================================================================

interface BucketEntry {
  /** Number of requests in current window */
  count: number;
  /** Timestamp when window resets (ms since epoch) */
  resetAtMs: number;
}

// ============================================================================
// Implementation
// ============================================================================

/**
 * In-memory rate limiter with fixed-window algorithm
 */
export class MemoryRateLimiter implements RateLimiter {
  private buckets = new Map<string, BucketEntry>();

  /**
   * Check if a request is allowed and increment counter
   */
  async check(key: string, limit: number, windowSec: number): Promise<RateLimitResult> {
    const now = Date.now();
    const windowMs = windowSec * 1000;

    // Get or create bucket
    let bucket = this.buckets.get(key);

    // Reset bucket if window has passed
    if (!bucket || now > bucket.resetAtMs) {
      bucket = {
        count: 0,
        resetAtMs: now + windowMs,
      };
    }

    // Calculate remaining time
    const resetSec = Math.ceil((bucket.resetAtMs - now) / 1000);

    // Check if allowed
    const allowed = bucket.count < limit;

    if (allowed) {
      // Increment counter
      bucket.count += 1;
      this.buckets.set(key, bucket);
    }

    return {
      allowed,
      remaining: Math.max(0, limit - bucket.count),
      resetSec: Math.max(0, resetSec),
    };
  }

  /**
   * Clear all rate limit buckets (useful for testing)
   */
  clear(): void {
    this.buckets.clear();
  }

  /**
   * Get current bucket state for a key (useful for debugging)
   */
  getBucket(key: string): BucketEntry | undefined {
    return this.buckets.get(key);
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let instance: MemoryRateLimiter | null = null;

/**
 * Get the singleton memory rate limiter instance
 */
export function getMemoryRateLimiter(): MemoryRateLimiter {
  if (!instance) {
    instance = new MemoryRateLimiter();
  }
  return instance;
}

