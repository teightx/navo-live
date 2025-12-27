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

// ============================================================================
// Icons para selos
// ============================================================================

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

// ============================================================================
// Main Component
// ============================================================================

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
  const { t, locale } = useI18n();
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

  // Formatação de escalas
  const stopsText = isDirect 
    ? t.results.direct 
    : flight.stops;
  
  return (
    <div className="relative">
      {/* Badge/Selo - overlay absolute no canto superior direito */}
      {currentLabelConfig && (
        <div className="absolute -top-2.5 right-4 z-10">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg cursor-help"
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
          
          {/* Tooltip explicativo */}
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
        className={`group cursor-pointer rounded-2xl border backdrop-blur-sm transition-all duration-200 ${
          effectiveHighlight 
            ? "border-blue shadow-[0_0_0_1px_var(--blue),0_8px_24px_rgba(79,115,134,0.12)]" 
            : "hover:border-blue-soft hover:shadow-lg"
        }`}
        style={{
          background: "var(--card-bg)",
          borderColor: effectiveHighlight ? "var(--blue)" : "var(--card-border)",
        }}
      >
        {/* CO2 badge - header contextual */}
        {flight.co2 && (
          <div className="flex items-center rounded-t-2xl">
            <div className={`px-4 py-2 text-xs font-medium rounded-tl-2xl ${
              flight.co2.startsWith("-") 
                ? "bg-sage/10 text-sage" 
                : "bg-accent/10 text-accent"
            }`}>
              {flight.co2}
            </div>
          </div>
        )}

        {/* Corpo principal - layout desktop */}
        <div className="p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
            
            {/* Coluna 1: Companhia */}
            <div className="flex items-center gap-3 lg:w-28 lg:flex-shrink-0">
              <AirlineLogo code={flight.airlineCode} name={flight.airline} />
              <div className="text-sm font-medium text-ink capitalize">
                {flight.airline}
              </div>
            </div>

            {/* Coluna 2: Timeline visual (principal) */}
            <div className="flex-1">
              <div className="flex items-center gap-4">
                {/* Horário de partida */}
                <div className="text-center flex-shrink-0">
                  <div className="text-2xl sm:text-3xl font-semibold text-ink tabular-nums">
                    {flight.departure}
                  </div>
                </div>

                {/* Timeline visual */}
                <div className="flex-1 relative py-2">
                  {/* Linha principal */}
                  <div className="relative h-[3px] rounded-full" style={{ background: "var(--cream-dark)" }}>
                    {/* Glow no modo escuro */}
                    <div 
                      className="absolute inset-0 h-[3px] rounded-full pointer-events-none"
                      style={{
                        background: "linear-gradient(90deg, var(--blue) 0%, var(--blue-soft) 50%, var(--blue) 100%)",
                        opacity: "var(--glow-opacity, 0)",
                        filter: "blur(3px)",
                      }}
                    />
                    
                    {/* Ponto de origem */}
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-blue z-10"
                      style={{ background: "var(--card-bg)" }}
                    />
                    
                    {/* Pontos de escala */}
                    {!isDirect && (
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-blue z-10" />
                    )}
                    
                    {/* Ponto de destino */}
                    <div 
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-blue z-10"
                      style={{ background: "var(--card-bg)" }}
                    />
                  </div>

                  {/* Info abaixo da linha */}
                  <div className="flex justify-center mt-2">
                    <div className="text-xs text-ink-muted text-center">
                      <span className="font-medium">{flight.duration}</span>
                      <span className="mx-1.5">·</span>
                      <span className={isDirect ? "text-sage font-medium" : ""}>
                        {stopsText}
                      </span>
                      {flight.stopsCities && flight.stopsCities.length > 0 && (
                        <span className="text-ink-muted/70"> ({flight.stopsCities.join(", ")})</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Horário de chegada */}
                <div className="text-center flex-shrink-0">
                  <div className="text-2xl sm:text-3xl font-semibold text-ink tabular-nums">
                    {flight.arrival}
                    {flight.nextDayArrival && (
                      <sup className="text-xs text-ink-muted ml-0.5 font-normal">+1</sup>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna 3: Preço e CTA */}
            <div className="flex items-center justify-between lg:flex-col lg:items-end gap-3 lg:w-40 lg:flex-shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l lg:pl-6" style={{ borderColor: "var(--cream-dark)" }}>
              <div className="text-right">
                {/* Ofertas count */}
                <div className="text-xs text-ink-muted mb-1">
                  {flight.offersCount} {flight.offersCount === 1 ? t.results.offer : t.results.offers} {t.results.from}
                </div>
                
                {/* Preço */}
                <div className="text-2xl sm:text-3xl font-bold text-ink group-hover:text-blue transition-colors">
                  {formatPrice(flight.price)}
                </div>
                
                {/* Price insight (API) ou contexto de preço (calculado) */}
                {priceInsight ? (
                  <PriceInsightBadge insight={priceInsight} className="mt-1" />
                ) : currentPriceContext ? (
                  <div className={`text-xs mt-1 ${currentPriceContext.className}`}>
                    {currentPriceContext.text}
                  </div>
                ) : null}
              </div>
              
              {/* CTA */}
              <button
                className="px-5 py-2.5 rounded-xl bg-blue text-cream-soft text-sm font-medium hover:bg-blue-soft transition-colors whitespace-nowrap"
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
