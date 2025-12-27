"use client";

import { formatPrice } from "@/lib/mocks/flights";
import type { NormalizedFlightCardView, FlightLabel, PriceContext } from "@/lib/flights";
import { useI18n } from "@/lib/i18n";
import { useState, useMemo } from "react";
import { PriceInsightBadge } from "@/components/price/PriceInsightBadge";
import { AirlineLogo } from "./AirlineLogo";
import { ItineraryLine } from "./ItineraryLine";
import type { FlightResult } from "@/lib/search/types";

interface FlightCardRoundtripProps {
  /** Normalized flight view with outbound/inbound */
  normalizedView: NormalizedFlightCardView;
  /** Original flight for legacy compatibility */
  flight: FlightResult;
  /** Click handler */
  onClick: () => void;
  /** Decision label (best_balance, cheapest, fastest) */
  label?: FlightLabel;
  /** Price context (below_average, average, above_average) */
  priceContext?: PriceContext;
  /** Whether to highlight this card */
  isHighlighted?: boolean;
  /** Best offer info for tooltip */
  bestOfferInfo?: {
    explanation: string;
    priceDifference: number;
  } | null;
}

// ============================================================================
// Icons for labels
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

export function FlightCardRoundtrip({
  normalizedView,
  flight,
  onClick,
  label,
  priceContext,
  isHighlighted = false,
  bestOfferInfo = null,
}: FlightCardRoundtripProps) {
  const { t, locale } = useI18n();
  const [showTooltip, setShowTooltip] = useState(false);

  const priceInsight = flight.priceInsight;

  // Label configuration
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

  // Price context configuration - melhorado com detalhe temporal
  const priceContextConfig = {
    below_average: {
      text: t.results.priceContextBelowAverage,
      detail: t.results.priceContextBelowAverageDetail,
      className: "text-sage",
    },
    average: {
      text: t.results.priceContextAverage,
      detail: null,
      className: "text-ink-muted",
    },
    above_average: {
      text: t.results.priceContextAboveAverage,
      detail: null,
      className: "text-accent",
    },
  };

  const currentLabelConfig = label ? labelConfig[label] : null;
  const currentPriceContext = priceContext ? priceContextConfig[priceContext] : null;
  
  // Verificar se é voo direto
  const isDirect = normalizedView.outbound.stopsCount === 0 && 
    (!normalizedView.inbound || normalizedView.inbound.stopsCount === 0);
  
  // Gerar linha de contexto baseada nas características do voo
  const contextLine = useMemo(() => {
    if (label === "best_balance") {
      return t.results.contextGoodDuration;
    }
    if (label === "cheapest") {
      return t.results.contextBestPrice;
    }
    if (isDirect) {
      return t.results.contextDirect;
    }
    // Voos com escala curta
    const hasShortLayover = normalizedView.outbound.stopsCount === 1 ||
      (normalizedView.inbound && normalizedView.inbound.stopsCount === 1);
    if (hasShortLayover) {
      return t.results.contextShortLayover;
    }
    return null;
  }, [label, isDirect, normalizedView, t]);

  return (
    <div className="relative">
      {/* Badge/Label - absolute overlay */}
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

          {/* Tooltip */}
          {showTooltip && bestOfferInfo && label === "best_balance" && (
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

      {/* Main card */}
      <div
        onClick={onClick}
        className={`group cursor-pointer rounded-2xl border backdrop-blur-sm transition-all duration-200 ${
          isHighlighted
            ? "border-blue shadow-[0_0_0_1px_var(--blue),0_8px_24px_rgba(79,115,134,0.12)]"
            : "hover:border-blue-soft hover:shadow-lg"
        }`}
        style={{
          background: "var(--card-bg)",
          borderColor: isHighlighted ? "var(--blue)" : "var(--card-border)",
        }}
      >
        {/* CO2 badge */}
        {normalizedView.co2 && (
          <div className="flex items-center rounded-t-2xl">
            <div
              className={`px-4 py-2 text-xs font-medium rounded-tl-2xl ${
                normalizedView.co2.startsWith("-")
                  ? "bg-sage/10 text-sage"
                  : "bg-accent/10 text-accent"
              }`}
            >
              {normalizedView.co2}
            </div>
          </div>
        )}

        {/* Card body */}
        <div className="p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left: Airline + Itineraries */}
            <div className="flex-1 min-w-0">
              {/* Header: Airline */}
              <div className="flex items-center gap-3 mb-3">
                <AirlineLogo 
                  code={normalizedView.primaryAirlineCode} 
                  name={normalizedView.primaryAirlineName} 
                />
                <div>
                  <div className="text-sm font-medium text-ink capitalize">
                    {normalizedView.primaryAirlineName}
                  </div>
                  {normalizedView.isMultiAirline && (
                    <div className="text-[10px] text-ink-muted">
                      {locale === "pt" ? "multi-companhias" : "multiple airlines"}
                    </div>
                  )}
                </div>
              </div>

              {/* Itineraries - layout limpo sem borda lateral */}
              <div className="space-y-0 mt-2">
                {/* Outbound (Ida) */}
                <ItineraryLine
                  itinerary={normalizedView.outbound}
                  showDirectionLabel={normalizedView.isRoundtrip}
                  compact={normalizedView.isRoundtrip}
                />

                {/* Separator when roundtrip */}
                {normalizedView.inbound && (
                  <>
                    <div 
                      className="h-px my-2"
                      style={{ background: "var(--cream-dark)" }}
                    />
                    
                    {/* Inbound (Volta) */}
                    <ItineraryLine
                      itinerary={normalizedView.inbound}
                      showDirectionLabel={true}
                      compact={true}
                    />
                  </>
                )}
              </div>

              {/* Warnings */}
              {normalizedView.warnings.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {normalizedView.warnings.slice(0, 2).map((warning, i) => (
                    <span
                      key={i}
                      className={`text-[10px] px-2 py-0.5 rounded ${
                        warning.severity === "warning"
                          ? "bg-accent/10 text-accent"
                          : "bg-blue/10 text-blue"
                      }`}
                    >
                      {warning.message}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Price and CTA */}
            <div 
              className="flex items-center justify-between lg:flex-col lg:items-end lg:justify-center gap-3 lg:w-40 flex-shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l lg:pl-5"
              style={{ borderColor: "var(--cream-dark)" }}
            >
              <div className="text-right">
                {/* Offers count */}
                <div className="text-xs text-ink-muted mb-0.5">
                  {normalizedView.offersCount}{" "}
                  {normalizedView.offersCount === 1 ? t.results.offer : t.results.offers}{" "}
                  {t.results.from}
                </div>

                {/* Price */}
                <div className="text-xl sm:text-2xl font-bold text-ink group-hover:text-blue transition-colors">
                  {formatPrice(normalizedView.totalPrice)}
                </div>

                {/* Total label for roundtrip */}
                {normalizedView.isRoundtrip && (
                  <div className="text-[10px] text-ink-muted">
                    {locale === "pt" ? "ida e volta" : "round trip"}
                  </div>
                )}

                {/* Price insight or context - melhorado com detalhe */}
                {priceInsight ? (
                  <PriceInsightBadge insight={priceInsight} className="mt-1" />
                ) : currentPriceContext ? (
                  <div className={`text-xs mt-1 ${currentPriceContext.className}`}>
                    {currentPriceContext.text}
                    {currentPriceContext.detail && (
                      <span className="text-ink-muted/70 ml-1">({currentPriceContext.detail})</span>
                    )}
                  </div>
                ) : null}
                
                {/* Linha de contexto do voo */}
                {contextLine && (
                  <div className="text-[10px] text-ink-muted mt-1 italic">
                    {contextLine}
                  </div>
                )}
              </div>

              {/* CTA */}
              <button className="px-4 py-2 rounded-xl bg-blue text-cream-soft text-sm font-medium hover:bg-blue-soft transition-colors whitespace-nowrap">
                {t.results.viewOffers}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

