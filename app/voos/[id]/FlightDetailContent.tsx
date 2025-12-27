"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/brand";
import { Footer, ThemeToggle, LanguageToggle } from "@/components/layout";
import { BackgroundWaves } from "@/components/ui";
import { formatPrice } from "@/lib/mocks/flights";
import type { FlightResult } from "@/lib/search/types";
import { useI18n } from "@/lib/i18n";
import { parseSearchParams } from "@/lib/utils/searchParams";
import { AirlineLogo } from "@/components/flights";
import { PriceInsightBadge } from "@/components/price/PriceInsightBadge";
import { PartnerCard } from "@/components/partners/PartnerCard";
import { FlightWarnings, FlightDecisionHeader } from "@/components/flight-detail";
import { PriceAlertCTA } from "@/components/results";
import { buildOutboundUrl, type SearchContext } from "@/lib/partners/outbound";
import { trackPartnerClickEvent } from "@/lib/tracking/partnerClick";
import { getOTAPartners } from "@/lib/partners";

// ============================================================================
// Loading Skeleton
// ============================================================================

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex gap-6">
        <div className="flex-1 space-y-4">
          <div className="h-48 rounded-xl" style={{ background: "var(--cream-dark)", opacity: 0.3 }} />
          <div className="h-6 w-32 rounded" style={{ background: "var(--cream-dark)", opacity: 0.3 }} />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl" style={{ background: "var(--cream-dark)", opacity: 0.3 }} />
            ))}
          </div>
        </div>
        <div className="hidden lg:block w-80 space-y-4">
          <div className="h-64 rounded-xl" style={{ background: "var(--cream-dark)", opacity: 0.3 }} />
          <div className="h-24 rounded-xl" style={{ background: "var(--cream-dark)", opacity: 0.3 }} />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function FlightDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useI18n();
  const id = params.id as string;

  const backUrl = searchParams.toString() 
    ? `/resultados?${searchParams.toString()}`
    : "/resultados";

  const [isLoading, setIsLoading] = useState(true);
  const [flight, setFlight] = useState<FlightResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  const sid = searchParams.get("sid");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const depart = searchParams.get("depart");
  const returnDate = searchParams.get("return");

  const searchContext: SearchContext = {
    from: from || undefined,
    to: to || undefined,
    departDate: depart || undefined,
    returnDate: returnDate || undefined,
  };

  const fetchFlight = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setErrorCode(null);
    setRequestId(null);

    try {
      const url = new URL(`/api/flights/${id}`, window.location.origin);
      if (sid) url.searchParams.set("sid", sid);
      if (from) url.searchParams.set("from", from);
      if (to) url.searchParams.set("to", to);
      if (depart) url.searchParams.set("depart", depart);
      if (returnDate) url.searchParams.set("return", returnDate);

      const response = await fetch(url.toString());
      const data = await response.json();

      const respRequestId = response.headers.get("X-Request-Id");
      if (respRequestId) setRequestId(respRequestId);

      if (!response.ok) {
        const code = data.code || "UNKNOWN_ERROR";
        setErrorCode(code);
        
        if (code === "FLIGHT_NOT_FOUND" || code === "FLIGHT_CONTEXT_MISSING") {
          setFlight(null);
          setError(data.message);
        } else {
          setError(data.message || "Erro ao carregar voo");
        }
        return;
      }

      const flightData = data.flight as FlightResult;
      setFlight(flightData);
    } catch {
      setError("Erro de conexão");
      setErrorCode("NETWORK_ERROR");
    } finally {
      setIsLoading(false);
    }
  }, [id, sid, from, to, depart, returnDate]);

  useEffect(() => {
    fetchFlight();
  }, [fetchFlight]);

  const displayPrice = flight?.price || 0;
  const otaPartners = getOTAPartners();
  const partnerSlugs = otaPartners.map(p => p.slug);

  const searchState = parseSearchParams(searchParams);
  const routeFrom = searchState.from?.code || from || "???";
  const routeTo = searchState.to?.code || to || "???";

  // Price context baseado no priceInsight
  const priceContext = flight?.priceInsight
    ? flight.priceInsight.isBelowAverage 
      ? "below_average" as const
      : flight.priceInsight.priceDifference < 0 
        ? "above_average" as const
        : "average" as const
    : null;

  function handleBack() {
    router.push(backUrl);
  }

  function handleAirlineClick() {
    if (!flight) return;

    trackPartnerClickEvent({
      partner: flight.airlineCode.toLowerCase(),
      flightId: flight.id,
      route: { from: routeFrom, to: routeTo },
      sid: sid || undefined,
      requestId: requestId || undefined,
    });

    const airlineUrl = buildOutboundUrl(
      flight.airlineCode.toLowerCase(),
      flight,
      searchContext
    );

    const url = airlineUrl !== "#" 
      ? airlineUrl 
      : `https://www.google.com/search?q=${encodeURIComponent(flight.airline + " flights official site")}`;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "T12:00:00");
    return date.toLocaleDateString(locale === "pt" ? "pt-BR" : "en-US", {
      day: "numeric",
      month: "short",
    }).replace(".", "");
  };

  const routeDisplay = `${searchState.from?.city || from || "?"} → ${searchState.to?.city || to || "?"}`;

  return (
    <>
      <BackgroundWaves />

      <div className="min-h-screen relative">
        {/* Header */}
        <header 
          className="sticky top-0 z-50 backdrop-blur-md border-b"
          style={{
            background: "var(--cream)/80",
            borderColor: "var(--card-border)",
          }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <LogoMark className="w-6 h-6" />
                <Wordmark className="text-lg hidden sm:block" />
              </Link>

              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={handleBack}
                  className="text-sm text-blue hover:text-blue-soft transition-colors lowercase flex items-center gap-1"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t.flightDetails.back}
                </button>
                <div className="hidden sm:flex items-center gap-1">
                  <LanguageToggle />
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-16">
          {isLoading ? (
            <LoadingSkeleton />
          ) : flight ? (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Coluna Principal - Onde Comprar */}
              <div className="flex-1 min-w-0">
                {/* Título da rota */}
                <div className="mb-4">
                  <h1 className="text-lg sm:text-xl font-medium text-ink lowercase">
                    {routeDisplay}
                  </h1>
                  <p className="text-sm text-ink-muted">
                    {formatDate(depart)}
                    {returnDate && ` – ${formatDate(returnDate)}`}
                  </p>
                </div>

                {/* Mensagem de decisão */}
                <FlightDecisionHeader flight={flight} priceContext={priceContext} />

                {/* Onde comprar */}
                <h2 className="text-base font-medium text-ink lowercase mb-4">
                  {t.flightDetails.whereToBook}
                </h2>

                {/* Site oficial da companhia (destacado) */}
                <div 
                  className="p-4 sm:p-5 rounded-xl border-2 mb-3"
                  style={{
                    background: "var(--card-bg)",
                    borderColor: "var(--sage)",
                  }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <AirlineLogo code={flight.airlineCode} name={flight.airline} />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-ink capitalize">{flight.airline}</span>
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide"
                            style={{
                              background: "var(--sage)",
                              color: "white",
                            }}
                          >
                            {t.flightDetails.officialSite}
                          </span>
                        </div>
                        <p className="text-xs text-ink-muted mt-0.5">
                          {locale === "pt" 
                            ? "compra direta com a companhia. melhor suporte." 
                            : "direct purchase. best support."
                          }
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleAirlineClick}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 flex-shrink-0"
                      style={{ 
                        background: "var(--sage)", 
                        color: "var(--cream-soft)" 
                      }}
                    >
                      <span>{t.flightDetails.goToSite}</span>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 11L11 3M11 3H5M11 3V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Parceiros OTA */}
                <div className="space-y-2 mb-6">
                  {partnerSlugs.map((slug) => (
                    <PartnerCard
                      key={slug}
                      slug={slug}
                      flight={flight}
                      searchContext={searchContext}
                      sid={sid || undefined}
                      requestId={requestId || undefined}
                    />
                  ))}
                </div>

                {/* Disclaimer */}
                <div 
                  className="rounded-xl p-4 text-center"
                  style={{ background: "var(--cream-dark)" }}
                >
                  <p className="text-xs text-ink-muted">
                    {t.flightDetails.partnersDisclaimer}
                  </p>
                </div>
              </div>

              {/* Sidebar - Resumo do voo (sticky) */}
              <aside className="lg:w-80 flex-shrink-0">
                <div className="lg:sticky lg:top-24 space-y-4">
                  {/* Card resumo do voo */}
                  <div 
                    className="rounded-2xl p-5"
                    style={{
                      background: "var(--card-bg)",
                      border: "1px solid var(--card-border)",
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <AirlineLogo code={flight.airlineCode} name={flight.airline} size={32} />
                        <span className="text-sm font-medium text-ink capitalize">{flight.airline}</span>
                      </div>
                      {flight.co2 && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          flight.co2.startsWith("-") ? "bg-sage/10 text-sage" : "bg-accent/10 text-accent"
                        }`}>
                          {flight.co2}
                        </span>
                      )}
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-semibold text-ink tabular-nums">{flight.departure}</div>
                      </div>

                      <div className="flex-1 relative py-2">
                        <div className="h-[2px] rounded-full" style={{ background: "var(--cream-dark)" }} />
                        <div 
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-blue z-10"
                          style={{ background: "var(--card-bg)" }}
                        />
                        {flight.stops !== "direto" && flight.stops !== "direct" && (
                          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue z-10" />
                        )}
                        <div 
                          className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-blue z-10"
                          style={{ background: "var(--card-bg)" }}
                        />
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-semibold text-ink tabular-nums">
                          {flight.arrival}
                          {flight.nextDayArrival && <sup className="text-xs text-ink-muted ml-0.5">+1</sup>}
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="text-center text-sm text-ink-muted mb-4">
                      {flight.duration} · {flight.stops === "direto" || flight.stops === "direct"
                        ? t.flightDetails.direct
                        : `${flight.stops}`
                      }
                      {flight.stopsCities && flight.stopsCities.length > 0 && (
                        <span> ({flight.stopsCities.join(", ")})</span>
                      )}
                    </div>

                    {/* Preço */}
                    <div className="text-center pt-4 border-t" style={{ borderColor: "var(--cream-dark)" }}>
                      <div className="text-sm text-ink-muted mb-1">
                        {locale === "pt" ? "preço deste voo" : "flight price"}
                      </div>
                      <div className="text-2xl font-bold text-blue mb-2">
                        {formatPrice(displayPrice)}
                      </div>
                      {flight.priceInsight && (
                        <PriceInsightBadge insight={flight.priceInsight} />
                      )}
                    </div>
                  </div>

                  {/* Alertas/Warnings */}
                  <FlightWarnings flight={flight} />

                  {/* CTA alerta de preço */}
                  <PriceAlertCTA route={routeDisplay} />
                </div>
              </aside>
            </div>
          ) : errorCode === "FLIGHT_CONTEXT_MISSING" ? (
            <ErrorCard 
              type="context"
              requestId={requestId}
              onBack={handleBack}
              t={t}
            />
          ) : error ? (
            <ErrorCard 
              type="error"
              message={error}
              requestId={requestId}
              onRetry={fetchFlight}
              onBack={handleBack}
              t={t}
            />
          ) : (
            <ErrorCard 
              type="notfound"
              onBack={handleBack}
              t={t}
            />
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}

// ============================================================================
// Error Card Component
// ============================================================================

interface ErrorCardProps {
  type: "context" | "error" | "notfound";
  message?: string;
  requestId?: string | null;
  onRetry?: () => void;
  onBack: () => void;
  t: ReturnType<typeof useI18n>["t"];
}

function ErrorCard({ type, message, requestId, onRetry, onBack, t }: ErrorCardProps) {
  const title = type === "context" 
    ? t.flightDetails.contextMissingTitle 
    : type === "error"
      ? t.flightDetails.errorTitle
      : t.flightDetails.flightNotFound;

  const description = type === "context"
    ? t.flightDetails.contextMissingMessage
    : type === "error"
      ? message
      : t.flightDetails.flightExpired;

  return (
    <div 
      className="text-center py-16 px-6 rounded-2xl max-w-lg mx-auto"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
      }}
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "var(--cream-dark)" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-ink-muted">
          <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <h2 className="text-lg font-medium text-ink mb-2">{title}</h2>
      <p className="text-sm text-ink-muted mb-4">{description}</p>
      {requestId && (
        <p className="text-xs text-ink-muted mb-6 font-mono">
          código: {requestId.slice(0, 8)}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-blue text-cream-soft rounded-xl text-sm font-medium lowercase hover:bg-blue-soft transition-colors"
          >
            {t.results.tryAgain}
          </button>
        )}
        {type === "notfound" ? (
          <Link 
            href="/"
            className="px-6 py-3 bg-blue text-cream-soft rounded-xl text-sm font-medium lowercase hover:bg-blue-soft transition-colors inline-block"
          >
            {t.flightDetails.newSearch}
          </Link>
        ) : null}
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl text-sm font-medium lowercase border transition-colors hover:border-blue-soft"
          style={{ borderColor: "var(--card-border)", color: "var(--ink)" }}
        >
          {type === "context" ? t.flightDetails.backToResults : t.flightDetails.back}
        </button>
      </div>
    </div>
  );
}
