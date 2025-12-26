"use client";

import { FlightResult, formatPrice } from "@/lib/mocks/flights";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";
import { PriceInsightBadge } from "@/components/price/PriceInsightBadge";
import { getPriceInsight } from "@/lib/mocks/priceInsight";
import type { SearchState } from "@/lib/types/search";

interface FlightCardProps {
  flight: FlightResult;
  onClick: () => void;
  isBestOffer?: boolean;
  bestOfferInfo?: {
    explanation: string;
    priceDifference: number;
  } | null;
  searchState?: SearchState;
}

const AIRLINE_COLORS: Record<string, string> = {
  latam: "#E4002B",
  tap: "#00B2A9",
  azul: "#0033A0",
  iberia: "#D30032",
  "air france": "#002157",
  gol: "#FF6600",
  lufthansa: "#05164D",
};

function AirlineLogo({ airline, code }: { airline: string; code: string }) {
  const color = AIRLINE_COLORS[airline] || "#4f7386";
  
  return (
    <div 
      className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {code}
    </div>
  );
}

export function FlightCard({ flight, onClick, isBestOffer = false, bestOfferInfo = null, searchState }: FlightCardProps) {
  const { t, locale } = useI18n();
  const isDirect = flight.stops === "direto" || flight.stops === "direct";
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Calcular price insight se searchState estiver disponível
  const priceInsight = searchState ? getPriceInsight(searchState, flight.price) : null;
  
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-xl border backdrop-blur-sm hover:border-blue-soft hover:shadow-lg transition-all duration-200"
      style={{
        background: "var(--card-bg)",
        borderColor: "var(--card-border)",
      }}
    >
      {/* Header contextual */}
      {(flight.co2 || (isBestOffer && bestOfferInfo)) && (
        <div className="flex items-center justify-between rounded-t-xl">
          {flight.co2 && (
            <div className={`px-4 py-2 text-xs font-medium ${
              flight.co2.startsWith("-") 
                ? "bg-sage/10 text-sage" 
                : "bg-accent/10 text-accent"
            }`}>
              {flight.co2}
            </div>
          )}
          
          {/* Badge "melhor oferta" */}
          {isBestOffer && bestOfferInfo && (
            <div className="relative px-4 py-2 ml-auto">
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-help"
                style={{
                  background: "var(--blue)",
                  color: "var(--cream-soft)",
                }}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={(e) => e.stopPropagation()}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1L7.5 4.5L11 6L7.5 7.5L6 11L4.5 7.5L1 6L4.5 4.5L6 1Z" fill="currentColor"/>
                </svg>
                <span>{t.results.bestOffer}</span>
              </div>
              
              {/* Tooltip explicativo */}
              {showTooltip && (
                <div
                  className="absolute right-0 top-full mt-2 z-50 px-3 py-2 rounded-lg text-xs max-w-[200px] shadow-lg pointer-events-none"
                  style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                    color: "var(--ink)",
                  }}
                >
                  <div className="font-medium mb-1">{bestOfferInfo.explanation}</div>
                  {bestOfferInfo.priceDifference > 0 && (
                    <div className="text-ink-muted">
                      {t.results.cheaperThanAverage.replace("{amount}", formatPrice(bestOfferInfo.priceDifference))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Corpo principal */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          
          {/* Coluna 1: Companhia */}
          <div className="flex items-center gap-3 sm:w-32 sm:flex-shrink-0">
            <AirlineLogo airline={flight.airline} code={flight.airlineCode} />
            <div className="sm:hidden">
              <div className="text-sm font-medium text-ink capitalize">
                {flight.airline}
              </div>
              <div className="text-xs text-ink-muted">
                {flight.duration}
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-ink capitalize">
                {flight.airline}
              </div>
            </div>
          </div>

          {/* Coluna 2: Itinerário */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {/* Partida */}
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl font-semibold text-ink">
                  {flight.departure}
                </div>
              </div>

              {/* Linha de trajeto */}
              <div className="flex-1 flex flex-col items-center px-2">
                <div className="text-[10px] text-ink-muted mb-1 hidden sm:block">
                  {flight.duration}
                </div>
                <div className="w-full relative">
                  <div 
                    className="h-[2.5px] transition-all duration-300"
                    style={{ 
                      background: "var(--cream-dark)",
                      boxShadow: "0 0 8px rgba(79, 115, 134, 0.2) inset",
                    }}
                  />
                      {/* Glow adicional no modo escuro */}
                      <div 
                        className="absolute inset-0 h-[2.5px] transition-opacity duration-300 pointer-events-none"
                        style={{
                          background: "linear-gradient(90deg, transparent 0%, rgba(127, 166, 179, 0.4) 50%, transparent 100%)",
                          filter: "blur(2px)",
                          opacity: "var(--glow-opacity, 0)",
                        }}
                      />
                  {/* Indicadores de escala */}
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-blue z-10"
                    style={{ background: "var(--card-bg)" }}
                  />
                  {!isDirect && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-ink-muted z-10" />
                  )}
                  <div 
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-blue z-10"
                    style={{ background: "var(--card-bg)" }}
                  />
                </div>
                <div className={`text-[10px] mt-1 ${isDirect ? "text-sage" : "text-ink-muted"}`}>
                  {isDirect ? t.results.direct : flight.stops}
                  {flight.stopsCities && flight.stopsCities.length > 0 && (
                    <span className="hidden sm:inline"> · {flight.stopsCities.join(", ")}</span>
                  )}
                </div>
              </div>

              {/* Chegada */}
              <div className="text-center sm:text-right">
                <div className="text-xl sm:text-2xl font-semibold text-ink">
                  {flight.arrival}
                  {flight.nextDayArrival && (
                    <sup className="text-[10px] text-ink-muted ml-0.5">+1</sup>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Coluna 3: Preço e CTA */}
          <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:w-36 sm:flex-shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 sm:border-l sm:pl-4" style={{ borderColor: "var(--cream-dark)" }}>
            <div className="text-right">
              <div className="text-xs text-ink-muted">
                {flight.offersCount} {flight.offersCount === 1 ? t.results.offer : t.results.offers} {t.results.from}
              </div>
              <div className="flex items-baseline justify-end gap-2 flex-wrap">
                <div className="text-xl sm:text-2xl font-bold text-ink group-hover:text-blue transition-colors">
                  {formatPrice(flight.price)}
                </div>
                {priceInsight && (
                  <PriceInsightBadge insight={priceInsight} className="mt-1" />
                )}
              </div>
            </div>
            
            <button
              className="px-4 py-2 rounded-lg bg-blue text-cream-soft text-sm font-medium hover:bg-blue-soft transition-colors"
            >
              {t.results.viewOffers}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
