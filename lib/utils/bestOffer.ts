/**
 * Lógica para determinar a "melhor oferta" entre voos
 * 
 * REGRA DE DECISÃO (determinística):
 * 
 * A melhor oferta é calculada usando um score que combina:
 * 1. Preço (peso: 60%)
 * 2. Duração em minutos (peso: 40%)
 * 
 * Fórmula:
 * score = (preço * 0.6) + (duração_em_minutos * 40)
 * 
 * O voo com MENOR score é considerado a melhor oferta.
 * 
 * Em caso de empate, o voo com menor preço vence.
 * 
 * Exemplo:
 * - Voo A: R$ 3000, 10h (600min) → score = 3000*0.6 + 600*40 = 1800 + 24000 = 25800
 * - Voo B: R$ 3200, 9h (540min) → score = 3200*0.6 + 540*40 = 1920 + 21600 = 23520
 * - Voo B vence (menor score)
 */

import type { FlightResult } from "@/lib/mocks/flights";

/**
 * Converte duração string (ex: "10h 45min") para minutos
 * Exportada para uso em outros lugares
 */
export function parseDurationToMinutes(duration: string): number {
  const hoursMatch = duration.match(/(\d+)h/);
  const minutesMatch = duration.match(/(\d+)min/);
  
  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
  
  return hours * 60 + minutes;
}

/**
 * Calcula o score de um voo (menor = melhor)
 * Exportada para uso em outros lugares
 */
export function calculateScore(flight: FlightResult): number {
  const priceWeight = 0.6;
  const durationWeight = 40; // Multiplicador para minutos
  
  const durationMinutes = parseDurationToMinutes(flight.duration);
  const score = flight.price * priceWeight + durationMinutes * durationWeight;
  
  return score;
}

/**
 * Encontra a melhor oferta em uma lista de voos
 * Retorna o índice do voo com menor score
 */
export function findBestOffer(flights: FlightResult[]): number {
  if (flights.length === 0) return -1;
  
  let bestIndex = 0;
  let bestScore = calculateScore(flights[0]);
  
  for (let i = 1; i < flights.length; i++) {
    const score = calculateScore(flights[i]);
    
    // Menor score vence
    // Em caso de empate, menor preço vence
    if (score < bestScore || (score === bestScore && flights[i].price < flights[bestIndex].price)) {
      bestIndex = i;
      bestScore = score;
    }
  }
  
  return bestIndex;
}

/**
 * Calcula a média de preços de uma lista de voos
 */
export function calculateAveragePrice(flights: FlightResult[]): number {
  if (flights.length === 0) return 0;
  
  const sum = flights.reduce((acc, flight) => acc + flight.price, 0);
  return Math.round(sum / flights.length);
}

/**
 * Calcula a diferença percentual entre um preço e a média
 */
export function calculatePriceDifference(price: number, averagePrice: number): {
  amount: number;
  percentage: number;
  isCheaper: boolean;
} {
  const difference = averagePrice - price;
  const percentage = averagePrice > 0 
    ? Math.round((difference / averagePrice) * 100)
    : 0;
  
  return {
    amount: Math.abs(difference),
    percentage: Math.abs(percentage),
    isCheaper: difference > 0,
  };
}

/**
 * Verifica se um voo é a melhor oferta e retorna informações explicativas
 */
export function getBestOfferInfo(
  flight: FlightResult,
  allFlights: FlightResult[],
  flightIndex: number
): {
  isBest: boolean;
  explanation: string | null;
  priceDifference: number | null;
} {
  const bestIndex = findBestOffer(allFlights);
  const isBest = bestIndex === flightIndex;
  
  if (!isBest) {
    return { isBest: false, explanation: null, priceDifference: null };
  }
  
  // Calcular diferença em relação à média
  const averagePrice = calculateAveragePrice(allFlights);
  const { amount, percentage } = calculatePriceDifference(flight.price, averagePrice);
  
  // Gerar explicação
  const explanation = `menor preço considerando duração`;
  const priceDifference = amount;
  
  return {
    isBest: true,
    explanation,
    priceDifference,
  };
}

