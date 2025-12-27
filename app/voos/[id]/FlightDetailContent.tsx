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
import { buildOutboundUrl, type SearchContext } from "@/lib/partners/outbound";
import { trackPartnerClickEvent } from "@/lib/tracking/partnerClick";
import { getAllPartners, getOTAPartners } from "@/lib/partners";

// ============================================================================
// Loading Skeleton
// ============================================================================

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div 
        className="h-40 rounded-xl"
        style={{ background: "var(--cream-dark)", opacity: 0.3 }}
      />
      <div 
        className="h-6 w-48 rounded"
        style={{ background: "var(--cream-dark)", opacity: 0.3 }}
      />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i} 
            className="h-16 rounded-xl"
            style={{ background: "var(--cream-dark)", opacity: 0.3 }}
          />
        ))}
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
  const { t } = useI18n();
  const id = params.id as string;

  // Preservar query params da busca para voltar
  const backUrl = searchParams.toString() 
    ? `/resultados?${searchParams.toString()}`
    : "/resultados";

  const [isLoading, setIsLoading] = useState(true);
  const [flight, setFlight] = useState<FlightResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  // Extract sid (primary lookup) and search params (fallback)
  const sid = searchParams.get("sid");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const depart = searchParams.get("depart");
  const returnDate = searchParams.get("return");

  // Build search context for outbound URLs
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
      // Build URL with sid (primary) and search params (fallback)
      const url = new URL(`/api/flights/${id}`, window.location.origin);
      if (sid) url.searchParams.set("sid", sid);
      if (from) url.searchParams.set("from", from);
      if (to) url.searchParams.set("to", to);
      if (depart) url.searchParams.set("depart", depart);
      if (returnDate) url.searchParams.set("return", returnDate);

      const response = await fetch(url.toString());
      const data = await response.json();

      // Extract request ID from response header
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

  // Use flight price directly (no partner price mocks)
  const displayPrice = flight?.price || 0;

  // Get OTA partners (non-airline partners)
  const otaPartners = getOTAPartners();
  const partnerSlugs = otaPartners.map(p => p.slug);

  // Extrair rota dos searchParams para tracking
  const searchState = parseSearchParams(searchParams);
  const routeFrom = searchState.from?.code || from || "???";
  const routeTo = searchState.to?.code || to || "???";

  function handleBack() {
    // Preservar query params ao voltar
    router.push(backUrl);
  }

  function handleAirlineClick() {
    if (!flight) return;

    // Track the click
    trackPartnerClickEvent({
      partner: flight.airlineCode.toLowerCase(),
      flightId: flight.id,
      route: { from: routeFrom, to: routeTo },
      sid: sid || undefined,
      requestId: requestId || undefined,
    });

    // Build a sensible URL for the airline
    // In the future, we could map airline codes to official URLs
    const airlineUrl = buildOutboundUrl(
      flight.airlineCode.toLowerCase(),
      flight,
      searchContext
    );

    // Fallback to Google search if we don't have the airline in partners
    const url = airlineUrl !== "#" 
      ? airlineUrl 
      : `https://www.google.com/search?q=${encodeURIComponent(flight.airline + " flights official site")}`;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <BackgroundWaves />

      <div className="min-h-screen relative">
        <header 
          className="sticky top-0 z-50 backdrop-blur-sm border-b"
          style={{
            background: "var(--card-bg)",
            borderColor: "var(--card-border)",
          }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <LogoMark className="w-6 h-6" />
                <Wordmark className="text-lg" />
              </Link>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleBack}
                  className="text-sm text-blue hover:text-blue-soft transition-colors lowercase flex items-center gap-1"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t.flightDetails.back}
                </button>
                <div className="hidden sm:flex items-center gap-1 ml-2">
                  <LanguageToggle />
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {isLoading ? (
            <LoadingSkeleton />
          ) : flight ? (
            <>
              {/* Resumo do voo */}
              <div 
                className="rounded-2xl p-6 mb-8"
                style={{
                  background: "var(--card-bg)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid var(--card-border)",
                  boxShadow: "var(--card-shadow)",
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <AirlineLogo code={flight.airlineCode} name={flight.airline} />
                    <div>
                      <div className="text-sm font-medium text-ink capitalize">{flight.airline}</div>
                      <div className="text-xs text-ink-muted">{flight.duration}</div>
                    </div>
                  </div>
                  {flight.co2 && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      flight.co2.startsWith("-") ? "bg-sage/10 text-sage" : "bg-accent/10 text-accent"
                    }`}>
                      {flight.co2}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1">
                    <div className="text-3xl font-semibold text-ink">{flight.departure}</div>
                    <div className="text-sm text-ink-muted">{t.flightDetails.departure}</div>
                  </div>

                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-full relative py-2">
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
                      <div 
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-blue z-10"
                        style={{ background: "var(--card-bg)" }}
                      />
                      <div 
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-blue z-10"
                        style={{ background: "var(--card-bg)" }}
                      />
                    </div>
                    <div className={`text-xs ${flight.stops === "direto" || flight.stops === "direct" ? "text-sage" : "text-ink-muted"}`}>
                      {flight.stops === "direto" || flight.stops === "direct"
                        ? t.flightDetails.direct
                        : `${flight.stops} ${flight.stops === "1" ? t.flightDetails.stops : t.flightDetails.stopsPlural}`
                      }
                      {flight.stopsCities && ` · ${flight.stopsCities.join(", ")}`}
                    </div>
                  </div>

                  <div className="flex-1 text-right">
                    <div className="text-3xl font-semibold text-ink">
                      {flight.arrival}
                      {flight.nextDayArrival && <sup className="text-xs text-ink-muted ml-1">+1</sup>}
                    </div>
                    <div className="text-sm text-ink-muted">{t.flightDetails.arrival}</div>
                  </div>
                </div>

                <div className="text-center pt-4 border-t" style={{ borderColor: "var(--cream-dark)" }}>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <div>
                      <span className="text-sm text-ink-muted">{t.flightDetails.flightPriceLabel}: </span>
                      <span className="text-2xl font-bold text-blue">{formatPrice(displayPrice)}</span>
                    </div>
                    {/* Price insight comes from the API (based on real historical data) */}
                    {flight?.priceInsight && (
                      <PriceInsightBadge insight={flight.priceInsight} />
                    )}
                  </div>
                </div>
              </div>

              {/* Onde comprar */}
              <div className="mb-8">
                <h2 className="text-lg font-medium text-ink lowercase mb-4">
                  {t.flightDetails.whereToBook}
                </h2>

                {/* CTA para companhia aérea (site oficial) */}
                <div 
                  className="p-5 rounded-xl border mb-4"
                  style={{
                    background: "var(--card-bg)",
                    borderColor: "var(--card-border)",
                  }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <AirlineLogo code={flight.airlineCode} name={flight.airline} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-ink capitalize">{flight.airline}</span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide flex-shrink-0"
                            style={{
                              background: "var(--sage)",
                              color: "white",
                            }}
                          >
                            {t.flightDetails.officialSite}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleAirlineClick}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      style={{ 
                        background: "var(--blue)", 
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

                {/* Lista de parceiros (OTAs e metasearch) */}
                <div className="space-y-3 mb-4">
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
                  style={{
                    background: "var(--cream-dark)",
                    opacity: 0.7,
                  }}
                >
                  <p className="text-xs text-ink-muted">
                    {t.flightDetails.partnersDisclaimer}
                  </p>
                </div>
              </div>
            </>
          ) : errorCode === "FLIGHT_CONTEXT_MISSING" ? (
            <div 
              className="text-center py-16 px-6 rounded-2xl"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
              }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "var(--cream-dark)", opacity: 0.5 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-ink-muted">
                  <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h2 className="text-lg font-medium text-ink mb-2">{t.flightDetails.contextMissingTitle}</h2>
              <p className="text-sm text-ink-muted mb-4">{t.flightDetails.contextMissingMessage}</p>
              {requestId && (
                <p className="text-xs text-ink-muted mb-6 font-mono">
                  código: {requestId.slice(0, 8)}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 bg-blue text-cream-soft rounded-xl text-sm font-medium lowercase hover:bg-blue-soft transition-colors"
                >
                  {t.flightDetails.backToResults}
                </button>
                <Link 
                  href="/"
                  className="px-6 py-3 rounded-xl text-sm font-medium lowercase border transition-colors hover:border-blue-soft"
                  style={{ borderColor: "var(--card-border)", color: "var(--ink)" }}
                >
                  {t.flightDetails.newSearch}
                </Link>
              </div>
            </div>
          ) : error ? (
            <div 
              className="text-center py-16 px-6 rounded-2xl"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
              }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "var(--accent)", opacity: 0.1 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: "var(--accent)" }}>
                  <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h2 className="text-lg font-medium text-ink mb-2">{t.flightDetails.errorTitle}</h2>
              <p className="text-sm text-ink-muted mb-4">{error}</p>
              {requestId && (
                <p className="text-xs text-ink-muted mb-6 font-mono">
                  código: {requestId.slice(0, 8)}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => fetchFlight()}
                  className="px-6 py-3 bg-blue text-cream-soft rounded-xl text-sm font-medium lowercase hover:bg-blue-soft transition-colors"
                >
                  {t.results.tryAgain}
                </button>
                <button
                  onClick={handleBack}
                  className="px-6 py-3 rounded-xl text-sm font-medium lowercase border transition-colors hover:border-blue-soft"
                  style={{ borderColor: "var(--card-border)", color: "var(--ink)" }}
                >
                  {t.flightDetails.back}
                </button>
              </div>
            </div>
          ) : (
            <div 
              className="text-center py-16 px-6 rounded-2xl"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
              }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "var(--cream-dark)", opacity: 0.5 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-ink-muted">
                  <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h2 className="text-lg font-medium text-ink mb-2">{t.flightDetails.flightNotFound}</h2>
              <p className="text-sm text-ink-muted mb-6">{t.flightDetails.flightExpired}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link 
                  href="/"
                  className="px-6 py-3 bg-blue text-cream-soft rounded-xl text-sm font-medium lowercase hover:bg-blue-soft transition-colors"
                >
                  {t.flightDetails.newSearch}
                </Link>
                <button
                  onClick={handleBack}
                  className="px-6 py-3 rounded-xl text-sm font-medium lowercase border transition-colors hover:border-blue-soft"
                  style={{ borderColor: "var(--card-border)", color: "var(--ink)" }}
                >
                  {t.flightDetails.back}
                </button>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
