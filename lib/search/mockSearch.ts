import { generateResults, type FlightResult } from "@/lib/mocks/results";

export interface SearchResult {
  flights: FlightResult[];
  error?: string;
}

/**
 * Mock search function with delay simulation
 * Supports forcing empty/error states via query params for testing
 */
export async function mockSearch(
  from: string,
  to: string,
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

  // Normal search
  const flights = generateResults(from, to);
  return { flights };
}

