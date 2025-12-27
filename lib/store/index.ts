/**
 * Store Module
 *
 * Provides a unified store interface for persistent key-value storage.
 * Automatically selects the appropriate implementation based on environment.
 *
 * Development: MemoryStore (in-process)
 * Production: Vercel KV / Upstash Redis (shared)
 */

import "server-only";

import type { Store } from "./types";
import { memoryStore } from "./memoryStore";

// ============================================================================
// Environment Detection
// ============================================================================

/**
 * Check if Vercel KV is configured
 */
function isVercelKVConfigured(): boolean {
  return !!(
    process.env.KV_REST_API_URL &&
    process.env.KV_REST_API_TOKEN
  );
}

/**
 * Check if Upstash Redis is configured
 */
function isUpstashConfigured(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

// ============================================================================
// Store Factory
// ============================================================================

/**
 * Cached store instance
 */
let storeInstance: Store | null = null;

/**
 * Get the appropriate store implementation
 *
 * Priority:
 * 1. Vercel KV (if configured)
 * 2. Upstash Redis (if configured)
 * 3. Memory Store (fallback)
 *
 * @returns Store instance
 */
export function getStore(): Store {
  if (storeInstance) {
    return storeInstance;
  }

  // Check for production KV stores
  if (process.env.NODE_ENV === "production") {
    if (isVercelKVConfigured()) {
      // TODO: Implement Vercel KV store
      // import { kv } from "@vercel/kv";
      // storeInstance = createKVStore(kv);
      // return storeInstance;
      console.warn(
        "[Store] Vercel KV configured but adapter not implemented. Using MemoryStore."
      );
    }

    if (isUpstashConfigured()) {
      // TODO: Implement Upstash Redis store
      // import { Redis } from "@upstash/redis";
      // const redis = new Redis({
      //   url: process.env.UPSTASH_REDIS_REST_URL!,
      //   token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      // });
      // storeInstance = createRedisStore(redis);
      // return storeInstance;
      console.warn(
        "[Store] Upstash Redis configured but adapter not implemented. Using MemoryStore."
      );
    }

    // Warn in production if no persistent store
    console.warn(
      "[Store] No persistent store configured in production. " +
        "Sessions will not survive restarts. " +
        "Configure KV_REST_API_URL/KV_REST_API_TOKEN for Vercel KV or " +
        "UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN for Upstash."
    );
  }

  // Default to memory store
  storeInstance = memoryStore;
  return storeInstance;
}

// ============================================================================
// Re-exports
// ============================================================================

export type { Store, StoreConfig } from "./types";
export {
  SESSION_TTL_SEC,
  FLIGHT_TTL_SEC,
  RATE_LIMIT_TTL_SEC,
  buildSessionKey,
  buildFlightKey,
  buildRateLimitKey,
} from "./types";

