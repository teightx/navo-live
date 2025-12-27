/**
 * Decision Labels - Sistema de selos para orientação de decisão
 * 
 * Cada voo recebe um selo primário:
 * - "best_balance" (Melhor equilíbrio): score ponderado 60% preço, 40% duração
 * - "cheapest" (Mais barato): menor preço absoluto
 * - "fastest" (Mais rápido): menor duração absoluta
 * 
 * Também calcula contexto de preço baseado em percentis:
 * - "below_average" (abaixo do normal): <= p35
 * - "average" (na média): entre p35 e p70
 * - "above_average" (caro agora): >= p70
 */

import type { FlightResult } from "@/lib/search/types";
import { parseDurationToMinutes, calculateScoreNormalized, getStopsPenalty } from "@/lib/utils/bestOffer";

// ============================================================================
// Types
// ============================================================================

export type FlightLabel = "best_balance" | "cheapest" | "fastest" | null;

export type PriceContext = "below_average" | "average" | "above_average";

export interface FlightWithLabels extends FlightResult {
  /** Selo primário do voo */
  label: FlightLabel;
  /** Contexto de preço baseado nos resultados atuais */
  priceContext: PriceContext;
  /** Se é o voo destacado (best_balance) */
  isHighlighted: boolean;
}

export interface DecisionLabelsResult {
  flights: FlightWithLabels[];
  stats: {
    /** Índice do voo "Melhor equilíbrio" */
    bestBalanceIndex: number;
    /** Índice do voo "Mais barato" */
    cheapestIndex: number;
    /** Índice do voo "Mais rápido" */
    fastestIndex: number;
    /** Mediana de preços */
    medianPrice: number;
    /** Percentil 35 */
    p35: number;
    /** Percentil 70 */
    p70: number;
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calcula percentil de um array ordenado
 */
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  
  if (upper >= sorted.length) return sorted[sorted.length - 1];
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Encontra o índice do voo mais barato
 */
function findCheapestIndex(flights: FlightResult[]): number {
  if (flights.length === 0) return -1;
  
  let cheapestIndex = 0;
  let cheapestPrice = flights[0].price;
  
  for (let i = 1; i < flights.length; i++) {
    if (flights[i].price < cheapestPrice) {
      cheapestIndex = i;
      cheapestPrice = flights[i].price;
    }
  }
  
  return cheapestIndex;
}

/**
 * Encontra o índice do voo mais rápido
 */
function findFastestIndex(flights: FlightResult[]): number {
  if (flights.length === 0) return -1;
  
  let fastestIndex = 0;
  let fastestDuration = parseDurationToMinutes(flights[0].duration);
  
  for (let i = 1; i < flights.length; i++) {
    const duration = parseDurationToMinutes(flights[i].duration);
    if (duration < fastestDuration) {
      fastestIndex = i;
      fastestDuration = duration;
    }
  }
  
  return fastestIndex;
}

/**
 * Encontra o índice do voo com melhor equilíbrio
 * Usa score normalizado: 55% preço, 35% duração, 10% escalas
 */
function findBestBalanceIndex(flights: FlightResult[]): number {
  if (flights.length === 0) return -1;
  
  // Calcular min/max para normalização
  const prices = flights.map(f => f.price);
  const durations = flights.map(f => parseDurationToMinutes(f.duration));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  
  let bestIndex = 0;
  let bestScore = calculateScoreNormalized(flights[0], minPrice, maxPrice, minDuration, maxDuration);
  
  for (let i = 1; i < flights.length; i++) {
    const score = calculateScoreNormalized(flights[i], minPrice, maxPrice, minDuration, maxDuration);
    // Menor score vence, em empate menor preço vence
    if (score < bestScore || (score === bestScore && flights[i].price < flights[bestIndex].price)) {
      bestIndex = i;
      bestScore = score;
    }
  }
  
  return bestIndex;
}

/**
 * Determina o contexto de preço de um voo
 */
function getPriceContext(price: number, p35: number, p70: number): PriceContext {
  if (price <= p35) return "below_average";
  if (price >= p70) return "above_average";
  return "average";
}

// ============================================================================
// Main Function
// ============================================================================

/**
 * Processa lista de voos e adiciona selos e contexto de preço
 */
export function addDecisionLabels(flights: FlightResult[]): DecisionLabelsResult {
  if (flights.length === 0) {
    return {
      flights: [],
      stats: {
        bestBalanceIndex: -1,
        cheapestIndex: -1,
        fastestIndex: -1,
        medianPrice: 0,
        p35: 0,
        p70: 0,
      },
    };
  }

  // Calcular índices especiais
  const cheapestIndex = findCheapestIndex(flights);
  const fastestIndex = findFastestIndex(flights);
  const bestBalanceIndex = findBestBalanceIndex(flights);

  // Calcular estatísticas de preço
  const sortedPrices = flights.map(f => f.price).sort((a, b) => a - b);
  const medianPrice = percentile(sortedPrices, 50);
  const p35 = percentile(sortedPrices, 35);
  const p70 = percentile(sortedPrices, 70);

  // Atribuir labels aos voos
  const flightsWithLabels: FlightWithLabels[] = flights.map((flight, index) => {
    // Determinar selo primário (prioridade: best_balance > cheapest > fastest)
    let label: FlightLabel = null;
    
    // Cada voo só recebe UM selo
    if (index === bestBalanceIndex) {
      label = "best_balance";
    } else if (index === cheapestIndex) {
      label = "cheapest";
    } else if (index === fastestIndex) {
      label = "fastest";
    }

    // Determinar contexto de preço
    const priceContext = getPriceContext(flight.price, p35, p70);

    return {
      ...flight,
      label,
      priceContext,
      isHighlighted: index === bestBalanceIndex,
    };
  });

  return {
    flights: flightsWithLabels,
    stats: {
      bestBalanceIndex,
      cheapestIndex,
      fastestIndex,
      medianPrice,
      p35,
      p70,
    },
  };
}

// ============================================================================
// Human Messages - Mensagens rotativas para o topo dos resultados
// ============================================================================

const HUMAN_MESSAGES_PT = [
  "achamos {count} voos. agora vem a parte divertida: escolher sem se arrepender.",
  "tem opção pra todo gosto e bolso. já marquei o 'bom senso' pra você.",
  "resultado saiu. se você quer economizar, começa pelo 'melhor equilíbrio'.",
  "a boa notícia: tem voo. a má notícia: você vai querer abrir 15 abas. relaxa, não precisa.",
  "você não está aqui pra sofrer comparando. destaquei os 3 que valem seu tempo.",
  "{count} opções encontradas. respira fundo e confia no processo.",
  "pronto. agora é só escolher. spoiler: o 'melhor equilíbrio' é um bom começo.",
];

const HUMAN_MESSAGES_EN = [
  "found {count} flights. now comes the fun part: choosing without regret.",
  "options for every taste and budget. already marked the 'best balance' for you.",
  "results are in. if you want to save, start with 'best balance'.",
  "good news: there are flights. bad news: you'll want to open 15 tabs. relax, you don't need to.",
  "you're not here to suffer comparing. highlighted the 3 worth your time.",
  "{count} options found. take a deep breath and trust the process.",
  "done. now just choose. spoiler: 'best balance' is a good start.",
];

/**
 * Retorna uma mensagem humana aleatória para o topo dos resultados
 */
export function getHumanMessage(count: number, locale: "pt" | "en" = "pt"): string {
  const messages = locale === "pt" ? HUMAN_MESSAGES_PT : HUMAN_MESSAGES_EN;
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex].replace("{count}", String(count));
}

/**
 * Retorna uma mensagem determinística baseada no count (para SSR consistente)
 */
export function getHumanMessageDeterministic(count: number, locale: "pt" | "en" = "pt"): string {
  const messages = locale === "pt" ? HUMAN_MESSAGES_PT : HUMAN_MESSAGES_EN;
  const index = count % messages.length;
  return messages[index].replace("{count}", String(count));
}

