/**
 * Store-Based Rate Limiter
 *
 * Rate limiter using the shared Store for persistence.
 * Works across multiple instances in serverless environments.
 *
 * Uses the same fixed-window algorithm as MemoryRateLimiter,
 * but persists state in the configured Store (Vercel KV, Upstash Redis, etc.)
 */

import "server-only";
import type { RateLimiter, RateLimitResult } from "./types";
import type { Store } from "@/lib/store/types";
import { getStore, RATE_LIMIT_TTL_SEC, buildRateLimitKey } from "@/lib/store";

// ============================================================================
// Types
// ============================================================================

interface RateLimitEntry {
  /** Number of requests in current window */
  count: number;
  /** Timestamp when window resets (ms since epoch) */
  resetAtMs: number;
}

// ============================================================================
// Implementation
// ============================================================================

/**
 * Store-based rate limiter with fixed-window algorithm
 */
export class StoreRateLimiter implements RateLimiter {
  private store: Store;

  constructor(store?: Store) {
    this.store = store || getStore();
  }

  /**
   * Check if a request is allowed and increment counter
   */
  async check(key: string, limit: number, windowSec: number): Promise<RateLimitResult> {
    const now = Date.now();
    const windowMs = windowSec * 1000;
    const storeKey = buildRateLimitKey(key);

    try {
      // Get current bucket
      let bucket = await this.store.get<RateLimitEntry>(storeKey);

      // Reset bucket if window has passed or doesn't exist
      if (!bucket || now > bucket.resetAtMs) {
        bucket = {
          count: 0,
          resetAtMs: now + windowMs,
        };
      }

      // Calculate remaining time
      const resetSec = Math.max(1, Math.ceil((bucket.resetAtMs - now) / 1000));

      // Check if allowed
      const allowed = bucket.count < limit;

      if (allowed) {
        // Increment counter and save
        bucket.count += 1;
        
        // TTL should be at least the window duration
        const ttl = Math.max(RATE_LIMIT_TTL_SEC, windowSec);
        await this.store.set(storeKey, bucket, ttl);
      }

      return {
        allowed,
        remaining: Math.max(0, limit - bucket.count),
        resetSec,
      };
    } catch (error) {
      // On store error, fail open (allow request) to avoid blocking users
      console.error("[StoreRateLimiter] Store error, failing open:", error);
      return {
        allowed: true,
        remaining: limit,
        resetSec: windowSec,
      };
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let instance: StoreRateLimiter | null = null;

/**
 * Get the singleton store rate limiter instance
 */
export function getStoreRateLimiter(): StoreRateLimiter {
  if (!instance) {
    instance = new StoreRateLimiter();
  }
  return instance;
}

