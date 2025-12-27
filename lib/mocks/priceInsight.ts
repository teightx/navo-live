/**
 * @deprecated This mock file is deprecated.
 * Price insights are now based on real historical data.
 * Use lib/price/insight.ts instead.
 *
 * This file is kept for backwards compatibility with tests only.
 * DO NOT use in production code.
 */

import type { SearchState } from "@/lib/types/search";

export interface PriceInsight {
  route: { from: string; to: string };
  currentPrice: number;
  historicalAverage: number;
  lowest30Days: number;
  priceDifference: number;
  isLowestRecent: boolean;
}

/**
 * Calcula insight de preço baseado na rota e preço atual
 * Mock: usa variação percentual baseada no código da rota
 */
export function getPriceInsight(
  searchState: SearchState,
  currentPrice: number
): PriceInsight | null {
  if (!searchState.from || !searchState.to) return null;

  const fromCode = searchState.from.code;
  const toCode = searchState.to.code;

  // Mock: variação baseada em hash dos códigos
  const routeHash = (fromCode.length + toCode.length) % 10;
  const variationFactor = 0.85 + (routeHash * 0.03); // 0.85 a 1.12

  const historicalAverage = Math.round(currentPrice / variationFactor);
  const lowest30Days = Math.round(historicalAverage * 0.92); // 8% abaixo da média

  const priceDifference = historicalAverage - currentPrice;
  const isLowestRecent = currentPrice <= lowest30Days;

  return {
    route: { from: fromCode, to: toCode },
    currentPrice,
    historicalAverage,
    lowest30Days,
    priceDifference,
    isLowestRecent,
  };
}

