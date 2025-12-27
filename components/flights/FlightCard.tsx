"use client";

import { formatPrice } from "@/lib/mocks/flights";
import type { FlightResult } from "@/lib/search/types";
import type { FlightLabel, PriceContext } from "@/lib/flights";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";
import { PriceInsightBadge } from "@/components/price/PriceInsightBadge";
import { AirlineLogo } from "./AirlineLogo";

interface FlightCardProps {
  flight: FlightResult;
  onClick: () => void;
  /** Selo do voo (best_balance, cheapest, fastest) */
  label?: FlightLabel;
  /** Contexto de preço (below_average, average, above_average) */
  priceContext?: PriceContext;
  /** Se o voo deve ser destacado (borda especial) */
  isHighlighted?: boolean;
  /** @deprecated Use label="best_balance" instead */
  isBestOffer?: boolean;
  /** @deprecated Not needed with new label system */
  bestOfferInfo?: {
    explanation: string;
    priceDifference: number;
  } | null;
}

// Ícones para os selos
function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M6 1L7.5 4.5L11 6L7.5 7.5L6 11L4.5 7.5L1 6L4.5 4.5L6 1Z" fill="currentColor"/>
    </svg>
  );
}

function CheapIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M6 1V11M3 4H9M3 8H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function FastIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M1 6H8M8 6L5 3M8 6L5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function FlightCard({ 
  flight, 
  onClick, 
  label,
  priceContext,
  isHighlighted = false,
  // Compatibilidade com sistema antigo
  isBestOffer = false, 
  bestOfferInfo = null,
}: FlightCardProps) {
  const { t } = useI18n();
  const isDirect = flight.stops === "direto" || flight.stops === "direct";
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Price insight comes from the API response (based on real historical data)
  const priceInsight = flight.priceInsight;
  
  // Determinar se deve usar o sistema novo ou antigo de labels
  const effectiveLabel = label || (isBestOffer ? "best_balance" : null);
  const effectiveHighlight = isHighlighted || isBestOffer;

  // Configuração do selo baseado no label
  const labelConfig = {
    best_balance: {
      text: t.results.labelBestBalance,
      icon: <StarIcon />,
      bgColor: "var(--blue)",
      textColor: "var(--cream-soft)",
    },
    cheapest: {
      text: t.results.labelCheapest,
      icon: <CheapIcon />,
      bgColor: "var(--sage)",
      textColor: "var(--cream-soft)",
    },
    fastest: {
      text: t.results.labelFastest,
      icon: <FastIcon />,
      bgColor: "var(--accent)",
      textColor: "var(--cream-soft)",
    },
  };

  // Configuração do contexto de preço
  const priceContextConfig = {
    below_average: {
      text: t.results.priceContextBelowAverage,
      className: "text-sage",
    },
    average: {
      text: t.results.priceContextAverage,
      className: "text-ink-muted",
    },
    above_average: {
      text: t.results.priceContextAboveAverage,
      className: "text-accent",
    },
  };

  const currentLabelConfig = effectiveLabel ? labelConfig[effectiveLabel] : null;
  const currentPriceContext = priceContext ? priceContextConfig[priceContext] : null;
  
  return (
    <div className="relative">
      {/* Badge/Selo - overlay absolute */}
      {currentLabelConfig && (
        <div className="absolute -top-2 right-3 z-10">
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-help shadow-md"
            style={{
              background: currentLabelConfig.bgColor,
              color: currentLabelConfig.textColor,
            }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={(e) => e.stopPropagation()}
          >
            {currentLabelConfig.icon}
            <span>{currentLabelConfig.text}</span>
          </div>
          
          {/* Tooltip explicativo (apenas para best_balance com bestOfferInfo) */}
          {showTooltip && bestOfferInfo && effectiveLabel === "best_balance" && (
            <div
              className="absolute right-0 top-full mt-2 z-50 px-3 py-2 rounded-lg text-xs max-w-[200px] shadow-lg pointer-events-none"
              style={{
                background: "var(--popover-bg)",
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

      {/* Card principal */}
      <div
        onClick={onClick}
        className={`group cursor-pointer rounded-xl border backdrop-blur-sm transition-all duration-200 ${
          effectiveHighlight 
            ? "border-blue shadow-[0_0_0_1px_var(--blue),0_4px_20px_rgba(79,115,134,0.15)]" 
            : "hover:border-blue-soft hover:shadow-lg"
        }`}
        style={{
          background: "var(--card-bg)",
          borderColor: effectiveHighlight ? "var(--blue)" : "var(--card-border)",
        }}
      >
        {/* CO2 badge - header contextual só aparece quando há CO2 */}
        {flight.co2 && (
          <div className="flex items-center rounded-t-xl">
            <div className={`px-4 py-2 text-xs font-medium rounded-tl-xl ${
              flight.co2.startsWith("-") 
                ? "bg-sage/10 text-sage" 
                : "bg-accent/10 text-accent"
            }`}>
              {flight.co2}
            </div>
          </div>
        )}

        {/* Corpo principal */}
        <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          
          {/* Coluna 1: Companhia */}
          <div className="flex items-center gap-3 sm:w-32 sm:flex-shrink-0">
            <AirlineLogo code={flight.airlineCode} name={flight.airline} />
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
              {/* Contexto de preço (novo) */}
              {currentPriceContext && !priceInsight && (
                <div className={`text-[10px] mt-0.5 ${currentPriceContext.className}`}>
                  {currentPriceContext.text}
                </div>
              )}
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
    </div>
  );
}
