"use client";

import { useMemo } from "react";
import type { FlightResult } from "@/lib/search/types";
import { formatPrice } from "@/lib/mocks/flights";
import { useI18n } from "@/lib/i18n";
import { parseDurationToMinutes, calculateScore } from "@/lib/utils/bestOffer";

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
      <path d="M8 2V14M4 5.5H12M4 10.5H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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
// Helper Functions
// ============================================================================

function findCheapest(flights: FlightResult[]): FlightResult | null {
  if (flights.length === 0) return null;
  return flights.reduce((min, f) => f.price < min.price ? f : min, flights[0]);
}

function findFastest(flights: FlightResult[]): FlightResult | null {
  if (flights.length === 0) return null;
  return flights.reduce((min, f) => {
    const durA = parseDurationToMinutes(f.duration);
    const durB = parseDurationToMinutes(min.duration);
    return durA < durB ? f : min;
  }, flights[0]);
}

function findBestBalance(flights: FlightResult[]): FlightResult | null {
  if (flights.length === 0) return null;
  return flights.reduce((best, f) => {
    const scoreA = calculateScore(f);
    const scoreB = calculateScore(best);
    return scoreA < scoreB ? f : best;
  }, flights[0]);
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

    const bestBalance = findBestBalance(flights);
    const cheapest = findCheapest(flights);
    const fastest = findFastest(flights);

    const cards: SummaryCard[] = [];

    if (bestBalance) {
      cards.push({
        type: "best_balance",
        flight: bestBalance,
        label: t.results.labelBestBalance,
        sublabel: locale === "pt" ? "preço + tempo" : "price + time",
      });
    }

    if (cheapest) {
      cards.push({
        type: "cheapest",
        flight: cheapest,
        label: t.results.labelCheapest,
        sublabel: locale === "pt" ? `a partir de ${formatPrice(cheapest.price)}` : `from ${formatPrice(cheapest.price)}`,
      });
    }

    if (fastest) {
      cards.push({
        type: "fastest",
        flight: fastest,
        label: t.results.labelFastest,
        sublabel: fastest.duration,
      });
    }

    return cards;
  }, [flights, t, locale]);

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
    <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
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
  );
}

// ============================================================================
// Sorting Logic
// ============================================================================

export function sortByDecisionType(flights: FlightResult[], type: DecisionType): FlightResult[] {
  return [...flights].sort((a, b) => {
    if (type === "cheapest") {
      return a.price - b.price;
    }
    if (type === "fastest") {
      const durA = parseDurationToMinutes(a.duration);
      const durB = parseDurationToMinutes(b.duration);
      return durA - durB;
    }
    // best_balance - combina preço e duração
    const scoreA = calculateScore(a);
    const scoreB = calculateScore(b);
    return scoreA - scoreB;
  });
}
