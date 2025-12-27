/**
 * Memory Store
 *
 * In-memory implementation of the Store interface.
 * Suitable for development and single-instance deployments.
 *
 * WARNING: Not suitable for serverless production environments
 * where instances don't share memory.
 */

import type { Store } from "./types";

// ============================================================================
// Types
// ============================================================================

interface CacheEntry<T> {
  value: T;
  expiresAtMs: number;
}

// ============================================================================
// Constants
// ============================================================================

const MAX_ENTRIES = 1000;
const CLEANUP_INTERVAL_MS = 60 * 1000; // 1 minute

// ============================================================================
// MemoryStore Class
// ============================================================================

/**
 * In-memory store with TTL support
 */
class MemoryStore implements Store {
  private store = new Map<string, CacheEntry<unknown>>();
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Start cleanup timer
    if (typeof setInterval !== "undefined") {
      this.cleanupTimer = setInterval(() => this.cleanup(), CLEANUP_INTERVAL_MS);
      // Ensure timer doesn't prevent process exit
      if (this.cleanupTimer.unref) {
        this.cleanupTimer.unref();
      }
    }
  }

  /**
   * Get a value by key
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    // Check expiration
    if (Date.now() > entry.expiresAtMs) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Set a value with TTL
   */
  async set<T>(key: string, value: T, ttlSec: number): Promise<void> {
    // Enforce max entries to prevent memory leaks
    if (this.store.size >= MAX_ENTRIES) {
      this.cleanup();

      // If still over limit, remove oldest entries
      if (this.store.size >= MAX_ENTRIES) {
        this.evictOldest(Math.floor(MAX_ENTRIES * 0.1));
      }
    }

    this.store.set(key, {
      value,
      expiresAtMs: Date.now() + ttlSec * 1000,
    });
  }

  /**
   * Delete a key
   */
  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  /**
   * Check if key exists and is not expired
   */
  async has(key: string): Promise<boolean> {
    const entry = this.store.get(key);

    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiresAtMs) {
      this.store.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAtMs) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Evict oldest entries by expiration time
   */
  private evictOldest(count: number): void {
    const entries = Array.from(this.store.entries())
      .sort((a, b) => a[1].expiresAtMs - b[1].expiresAtMs);

    for (let i = 0; i < Math.min(count, entries.length); i++) {
      this.store.delete(entries[i][0]);
    }
  }

  /**
   * Get store stats (for debugging)
   */
  getStats(): { size: number; maxSize: number } {
    return {
      size: this.store.size,
      maxSize: MAX_ENTRIES,
    };
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Dispose the store and cleanup timer
   */
  dispose(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.store.clear();
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

/**
 * Singleton instance of MemoryStore
 */
export const memoryStore = new MemoryStore();

/**
 * Factory function for creating new instances (for testing)
 */
export function createMemoryStore(): Store {
  return new MemoryStore();
}

