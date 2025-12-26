import { getMockFlights, type FlightResult } from "@/lib/mocks/flights";
import type { SearchState } from "@/lib/types/search";

export interface SearchResult {
  flights: FlightResult[];
  error?: string;
}

/**
 * Mock search function with delay simulation
 * Supports forcing empty/error states via query params for testing
 * 
 * Uses getMockFlights() as the single source of truth for flight mocks
 */
export async function mockSearch(
  searchState: SearchState,
  options?: {
    forceEmpty?: boolean;
    forceError?: boolean;
    delay?: number;
  }
): Promise<SearchResult> {
  const delay = options?.delay ?? Math.random() * 300 + 600; // 600-900ms

  await new Promise((resolve) => setTimeout(resolve, delay));

  // Force error for testing
  if (options?.forceError) {
    throw new Error("Erro ao buscar voos. Tente novamente.");
  }

  // Force empty for testing
  if (options?.forceEmpty) {
    return { flights: [] };
  }

  // Normal search - uses getMockFlights as single source of truth
  const flights = getMockFlights(searchState);
  return { flights };
}
