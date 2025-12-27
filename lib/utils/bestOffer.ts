/**
 * Lógica para determinar a "melhor oferta" entre voos
 * 
 * REGRA DE DECISÃO (determinística):
 * 
 * A melhor oferta é calculada usando um score NORMALIZADO que combina:
 * 1. Preço normalizado (0-1) - peso: 55%
 * 2. Duração normalizada (0-1) - peso: 35%
 * 3. Penalidade de escalas (0-1) - peso: 10%
 * 
 * Fórmula:
 * score = priceNorm * 0.55 + durationNorm * 0.35 + stopsPenalty * 0.10
 * 
 * O voo com MENOR score é considerado a melhor oferta.
 * Em caso de empate, o voo com menor preço vence.
 * 
 * Normalização:
 * - priceNorm = (price - minPrice) / (maxPrice - minPrice)
 * - durationNorm = (duration - minDuration) / (maxDuration - minDuration)
 * - stopsPenalty = 0 (direto), 0.5 (1 escala), 1.0 (2+ escalas)
 */

import type { FlightResult } from "@/lib/mocks/flights";

// Pesos configuráveis para o algoritmo de best balance
export const SCORE_WEIGHTS = {
  price: 0.55,      // 55% peso para preço
  duration: 0.35,   // 35% peso para duração
  stops: 0.10,      // 10% peso para penalidade de escalas
} as const;

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
 * Calcula penalidade de escalas (0 = direto, 0.5 = 1 escala, 1 = 2+)
 */
export function getStopsPenalty(stops: string): number {
  const isDirect = stops === "direto" || stops === "direct";
  if (isDirect) return 0;
  
  const stopCount = parseInt(stops) || (stops.includes("1") ? 1 : 2);
  if (stopCount === 1) return 0.5;
  return 1;
}

/**
 * Calcula o score de um voo (menor = melhor)
 * VERSÃO LEGADA - mantida para compatibilidade
 * @deprecated Use calculateScoreNormalized para resultados mais precisos
 */
export function calculateScore(flight: FlightResult): number {
  const priceWeight = 0.6;
  const durationWeight = 40; // Multiplicador para minutos
  
  const durationMinutes = parseDurationToMinutes(flight.duration);
  const score = flight.price * priceWeight + durationMinutes * durationWeight;
  
  return score;
}

/**
 * Calcula o score NORMALIZADO de um voo (menor = melhor)
 * 
 * @param flight - O voo a ser avaliado
 * @param minPrice - Menor preço do conjunto
 * @param maxPrice - Maior preço do conjunto
 * @param minDuration - Menor duração do conjunto (em minutos)
 * @param maxDuration - Maior duração do conjunto (em minutos)
 * @returns Score entre 0 e 1 (menor = melhor)
 */
export function calculateScoreNormalized(
  flight: FlightResult,
  minPrice: number,
  maxPrice: number,
  minDuration: number,
  maxDuration: number
): number {
  // Normalizar preço (0-1)
  const priceRange = maxPrice - minPrice;
  const priceNorm = priceRange > 0 
    ? (flight.price - minPrice) / priceRange 
    : 0;
  
  // Normalizar duração (0-1)
  const durationMinutes = parseDurationToMinutes(flight.duration);
  const durationRange = maxDuration - minDuration;
  const durationNorm = durationRange > 0 
    ? (durationMinutes - minDuration) / durationRange 
    : 0;
  
  // Penalidade de escalas (0-1)
  const stopsPenalty = getStopsPenalty(flight.stops);
  
  // Score ponderado
  const score = 
    priceNorm * SCORE_WEIGHTS.price + 
    durationNorm * SCORE_WEIGHTS.duration + 
    stopsPenalty * SCORE_WEIGHTS.stops;
  
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

