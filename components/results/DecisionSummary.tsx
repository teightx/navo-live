"use client";

import { useMemo } from "react";
import type { FlightResult } from "@/lib/search/types";
import { formatPrice } from "@/lib/mocks/flights";
import { useI18n } from "@/lib/i18n";
import { parseDurationToMinutes, calculateScoreNormalized } from "@/lib/utils/bestOffer";

// ============================================================================
// Types
// ============================================================================

export type DecisionType = "best_balance" | "cheapest" | "fastest";

interface DecisionSummaryProps {
  flights: FlightResult[];
  /** Tipo ativo (aplica highlight) */
  activeType: DecisionType;
  /** Callback quando um card é clicado - aplica filtro/ordenação */
  onTypeChange: (type: DecisionType) => void;
}

interface SummaryCard {
  type: DecisionType;
  flight: FlightResult;
  label: string;
  sublabel: string;
}

// ============================================================================
// Icons
// ============================================================================

function StarIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 1L10 5.5L15 8L10 10.5L8 15L6 10.5L1 8L6 5.5L8 1Z" fill="currentColor"/>
    </svg>
  );
}

function CheapIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M12 5L6 11L4 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 3L8 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function FastIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M2 8H11M11 8L7 4M11 8L7 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ============================================================================
// Helper Functions - Encontrar voos DISTINTOS para cada categoria
// ============================================================================

/**
 * Encontra o voo mais barato
 */
function findCheapest(flights: FlightResult[]): FlightResult | null {
  if (flights.length === 0) return null;
  return flights.reduce((min, f) => f.price < min.price ? f : min, flights[0]);
}

/**
 * Encontra o voo mais rápido, preferencialmente diferente do excludeId
 */
function findFastest(flights: FlightResult[], excludeId?: string): FlightResult | null {
  if (flights.length === 0) return null;
  
  // Primeiro tenta encontrar o mais rápido que não é o excluído
  const eligibleFlights = excludeId 
    ? flights.filter(f => f.id !== excludeId)
    : flights;
  
  if (eligibleFlights.length === 0) {
    // Fallback: retorna o mais rápido de todos
    return flights.reduce((min, f) => {
      const durA = parseDurationToMinutes(f.duration);
      const durB = parseDurationToMinutes(min.duration);
      return durA < durB ? f : min;
    }, flights[0]);
  }
  
  return eligibleFlights.reduce((min, f) => {
    const durA = parseDurationToMinutes(f.duration);
    const durB = parseDurationToMinutes(min.duration);
    return durA < durB ? f : min;
  }, eligibleFlights[0]);
}

/**
 * Encontra o voo com melhor equilíbrio usando score normalizado
 * Preferencialmente diferente dos excludeIds
 */
function findBestBalance(flights: FlightResult[], excludeIds: string[] = []): FlightResult | null {
  if (flights.length === 0) return null;
  
  // Primeiro tenta encontrar o melhor que não está na lista de excluídos
  const eligibleFlights = excludeIds.length > 0
    ? flights.filter(f => !excludeIds.includes(f.id))
    : flights;
  
  const targetFlights = eligibleFlights.length > 0 ? eligibleFlights : flights;
  
  // Calcular min/max para normalização
  const prices = flights.map(f => f.price);
  const durations = flights.map(f => parseDurationToMinutes(f.duration));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  
  return targetFlights.reduce((best, f) => {
    const scoreA = calculateScoreNormalized(f, minPrice, maxPrice, minDuration, maxDuration);
    const scoreB = calculateScoreNormalized(best, minPrice, maxPrice, minDuration, maxDuration);
    // Menor score vence, em empate menor preço vence
    if (scoreA < scoreB) return f;
    if (scoreA === scoreB && f.price < best.price) return f;
    return best;
  }, targetFlights[0]);
}

function formatStops(stops: string, locale: string): string {
  if (stops === "direto" || stops === "direct") {
    return locale === "pt" ? "direto" : "direct";
  }
  return stops;
}

// ============================================================================
// Component
// ============================================================================

export function DecisionSummary({ flights, activeType, onTypeChange }: DecisionSummaryProps) {
  const { t, locale } = useI18n();

  const summaryCards = useMemo((): SummaryCard[] => {
    if (flights.length === 0) return [];

    // Estratégia: garantir 3 voos DISTINTOS quando possível
    // 1. Primeiro: encontra o mais barato (absoluto)
    // 2. Segundo: encontra o mais rápido que NÃO É o mais barato
    // 3. Terceiro: encontra o melhor equilíbrio que NÃO É nenhum dos anteriores
    
    const cheapest = findCheapest(flights);
    const fastest = findFastest(flights, cheapest?.id);
    const excludeForBalance = [cheapest?.id, fastest?.id].filter(Boolean) as string[];
    const bestBalance = findBestBalance(flights, excludeForBalance);

    const cards: SummaryCard[] = [];

    // Adiciona best_balance primeiro (é o default)
    if (bestBalance) {
      cards.push({
        type: "best_balance",
        flight: bestBalance,
        label: t.results.labelBestBalance,
        sublabel: locale === "pt" ? "preço + tempo" : "price + time",
      });
    }

    // Adiciona cheapest (pode ser igual ao bestBalance se há poucos voos)
    if (cheapest) {
      // Só mostra como card separado se for diferente do bestBalance
      const isDifferent = !bestBalance || cheapest.id !== bestBalance.id;
      if (isDifferent || flights.length < 3) {
        cards.push({
          type: "cheapest",
          flight: cheapest,
          label: t.results.labelCheapest,
          sublabel: locale === "pt" ? `a partir de ${formatPrice(cheapest.price)}` : `from ${formatPrice(cheapest.price)}`,
        });
      }
    }

    // Adiciona fastest
    if (fastest) {
      // Só mostra como card separado se for diferente dos anteriores
      const isDifferent = (!bestBalance || fastest.id !== bestBalance.id) && 
                          (!cheapest || fastest.id !== cheapest.id);
      if (isDifferent || flights.length < 3) {
        cards.push({
          type: "fastest",
          flight: fastest,
          label: t.results.labelFastest,
          sublabel: fastest.duration,
        });
      }
    }

    return cards;
  }, [flights, t, locale]);

  // Detectar quando mais barato == mais rápido
  const cheapestEqualsFastest = useMemo(() => {
    if (flights.length === 0) return false;
    const cheapest = findCheapest(flights);
    const fastest = findFastest(flights);
    return cheapest && fastest && cheapest.id === fastest.id;
  }, [flights]);

  // Mensagem de fallback quando há poucos voos
  const fewOptionsMessage = useMemo(() => {
    if (flights.length === 0) return null;
    if (flights.length < 3) {
      return locale === "pt" 
        ? "poucas opções para esta rota/datas" 
        : "few options for this route/dates";
    }
    return null;
  }, [flights.length, locale]);

  // Mensagem quando mais barato == mais rápido
  const sameOptionMessage = useMemo(() => {
    if (!cheapestEqualsFastest) return null;
    return locale === "pt"
      ? "nesta rota, o mais barato também é o mais rápido"
      : "on this route, the cheapest is also the fastest";
  }, [cheapestEqualsFastest, locale]);

  if (summaryCards.length === 0) return null;

  const cardConfig = {
    best_balance: {
      icon: <StarIcon />,
      activeColor: "var(--blue)",
      bgActive: "rgba(79, 115, 134, 0.12)",
    },
    cheapest: {
      icon: <CheapIcon />,
      activeColor: "var(--sage)",
      bgActive: "rgba(107, 138, 90, 0.12)",
    },
    fastest: {
      icon: <FastIcon />,
      activeColor: "var(--accent)",
      bgActive: "rgba(224, 122, 63, 0.12)",
    },
  };

  return (
    <div className="mb-4">
      {/* Mensagem de fallback quando há poucos voos */}
      {fewOptionsMessage && (
        <div 
          className="text-xs text-ink-muted text-center mb-3 py-2 px-3 rounded-lg"
          style={{ background: "var(--cream-dark)", opacity: 0.7 }}
        >
          {fewOptionsMessage}
        </div>
      )}

      {/* Mensagem quando mais barato == mais rápido */}
      {sameOptionMessage && !fewOptionsMessage && (
        <div 
          className="text-xs text-center mb-3 py-2 px-3 rounded-lg flex items-center justify-center gap-2"
          style={{ background: "rgba(107, 138, 90, 0.12)" }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-sage flex-shrink-0">
            <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-ink-muted">{sameOptionMessage}</span>
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {summaryCards.map((card) => {
        const config = cardConfig[card.type];
        const isActive = activeType === card.type;

        return (
          <button
            key={card.type}
            onClick={() => onTypeChange(card.type)}
            className={`group text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
              isActive ? "shadow-md" : "hover:shadow-sm border-transparent"
            }`}
            style={{
              background: isActive ? config.bgActive : "var(--card-bg)",
              borderColor: isActive ? config.activeColor : "transparent",
            }}
          >
            {/* Header com label e ícone */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
              <span 
                className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full transition-colors"
                style={{ 
                  background: isActive ? config.activeColor : "var(--cream-dark)",
                  color: isActive ? "var(--cream-soft)" : "var(--ink-muted)",
                }}
              >
                {config.icon}
              </span>
              <span className={`text-xs sm:text-sm font-medium ${isActive ? "text-ink" : "text-ink-muted"}`}>
                {card.label}
              </span>
            </div>

            {/* Preço */}
            <div className={`text-base sm:text-lg font-bold mb-0.5 ${isActive ? "text-ink" : "text-ink-muted"}`}>
              {formatPrice(card.flight.price)}
            </div>

            {/* Info */}
            <div className="text-[10px] sm:text-xs text-ink-muted">
              {card.flight.duration} · {formatStops(card.flight.stops, locale)}
            </div>
          </button>
        );
      })}
      </div>
    </div>
  );
}

// ============================================================================
// Sorting Logic
// ============================================================================

export function sortByDecisionType(flights: FlightResult[], type: DecisionType): FlightResult[] {
  if (flights.length === 0) return [];
  
  // Para best_balance, precisamos calcular min/max para normalização
  const prices = flights.map(f => f.price);
  const durations = flights.map(f => parseDurationToMinutes(f.duration));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  
  return [...flights].sort((a, b) => {
    if (type === "cheapest") {
      // Menor preço primeiro, desempate por duração
      if (a.price !== b.price) return a.price - b.price;
      return parseDurationToMinutes(a.duration) - parseDurationToMinutes(b.duration);
    }
    if (type === "fastest") {
      // Menor duração primeiro, desempate por preço
      const durA = parseDurationToMinutes(a.duration);
      const durB = parseDurationToMinutes(b.duration);
      if (durA !== durB) return durA - durB;
      return a.price - b.price;
    }
    // best_balance - usa score normalizado
    const scoreA = calculateScoreNormalized(a, minPrice, maxPrice, minDuration, maxDuration);
    const scoreB = calculateScoreNormalized(b, minPrice, maxPrice, minDuration, maxDuration);
    // Menor score primeiro, desempate por preço
    if (scoreA !== scoreB) return scoreA - scoreB;
    return a.price - b.price;
  });
}
