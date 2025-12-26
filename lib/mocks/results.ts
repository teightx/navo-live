export interface FlightResult {
  id: string;
  airline: string;
  airlineCode: string;
  departure: string;
  arrival: string;
  duration: string;
  stops: string;
  stopsCities?: string[];
  price: number;
  offersCount: number;
  co2?: string;
  nextDayArrival?: boolean;
}

const AIRLINE_CODES: Record<string, string> = {
  latam: "LA",
  tap: "TP",
  azul: "AD",
  iberia: "IB",
  "air france": "AF",
  gol: "G3",
  lufthansa: "LH",
};

export function generateResults(from: string, to: string): FlightResult[] {
  const baseResults: FlightResult[] = [
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

  const routeMultiplier = (from.length + to.length) % 3 === 0 ? 0.9 : 1.1;
  
  return baseResults.map((result) => ({
    ...result,
    price: Math.round(result.price * routeMultiplier),
  }));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function getFlightById(id: string): FlightResult | null {
  const allFlights = generateResults("GRU", "LIS");
  return allFlights.find((f) => f.id === id) || null;
}

export function getAllFlightIds(): string[] {
  return generateResults("GRU", "LIS").map((f) => f.id);
}
