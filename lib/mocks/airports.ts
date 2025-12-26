export interface Airport {
  code: string;
  city: string;
  country: string;
  name: string;
}

export const airports: Airport[] = [
  { code: "GRU", city: "são paulo", country: "brasil", name: "aeroporto internacional de guarulhos" },
  { code: "CGH", city: "são paulo", country: "brasil", name: "aeroporto de congonhas" },
  { code: "GIG", city: "rio de janeiro", country: "brasil", name: "aeroporto internacional do galeão" },
  { code: "SDU", city: "rio de janeiro", country: "brasil", name: "aeroporto santos dumont" },
  { code: "BSB", city: "brasília", country: "brasil", name: "aeroporto internacional de brasília" },
  { code: "CNF", city: "belo horizonte", country: "brasil", name: "aeroporto internacional de confins" },
  { code: "REC", city: "recife", country: "brasil", name: "aeroporto internacional do recife" },
  { code: "FOR", city: "fortaleza", country: "brasil", name: "aeroporto internacional de fortaleza" },
  { code: "SSA", city: "salvador", country: "brasil", name: "aeroporto internacional de salvador" },
  { code: "POA", city: "porto alegre", country: "brasil", name: "aeroporto salgado filho" },
  { code: "LIS", city: "lisboa", country: "portugal", name: "aeroporto humberto delgado" },
  { code: "OPO", city: "porto", country: "portugal", name: "aeroporto francisco sá carneiro" },
  { code: "MAD", city: "madrid", country: "espanha", name: "aeroporto adolfo suárez madrid-barajas" },
  { code: "BCN", city: "barcelona", country: "espanha", name: "aeroporto el prat" },
  { code: "CDG", city: "paris", country: "frança", name: "aeroporto charles de gaulle" },
  { code: "ORY", city: "paris", country: "frança", name: "aeroporto de orly" },
  { code: "LHR", city: "londres", country: "reino unido", name: "aeroporto de heathrow" },
  { code: "MIA", city: "miami", country: "eua", name: "miami international airport" },
  { code: "JFK", city: "nova york", country: "eua", name: "john f. kennedy international airport" },
  { code: "FCO", city: "roma", country: "itália", name: "aeroporto leonardo da vinci" },
];

export function searchAirports(query: string): Airport[] {
  if (!query || query.length < 2) return [];
  
  const q = query.toLowerCase();
  
  return airports.filter((airport) =>
    airport.city.includes(q) ||
    airport.code.toLowerCase().includes(q) ||
    airport.name.includes(q)
  ).slice(0, 6);
}

export function getAirportByCode(code: string): Airport | undefined {
  return airports.find((a) => a.code.toLowerCase() === code.toLowerCase());
}

export function formatAirport(airport: Airport): string {
  return `${airport.city} (${airport.code.toLowerCase()})`;
}

