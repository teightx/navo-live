/**
 * Airports Library
 *
 * Real airport data for autocomplete.
 * No external calls - uses versioned static JSON dataset.
 */

import airportsData from "@/lib/data/airports.json";
import type { Airport as SearchAirport } from "@/lib/search/types";

// ============================================================================
// Types
// ============================================================================

/**
 * Internal airport type with all fields from JSON
 */
interface AirportData {
  code: string;
  city: string;
  cityCode: string;
  country: string;
  name: string;
  keywords: string[];
}

// Re-export the canonical Airport type for convenience
export type { Airport } from "@/lib/search/types";

// Type alias for the full airport data
export type AirportFull = AirportData;

// ============================================================================
// Data
// ============================================================================

// Type-cast the imported JSON
const airportsDataTyped: AirportData[] = airportsData as AirportData[];

// Convert to the canonical Airport type (includes optional fields)
const airports: SearchAirport[] = airportsDataTyped.map((a) => ({
  code: a.code,
  city: a.city,
  country: a.country,
  name: a.name,
  cityCode: a.cityCode,
  keywords: a.keywords,
}));

// Build indexes for fast lookup
const airportByCode = new Map<string, SearchAirport>(
  airports.map((a) => [a.code.toUpperCase(), a])
);

const airportsByCityCode = new Map<string, SearchAirport[]>();
airports.forEach((a) => {
  if (a.cityCode) {
    const key = a.cityCode.toUpperCase();
    const list = airportsByCityCode.get(key) || [];
    list.push(a);
    airportsByCityCode.set(key, list);
  }
});

// ============================================================================
// Utilities
// ============================================================================

/**
 * Normalize string for search comparison
 * Removes accents, converts to lowercase, trims
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .trim();
}

/**
 * Check if a string matches the query
 */
function matches(text: string, normalizedQuery: string): boolean {
  const normalizedText = normalizeString(text);
  return normalizedText.includes(normalizedQuery);
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Search airports by query
 *
 * Searches by:
 * - IATA code (exact or partial)
 * - City code (returns all airports in that city)
 * - City name
 * - Airport name
 * - Keywords
 *
 * @param query Search query (min 2 characters)
 * @param limit Maximum results to return (default 8)
 * @returns Matching airports sorted by relevance
 */
export function searchAirports(query: string, limit: number = 8): SearchAirport[] {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const normalizedQuery = normalizeString(trimmed);
  const upperQuery = trimmed.toUpperCase();

  // First, check for exact city code match (e.g., "SAO" → GRU, CGH, VCP)
  const cityCodeMatches = airportsByCityCode.get(upperQuery);
  if (cityCodeMatches && cityCodeMatches.length > 0) {
    return cityCodeMatches.slice(0, limit);
  }

  // Score-based matching for relevance ranking
  const scored: Array<{ airport: SearchAirport; score: number }> = [];

  for (const airport of airports) {
    let score = 0;

    // Exact code match (highest priority)
    if (airport.code.toUpperCase() === upperQuery) {
      score = 100;
    }
    // Code starts with query
    else if (airport.code.toUpperCase().startsWith(upperQuery)) {
      score = 90;
    }
    // City code match
    else if (airport.cityCode?.toUpperCase() === upperQuery) {
      score = 85;
    }
    // City name starts with query
    else if (normalizeString(airport.city).startsWith(normalizedQuery)) {
      score = 80;
    }
    // City name contains query
    else if (matches(airport.city, normalizedQuery)) {
      score = 70;
    }
    // Airport name contains query
    else if (matches(airport.name, normalizedQuery)) {
      score = 60;
    }
    // Keywords match
    else if (airport.keywords?.some((kw) => normalizeString(kw).includes(normalizedQuery))) {
      score = 50;
    }
    // Code contains query (partial)
    else if (airport.code.toUpperCase().includes(upperQuery)) {
      score = 40;
    }

    if (score > 0) {
      scored.push({ airport, score });
    }
  }

  // Sort by score descending, then by city name
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.airport.city.localeCompare(b.airport.city);
  });

  return scored.slice(0, limit).map((s) => s.airport);
}

/**
 * Get airport by IATA code
 *
 * @param code IATA code (e.g., "GRU")
 * @returns Airport or null if not found
 */
export function getAirportByCode(code: string): SearchAirport | null {
  return airportByCode.get(code.toUpperCase()) || null;
}

/**
 * Get all airports for a city code
 *
 * @param cityCode City code (e.g., "SAO", "NYC", "LON")
 * @returns Array of airports in that city
 */
export function getAirportsByCityCode(cityCode: string): SearchAirport[] {
  return airportsByCityCode.get(cityCode.toUpperCase()) || [];
}

/**
 * Get all airports
 *
 * @returns All airports in the dataset
 */
export function getAllAirports(): SearchAirport[] {
  return [...airports];
}

/**
 * Format airport for display
 *
 * @param airport Airport object
 * @returns Formatted string (e.g., "são paulo (GRU)")
 */
export function formatAirport(airport: SearchAirport): string {
  return `${airport.city.toLowerCase()} (${airport.code.toUpperCase()})`;
}

/**
 * Get total airport count
 */
export function getAirportCount(): number {
  return airports.length;
}

