/**
 * Mock data para "Oportunidades agora"
 * Destinos com preços promocionais derivados dos mocks de voos
 */

export interface Opportunity {
  id: string;
  destination: {
    code: string;
    city: string;
    country: string;
  };
  origin: {
    code: string;
    city: string;
  };
  price: number;
  badge?: "below_average" | "lowest_recent";
  departureDate?: string; // Data sugerida de partida
}

/**
 * Oportunidades de voos com preços abaixo da média
 * Dados derivados dos mocks existentes
 */
export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp-1",
    destination: {
      code: "LIS",
      city: "lisboa",
      country: "portugal",
    },
    origin: {
      code: "GRU",
      city: "são paulo",
    },
    price: 2890,
    badge: "below_average",
    departureDate: "2025-12-15",
  },
  {
    id: "opp-2",
    destination: {
      code: "MAD",
      city: "madrid",
      country: "espanha",
    },
    origin: {
      code: "GRU",
      city: "são paulo",
    },
    price: 3010,
    badge: "lowest_recent",
    departureDate: "2025-12-20",
  },
  {
    id: "opp-3",
    destination: {
      code: "CDG",
      city: "paris",
      country: "frança",
    },
    origin: {
      code: "GRU",
      city: "são paulo",
    },
    price: 3320,
    badge: "below_average",
    departureDate: "2025-12-18",
  },
  {
    id: "opp-4",
    destination: {
      code: "REC",
      city: "recife",
      country: "brasil",
    },
    origin: {
      code: "GIG",
      city: "rio de janeiro",
    },
    price: 890,
    badge: "lowest_recent",
    departureDate: "2025-12-26",
  },
  {
    id: "opp-5",
    destination: {
      code: "LHR",
      city: "londres",
      country: "reino unido",
    },
    origin: {
      code: "GRU",
      city: "são paulo",
    },
    price: 2780,
    badge: "below_average",
    departureDate: "2025-12-22",
  },
  {
    id: "opp-6",
    destination: {
      code: "MIA",
      city: "miami",
      country: "estados unidos",
    },
    origin: {
      code: "GRU",
      city: "são paulo",
    },
    price: 2650,
    badge: "lowest_recent",
    departureDate: "2025-12-25",
  },
];

