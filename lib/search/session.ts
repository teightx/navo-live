/**
 * Search Session Module
 *
 * Server-only module for managing search sessions.
 * A session stores the search results for later retrieval on /voos/[id].
 *
 * This solves the problem of /voos/[id] failing after server restart,
 * as sessions are persisted in the shared store.
 */

import "server-only";

import { getStore, SESSION_TTL_SEC, FLIGHT_TTL_SEC, buildSessionKey, buildFlightKey } from "@/lib/store";
import type { SearchState, FlightResult } from "./types";

// ============================================================================
// Types
// ============================================================================

/**
 * Search Session
 *
 * Stores the complete context of a search for later retrieval.
 */
export interface SearchSession {
  /** Session ID (UUID) */
  sid: string;

  /** When the session was created (ISO 8601) */
  createdAt: string;

  /** When the session expires (ISO 8601) */
  expiresAt: string;

  /** Original search parameters */
  search: SearchSessionSearch;

  /** Flight results from the search */
  flights: FlightResult[];

  /** Data source */
  source: "amadeus" | "mock";
}

/**
 * Simplified search state for session storage
 * (only the fields needed for reference)
 */
export interface SearchSessionSearch {
  from: string;
  to: string;
  departDate: string;
  returnDate?: string;
  tripType: "oneway" | "roundtrip";
}

// ============================================================================
// Session ID Generation
// ============================================================================

/**
 * Generate a new session ID
 * Uses crypto.randomUUID for secure unique IDs
 */
export function generateSessionId(): string {
  return crypto.randomUUID();
}

// ============================================================================
// Session Management
// ============================================================================

/**
 * Create and persist a new search session
 *
 * @param searchState - Original search parameters
 * @param flights - Flight results
 * @param source - Data source (amadeus or mock)
 * @returns Session ID (sid)
 */
export async function createSearchSession(
  searchState: SearchState,
  flights: FlightResult[],
  source: "amadeus" | "mock"
): Promise<string> {
  const store = getStore();
  const sid = generateSessionId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_SEC * 1000);

  const session: SearchSession = {
    sid,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    search: {
      from: searchState.from?.code || "",
      to: searchState.to?.code || "",
      departDate: searchState.departDate || "",
      returnDate: searchState.returnDate || undefined,
      tripType: searchState.tripType,
    },
    flights,
    source,
  };

  // Store session
  await store.set(buildSessionKey(sid), session, SESSION_TTL_SEC);

  // Also store individual flights for direct lookup
  await persistFlights(flights);

  return sid;
}

/**
 * Get a search session by ID
 *
 * @param sid - Session ID
 * @returns Session or null if not found/expired
 */
export async function getSearchSession(sid: string): Promise<SearchSession | null> {
  if (!sid) return null;

  const store = getStore();
  const session = await store.get<SearchSession>(buildSessionKey(sid));

  if (!session) {
    return null;
  }

  // Verify not expired (defensive check, store should handle TTL)
  if (new Date(session.expiresAt) < new Date()) {
    await store.del(buildSessionKey(sid));
    return null;
  }

  return session;
}

/**
 * Get a flight from a session
 *
 * @param sid - Session ID
 * @param flightId - Flight ID to find
 * @returns Flight or null if not found
 */
export async function getFlightFromSession(
  sid: string,
  flightId: string
): Promise<FlightResult | null> {
  const session = await getSearchSession(sid);

  if (!session) {
    return null;
  }

  return session.flights.find((f) => f.id === flightId) || null;
}

// ============================================================================
// Flight Persistence
// ============================================================================

/**
 * Persist individual flights for direct lookup
 *
 * @param flights - Flights to persist
 */
export async function persistFlights(flights: FlightResult[]): Promise<void> {
  const store = getStore();

  await Promise.all(
    flights.map((flight) =>
      store.set(buildFlightKey(flight.id), flight, FLIGHT_TTL_SEC)
    )
  );
}

/**
 * Get a flight by ID from the store
 *
 * @param flightId - Flight ID
 * @returns Flight or null if not found
 */
export async function getFlightById(flightId: string): Promise<FlightResult | null> {
  if (!flightId) return null;

  const store = getStore();
  return store.get<FlightResult>(buildFlightKey(flightId));
}

// ============================================================================
// Session Utilities
// ============================================================================

/**
 * Check if a session exists
 *
 * @param sid - Session ID
 * @returns true if session exists and is not expired
 */
export async function hasSession(sid: string): Promise<boolean> {
  if (!sid) return false;

  const store = getStore();
  return store.has(buildSessionKey(sid));
}

/**
 * Delete a session
 *
 * @param sid - Session ID
 */
export async function deleteSession(sid: string): Promise<void> {
  if (!sid) return;

  const store = getStore();
  await store.del(buildSessionKey(sid));
}

