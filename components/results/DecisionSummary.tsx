"use client";

import { useMemo } from "react";
import type { FlightResult } from "@/lib/search/types";
import { formatPrice } from "@/lib/mocks/flights";
import { useI18n } from "@/lib/i18n";
import { parseDurationToMinutes, calculateScore } from "@/lib/utils/bestOffer";

// ============================================================================
// Types
// ============================================================================

interface DecisionSummaryProps {
  flights: FlightResult[];
  /** Callback quando um card é clicado */
  onCardClick?: (type: "best_balance" | "cheapest" | "fastest", flightId: string) => void;
  /** Card ativo (para highlight) */
  activeCard?: "best_balance" | "cheapest" | "fastest" | null;
}

interface SummaryCard {
  type: "best_balance" | "cheapest" | "fastest";
  flight: FlightResult;
  label: string;
  sublabel: string;
}

// ============================================================================
// Icons
// ============================================================================

function StarIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1L10 5.5L15 8L10 10.5L8 15L6 10.5L1 8L6 5.5L8 1Z" fill="currentColor"/>
    </svg>
  );
}

function CheapIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2V14M4 5.5H12M4 10.5H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function FastIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
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

export function DecisionSummary({ flights, onCardClick, activeCard }: DecisionSummaryProps) {
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

    if (cheapest && cheapest.id !== bestBalance?.id) {
      cards.push({
        type: "cheapest",
        flight: cheapest,
        label: t.results.labelCheapest,
        sublabel: locale === "pt" ? `a partir de ${formatPrice(cheapest.price)}` : `from ${formatPrice(cheapest.price)}`,
      });
    } else if (cheapest) {
      // Se o mais barato é o mesmo que melhor equilíbrio, ainda mostra
      cards.push({
        type: "cheapest",
        flight: cheapest,
        label: t.results.labelCheapest,
        sublabel: locale === "pt" ? `a partir de ${formatPrice(cheapest.price)}` : `from ${formatPrice(cheapest.price)}`,
      });
    }

    if (fastest && fastest.id !== bestBalance?.id && fastest.id !== cheapest?.id) {
      cards.push({
        type: "fastest",
        flight: fastest,
        label: t.results.labelFastest,
        sublabel: fastest.duration,
      });
    } else if (fastest) {
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
      icon: <StarIcon className="w-4 h-4" />,
      borderColor: "var(--blue)",
      bgActive: "rgba(79, 115, 134, 0.1)",
    },
    cheapest: {
      icon: <CheapIcon className="w-4 h-4" />,
      borderColor: "var(--sage)",
      bgActive: "rgba(107, 138, 90, 0.1)",
    },
    fastest: {
      icon: <FastIcon className="w-4 h-4" />,
      borderColor: "var(--accent)",
      bgActive: "rgba(224, 122, 63, 0.1)",
    },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      {summaryCards.map((card) => {
        const config = cardConfig[card.type];
        const isActive = activeCard === card.type;
        const isDirect = card.flight.stops === "direto" || card.flight.stops === "direct";

        return (
          <button
            key={card.type}
            onClick={() => onCardClick?.(card.type, card.flight.id)}
            className={`group text-left p-4 rounded-xl border transition-all duration-200 ${
              isActive 
                ? "shadow-md" 
                : "hover:shadow-md"
            }`}
            style={{
              background: isActive ? config.bgActive : "var(--card-bg)",
              borderColor: isActive ? config.borderColor : "var(--card-border)",
            }}
          >
            {/* Header com label */}
            <div className="flex items-center gap-2 mb-3">
              <span 
                className="flex items-center justify-center w-6 h-6 rounded-full"
                style={{ 
                  background: config.borderColor,
                  color: "var(--cream-soft)",
                }}
              >
                {config.icon}
              </span>
              <span className="text-sm font-medium text-ink">
                {card.label}
              </span>
            </div>

            {/* Preço */}
            <div className="text-xl font-bold text-ink mb-1">
              {formatPrice(card.flight.price)}
            </div>

            {/* Info */}
            <div className="text-xs text-ink-muted">
              {card.flight.duration} · {formatStops(card.flight.stops, locale)}
            </div>

            {/* Sublabel */}
            <div className="text-[10px] text-ink-muted mt-2 opacity-60">
              {card.sublabel}
            </div>
          </button>
        );
      })}
    </div>
  );
}

