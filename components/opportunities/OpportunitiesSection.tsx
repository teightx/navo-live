"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { OPPORTUNITIES, type Opportunity } from "@/lib/mocks/opportunities";
import { formatPrice } from "@/lib/mocks/flights";
import { serializeSearchState } from "@/lib/utils/searchParams";
import { defaultSearchState } from "@/lib/types/search";
import { getAirportByCode } from "@/lib/airports";

// Feature flag: set to true when real price monitoring is implemented
const SHOW_OPPORTUNITIES = true;
const HAS_REAL_PRICE_HISTORY = false;

interface OpportunityCardProps {
  opportunity: Opportunity;
  onClick: () => void;
}

function OpportunityCard({ opportunity, onClick }: OpportunityCardProps) {
  const { t, locale } = useI18n();
  
  // When we have real price history, show actual badges
  // For now, show a neutral "popular route" badge
  const badgeText = HAS_REAL_PRICE_HISTORY
    ? (opportunity.badge === "below_average"
        ? (locale === "pt" ? "abaixo da média" : "below average")
        : (locale === "pt" ? "menor preço recente" : "lowest recent price"))
    : (locale === "pt" ? "rota popular" : "popular route");

  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-xl border transition-all duration-200 hover:border-blue-soft hover:shadow-md"
      style={{
        background: "var(--card-bg)",
        borderColor: "var(--card-border)",
      }}
    >
      <div className="p-4">
        {/* Header: Badge e Destino */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="text-sm font-medium text-ink capitalize mb-1">
              {opportunity.destination.city}
            </div>
            <div className="text-xs text-ink-muted capitalize">
              {opportunity.destination.country}
            </div>
          </div>
          
          {opportunity.badge && (
            <div
              className="px-2 py-0.5 rounded-full text-[10px] font-medium ml-2 flex-shrink-0"
              style={{
                background: "var(--sage)",
                color: "var(--cream-soft)",
                opacity: 0.9,
              }}
            >
              {badgeText}
            </div>
          )}
        </div>

        {/* Preço */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xs text-ink-muted lowercase">
            {t.results.from}
          </span>
          <span className="text-xl font-bold text-blue">
            {formatPrice(opportunity.price)}
          </span>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "var(--cream-dark)" }}>
          <span className="text-xs text-ink-muted lowercase">
            {opportunity.origin.city} → {opportunity.destination.city}
          </span>
          <span
            className="text-xs font-medium lowercase transition-colors group-hover:text-blue"
            style={{ color: "var(--ink)" }}
          >
            {locale === "pt" ? "ver voos" : "view flights"}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className="inline-block ml-1"
              style={{ color: "var(--ink-muted)" }}
            >
              <path
                d="M4.5 9L7.5 6L4.5 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>
    </button>
  );
}

export function OpportunitiesSection() {
  const router = useRouter();
  const { t, locale } = useI18n();

  function handleOpportunityClick(opportunity: Opportunity) {
    const originAirport = getAirportByCode(opportunity.origin.code);
    const destinationAirport = getAirportByCode(opportunity.destination.code);

    if (!originAirport || !destinationAirport) return;

    const searchState = {
      ...defaultSearchState,
      from: originAirport,
      to: destinationAirport,
      departDate: opportunity.departureDate || null,
      tripType: "oneway" as const,
    };

    const queryString = serializeSearchState(searchState);
    router.push(`/resultados?${queryString}`);
  }

  // Hide section entirely if feature flag is off
  if (!SHOW_OPPORTUNITIES) {
    return null;
  }

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl sm:text-2xl font-medium text-ink lowercase">
            {locale === "pt" ? "rotas populares" : "popular routes"}
          </h2>
          {!HAS_REAL_PRICE_HISTORY && (
            <span 
              className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide"
              style={{ 
                background: "var(--cream-dark)", 
                color: "var(--ink-muted)" 
              }}
            >
              {locale === "pt" ? "exemplos" : "examples"}
            </span>
          )}
        </div>
        <p className="text-sm text-ink-muted">
          {HAS_REAL_PRICE_HISTORY
            ? (locale === "pt"
                ? "rotas com variação de preço detectada nas últimas 48h"
                : "routes with price variation detected in the last 48h")
            : (locale === "pt"
                ? "explore destinos internacionais saindo do brasil"
                : "explore international destinations from brazil")}
        </p>
      </div>

      {/* Grid de oportunidades */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {OPPORTUNITIES.slice(0, 6).map((opportunity) => (
          <OpportunityCard
            key={opportunity.id}
            opportunity={opportunity}
            onClick={() => handleOpportunityClick(opportunity)}
          />
        ))}
      </div>
    </section>
  );
}

