/**
 * Flight Cache
 *
 * Server-side in-memory cache for individual flight offers.
 * Used to resolve flights by ID on the detail page.
 */

import type { FlightResult } from "./types";

// ============================================================================
// Types
// ============================================================================

interface CacheEntry {
  flight: FlightResult;
  expiresAtMs: number;
  /** Search params used to find this flight (for re-fetch fallback) */
  searchContext?: {
    from: string;
    to: string;
    depart: string;
    return?: string;
    adults?: number;
    cabin?: string;
  };
}

// ============================================================================
// Constants
// ============================================================================

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes (longer than search cache)
const MAX_ENTRIES = 500; // Prevent memory leaks

// ============================================================================
// Cache Store
// ============================================================================

const flightCache = new Map<string, CacheEntry>();

/**
 * Clean up expired entries and enforce max size
 */
function cleanup(): void {
  const now = Date.now();
  const entries = Array.from(flightCache.entries());

  // Remove expired
  for (const [id, entry] of entries) {
    if (now > entry.expiresAtMs) {
      flightCache.delete(id);
    }
  }

  // Enforce max size (remove oldest if over limit)
  if (flightCache.size > MAX_ENTRIES) {
    const sorted = entries
      .filter(([, e]) => now <= e.expiresAtMs)
      .sort((a, b) => a[1].expiresAtMs - b[1].expiresAtMs);

    const toRemove = sorted.slice(0, sorted.length - MAX_ENTRIES);
    for (const [id] of toRemove) {
      flightCache.delete(id);
    }
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Store a flight in the cache
 */
export function cacheFlights(
  flights: FlightResult[],
  searchContext?: CacheEntry["searchContext"]
): void {
  const expiresAtMs = Date.now() + CACHE_TTL_MS;

  for (const flight of flights) {
    flightCache.set(flight.id, {
      flight,
      expiresAtMs,
      searchContext,
    });
  }

  // Periodic cleanup
  if (flightCache.size > MAX_ENTRIES * 0.8) {
    cleanup();
  }
}

/**
 * Get a flight by ID from cache
 */
export function getFlightFromCache(id: string): {
  flight: FlightResult;
  searchContext?: CacheEntry["searchContext"];
} | null {
  const entry = flightCache.get(id);

  if (!entry) return null;

  if (Date.now() > entry.expiresAtMs) {
    flightCache.delete(id);
    return null;
  }

  return {
    flight: entry.flight,
    searchContext: entry.searchContext,
  };
}

/**
 * Check if a flight exists in cache
 */
export function hasFlightInCache(id: string): boolean {
  const entry = flightCache.get(id);
  if (!entry) return false;

  if (Date.now() > entry.expiresAtMs) {
    flightCache.delete(id);
    return false;
  }

  return true;
}

/**
 * Get cache stats (for debugging)
 */
export function getFlightCacheStats(): {
  size: number;
  maxSize: number;
} {
  cleanup();
  return {
    size: flightCache.size,
    maxSize: MAX_ENTRIES,
  };
}

