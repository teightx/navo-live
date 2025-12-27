/**
 * Flight Mocks
 *
 * Mock data for flight search results
 * Types are re-exported from the canonical source
 */

import type { SearchState, FlightResult } from "@/lib/search/types";

// Re-export FlightResult for backwards compatibility
export type { FlightResult } from "@/lib/search/types";

const AIRLINE_CODES: Record<string, string> = {
  latam: "LA",
  tap: "TP",
  azul: "AD",
  iberia: "IB",
  "air france": "AF",
  gol: "G3",
  lufthansa: "LH",
};

const BASE_FLIGHTS: FlightResult[] = [
  {
    id: "flight-1",
    airline: "latam",
    airlineCode: "LA",
    departure: "22:30",
    arrival: "11:15",
    duration: "10h 45min",
    stops: "direto",
    price: 3420,
    offersCount: 4,
    nextDayArrival: true,
  },
  {
    id: "flight-2",
    airline: "tap",
    airlineCode: "TP",
    departure: "23:55",
    arrival: "12:30",
    duration: "10h 35min",
    stops: "direto",
    price: 3180,
    offersCount: 3,
    nextDayArrival: true,
  },
  {
    id: "flight-3",
    airline: "azul",
    airlineCode: "AD",
    departure: "20:10",
    arrival: "14:50",
    duration: "13h 40min",
    stops: "1 escala",
    stopsCities: ["Lisboa"],
    price: 2890,
    offersCount: 5,
    co2: "-12% CO₂",
    nextDayArrival: true,
  },
  {
    id: "flight-4",
    airline: "iberia",
    airlineCode: "IB",
    departure: "21:45",
    arrival: "15:10",
    duration: "13h 25min",
    stops: "1 escala",
    stopsCities: ["Madrid"],
    price: 3010,
    offersCount: 2,
    nextDayArrival: true,
  },
  {
    id: "flight-5",
    airline: "air france",
    airlineCode: "AF",
    departure: "19:30",
    arrival: "13:05",
    duration: "13h 35min",
    stops: "1 escala",
    stopsCities: ["Paris"],
    price: 3320,
    offersCount: 3,
    nextDayArrival: true,
  },
  {
    id: "flight-6",
    airline: "gol",
    airlineCode: "G3",
    departure: "06:15",
    arrival: "20:40",
    duration: "12h 25min",
    stops: "1 escala",
    stopsCities: ["Miami"],
    price: 2650,
    offersCount: 6,
  },
  {
    id: "flight-7",
    airline: "lufthansa",
    airlineCode: "LH",
    departure: "18:00",
    arrival: "10:45",
    duration: "14h 45min",
    stops: "2 escalas",
    stopsCities: ["Frankfurt", "Munique"],
    price: 2780,
    offersCount: 2,
    co2: "+8% CO₂",
    nextDayArrival: true,
  },
];

/**
 * Get mock flights based on search state
 * This is the single source of truth for flight mocks in /resultados
 */
export function getMockFlights(searchState: SearchState): FlightResult[] {
  if (!searchState.from || !searchState.to) {
    return [];
  }

  // Calculate price multiplier based on route
  const fromCode = searchState.from.code;
  const toCode = searchState.to.code;
  const routeMultiplier = (fromCode.length + toCode.length) % 3 === 0 ? 0.9 : 1.1;

  return BASE_FLIGHTS.map((flight) => ({
    ...flight,
    price: Math.round(flight.price * routeMultiplier),
  }));
}

/**
 * Format price to BRL currency
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Get flight by ID (for detail pages)
 * Uses a default search state to generate flights
 */
export function getFlightById(id: string): FlightResult | null {
  const defaultSearchState: SearchState = {
    tripType: "roundtrip",
    from: { code: "GRU", city: "são paulo", country: "brasil", name: "aeroporto internacional de guarulhos" },
    to: { code: "LIS", city: "lisboa", country: "portugal", name: "aeroporto humberto delgado" },
    departDate: null,
    returnDate: null,
    pax: { adults: 1, children: 0, infants: 0 },
    cabinClass: "economy",
  };

  const allFlights = getMockFlights(defaultSearchState);
  return allFlights.find((f) => f.id === id) || null;
}

