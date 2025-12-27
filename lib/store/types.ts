/**
 * Store Interface
 *
 * Unified interface for persistent key-value storage.
 * Implementations:
 * - MemoryStore: In-memory storage for development
 * - KVStore: Vercel KV/Upstash Redis for production
 */

// ============================================================================
// Store Interface
// ============================================================================

/**
 * Store interface for key-value persistence
 *
 * All implementations should handle:
 * - TTL-based expiration
 * - JSON serialization/deserialization
 * - Graceful error handling
 */
export interface Store {
  /**
   * Get a value by key
   * @param key - Storage key
   * @returns Value if exists and not expired, null otherwise
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set a value with TTL
   * @param key - Storage key
   * @param value - Value to store (must be JSON-serializable)
   * @param ttlSec - Time to live in seconds
   */
  set<T>(key: string, value: T, ttlSec: number): Promise<void>;

  /**
   * Delete a key
   * @param key - Storage key
   */
  del(key: string): Promise<void>;

  /**
   * Check if a key exists (and is not expired)
   * @param key - Storage key
   */
  has(key: string): Promise<boolean>;
}

// ============================================================================
// Store Config
// ============================================================================

/**
 * Store configuration
 */
export interface StoreConfig {
  /** Store type */
  type: "memory" | "kv" | "redis";
  /** Optional prefix for all keys */
  prefix?: string;
  /** Default TTL in seconds */
  defaultTtlSec?: number;
}

// ============================================================================
// Constants
// ============================================================================

/** Default TTL for search sessions: 15 minutes */
export const SESSION_TTL_SEC = 15 * 60;

/** Default TTL for flight cache: 10 minutes */
export const FLIGHT_TTL_SEC = 10 * 60;

/** Default TTL for rate limit entries: 60 seconds */
export const RATE_LIMIT_TTL_SEC = 60;

// ============================================================================
// Key Builders
// ============================================================================

/**
 * Build a session key
 * @param sid - Session ID
 */
export function buildSessionKey(sid: string): string {
  return `session:${sid}`;
}

/**
 * Build a flight cache key
 * @param flightId - Flight ID
 */
export function buildFlightKey(flightId: string): string {
  return `flight:${flightId}`;
}

/**
 * Build a rate limit key
 * @param identifier - Hashed IP or other identifier
 */
export function buildRateLimitKey(identifier: string): string {
  return `ratelimit:${identifier}`;
}

