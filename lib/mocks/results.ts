export interface FlightResult {
  id: string;
  airline: string;
  departure: string;
  arrival: string;
  duration: string;
  stops: string;
  price: number;
}

export function generateResults(from: string, to: string): FlightResult[] {
  // Gera resultados mockados baseados na rota
  const baseResults: FlightResult[] = [
    {
      id: "1",
      airline: "latam",
      departure: "22:30",
      arrival: "11:15",
      duration: "10h45",
      stops: "direto",
      price: 3420,
    },
    {
      id: "2",
      airline: "tap",
      departure: "23:55",
      arrival: "12:30",
      duration: "10h35",
      stops: "direto",
      price: 3180,
    },
    {
      id: "3",
      airline: "azul",
      departure: "20:10",
      arrival: "14:50",
      duration: "13h40",
      stops: "1 escala",
      price: 2890,
    },
    {
      id: "4",
      airline: "iberia",
      departure: "21:45",
      arrival: "15:10",
      duration: "13h25",
      stops: "1 escala",
      price: 3010,
    },
    {
      id: "5",
      airline: "air france",
      departure: "19:30",
      arrival: "13:05",
      duration: "13h35",
      stops: "1 escala",
      price: 3320,
    },
    {
      id: "6",
      airline: "gol",
      departure: "06:15",
      arrival: "20:40",
      duration: "12h25",
      stops: "1 escala",
      price: 2650,
    },
    {
      id: "7",
      airline: "lufthansa",
      departure: "18:00",
      arrival: "10:45",
      duration: "14h45",
      stops: "2 escalas",
      price: 2780,
    },
  ];

  // Adiciona variação de preço baseado na rota
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

