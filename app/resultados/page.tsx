"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/brand";
import { Footer, ThemeToggle, LanguageToggle } from "@/components/layout";
import { BackgroundWaves, SearchModal } from "@/components/ui";
import { FlightCard } from "@/components/flights";
import { 
  DecisionSummary, 
  sortByDecisionType,
  FiltersSidebar,
  applyFilters,
  defaultFilterState,
  PriceAlertCTA,
  type DecisionType,
  type FilterState,
} from "@/components/results";
import { useI18n } from "@/lib/i18n";
import type { SearchState, FlightResult } from "@/lib/search/types";
import { searchFlights, shouldUseMockFallback } from "@/lib/search/searchFlights";
import { mockSearch } from "@/lib/search/mockSearch";
import { parseSearchParams, normalizeSearchState, serializeSearchState } from "@/lib/utils/searchParams";
import { calculateAveragePrice } from "@/lib/utils/bestOffer";
import { addDecisionLabels, getHumanMessageDeterministic, type FlightWithLabels } from "@/lib/flights";

// ============================================================================
// Types
// ============================================================================

interface SearchErrorInfo {
  code: string;
  message: string;
  requestId?: string;
  resetSec?: number;
}

// ============================================================================
// Loading Skeleton Component
// ============================================================================

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div 
          key={i} 
          className="rounded-xl p-4 sm:p-5 animate-pulse"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg" style={{ background: "var(--cream-dark)", opacity: 0.3 }} />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-4">
                <div className="h-6 w-16 rounded" style={{ background: "var(--cream-dark)", opacity: 0.3 }} />
                <div className="flex-1 h-px" style={{ background: "var(--cream-dark)", opacity: 0.3 }} />
                <div className="h-6 w-16 rounded" style={{ background: "var(--cream-dark)", opacity: 0.3 }} />
              </div>
              <div className="h-3 w-24 rounded mx-auto" style={{ background: "var(--cream-dark)", opacity: 0.3 }} />
            </div>
            <div className="space-y-2 text-right">
              <div className="h-6 w-20 rounded" style={{ background: "var(--cream-dark)", opacity: 0.3 }} />
              <div className="h-8 w-24 rounded" style={{ background: "var(--cream-dark)", opacity: 0.3 }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Empty State Component
// ============================================================================

function EmptyState({ onEditSearch }: { onEditSearch: () => void }) {
  const { t } = useI18n();
  
  return (
    <div className="text-center py-16 px-4">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "var(--cream-dark)", opacity: 0.5 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-ink-muted">
          <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <h2 className="text-lg font-medium text-ink mb-2">{t.results.noFlightsFound}</h2>
      <p className="text-ink-muted text-sm max-w-xs mx-auto mb-6">
        {t.results.tryAdjusting}
      </p>
      <button
        onClick={onEditSearch}
        className="px-6 py-3 bg-blue text-cream-soft rounded-xl text-sm font-medium lowercase hover:bg-blue-soft transition-colors"
      >
        {t.results.editSearch}
      </button>
    </div>
  );
}

// ============================================================================
// Rate Limit Error Component
// ============================================================================

function RateLimitState({ 
  error, 
  onRetry, 
  onEditSearch,
  retryCountdown,
}: { 
  error: SearchErrorInfo;
  onRetry: () => void;
  onEditSearch: () => void;
  retryCountdown: number;
}) {
  const { t } = useI18n();
  
  return (
    <div 
      className="rounded-xl p-6 border"
      style={{
        background: "var(--card-bg)",
        borderColor: "var(--accent)",
      }}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(var(--accent-rgb), 0.1)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: "var(--accent)" }}>
            <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-ink mb-1">{t.results.rateLimitTitle}</h3>
          <p className="text-xs text-ink-muted mb-4">{t.results.rateLimitMessage}</p>
          
          {error.requestId && (
            <p className="text-xs text-ink-muted mb-4 font-mono">
              {t.results.requestCode.replace("{code}", error.requestId.slice(0, 8))}
            </p>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={onRetry}
              disabled={retryCountdown > 0}
              className="px-4 py-2 bg-blue text-cream-soft rounded-lg text-xs font-medium lowercase hover:bg-blue-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {retryCountdown > 0 
                ? t.results.rateLimitRetry.replace("{seconds}", String(retryCountdown))
                : t.results.tryAgain
              }
            </button>
            <button
              onClick={onEditSearch}
              className="px-4 py-2 border rounded-lg text-xs font-medium lowercase transition-colors"
              style={{
                borderColor: "var(--card-border)",
                color: "var(--ink)",
              }}
            >
              {t.results.editSearch}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Generic Error State Component
// ============================================================================

function ErrorState({ 
  error,
  onRetry, 
  onEditSearch,
}: { 
  error?: SearchErrorInfo;
  onRetry: () => void;
  onEditSearch: () => void;
}) {
  const { t } = useI18n();
  
  return (
    <div 
      className="rounded-xl p-6 border"
      style={{
        background: "var(--card-bg)",
        borderColor: "var(--card-border)",
      }}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--accent)", opacity: 0.1 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: "var(--accent)" }}>
            <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-ink mb-1">{t.results.errorTitle}</h3>
          <p className="text-xs text-ink-muted mb-4">{error?.message || t.results.errorMessage}</p>
          
          {error?.requestId && (
            <p className="text-xs text-ink-muted mb-4 font-mono">
              {t.results.requestCode.replace("{code}", error.requestId.slice(0, 8))}
            </p>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue text-cream-soft rounded-lg text-xs font-medium lowercase hover:bg-blue-soft transition-colors"
            >
              {t.results.tryAgain}
            </button>
            <button
              onClick={onEditSearch}
              className="px-4 py-2 border rounded-lg text-xs font-medium lowercase transition-colors"
              style={{
                borderColor: "var(--card-border)",
                color: "var(--ink)",
              }}
            >
              {t.results.editSearch}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Active Filters Chips
// ============================================================================

function ActiveFiltersChips({ 
  filters, 
  onClear 
}: { 
  filters: FilterState; 
  onClear: (key: keyof FilterState) => void;
}) {
  const { locale } = useI18n();
  const chips: { key: keyof FilterState; label: string }[] = [];

  const text = {
    pt: { direct: "direto", oneStop: "1 escala", twoPlus: "2+ escalas", maxDuration: "até", morning: "manhã", afternoon: "tarde", evening: "noite", night: "madrugada" },
    en: { direct: "direct", oneStop: "1 stop", twoPlus: "2+ stops", maxDuration: "max", morning: "morning", afternoon: "afternoon", evening: "evening", night: "night" },
  };
  const t = text[locale as "pt" | "en"] || text.pt;

  if (filters.stops !== "all") {
    const label = filters.stops === "direct" ? t.direct : filters.stops === "1" ? t.oneStop : t.twoPlus;
    chips.push({ key: "stops", label });
  }

  if (filters.maxDuration !== null) {
    const hours = Math.floor(filters.maxDuration / 60);
    chips.push({ key: "maxDuration", label: `${t.maxDuration} ${hours}h` });
  }

  if (filters.airlines.length > 0) {
    chips.push({ key: "airlines", label: filters.airlines.length === 1 ? filters.airlines[0] : `${filters.airlines.length} cias` });
  }

  if (filters.departureTime !== "all") {
    chips.push({ key: "departureTime", label: t[filters.departureTime] });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onClear(key)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors hover:opacity-80"
          style={{ background: "var(--blue)", color: "var(--cream-soft)" }}
        >
          <span className="capitalize">{label}</span>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// Main Results Content Component
// ============================================================================

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, locale } = useI18n();
  
  // Parse and normalize search state from URL
  const searchState = useMemo(() => {
    const urlState = parseSearchParams(searchParams);
    return normalizeSearchState(urlState);
  }, [searchParams]);
  
  const from = searchState.from?.code || "";
  const to = searchState.to?.code || "";
  const depart = searchState.departDate || "";
  const returnDate = searchState.returnDate || "";
  
  // Flags para forçar estados (teste)
  const forceEmpty = searchParams.get("_empty") === "1";
  const forceError = searchParams.get("_error") === "1";
  
  // Criar chave de serialização para estabilizar dependências
  const searchKey = useMemo(
    () => `${from}|${to}|${depart}|${returnDate}|${forceEmpty}|${forceError}`,
    [from, to, depart, returnDate, forceEmpty, forceError]
  );
  
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<FlightResult[]>([]);
  const [errorInfo, setErrorInfo] = useState<SearchErrorInfo | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Decision type (melhor equilíbrio, mais barato, mais rápido)
  const [decisionType, setDecisionType] = useState<DecisionType>("best_balance");
  
  // Filtros avançados
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);
  
  // Mobile filters drawer
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);
  
  // Rate limit retry countdown
  const [retryCountdown, setRetryCountdown] = useState(0);

  // Countdown timer for rate limit
  useEffect(() => {
    if (retryCountdown <= 0) return;
    
    const timer = setInterval(() => {
      setRetryCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [retryCountdown]);

  // Perform search function
  const performSearch = useCallback(async (abortSignal?: AbortSignal) => {
    if (!from || !to || !depart) {
      setIsLoading(false);
      setResults([]);
      setErrorInfo(null);
      return;
    }

    setIsLoading(true);
    setErrorInfo(null);
    
    try {
      // Test flags: use mock directly
      if (forceEmpty || forceError) {
        const result = await mockSearch(searchState, {
          forceEmpty,
          forceError,
          delay: Math.random() * 300 + 600,
        });
        
        if (!abortSignal?.aborted) {
          setResults(result.flights);
          setErrorInfo(null);
        }
        return;
      }

      // Real search via API
      const result = await searchFlights(searchState, {
        max: 20,
        signal: abortSignal,
      });
      
      if (abortSignal?.aborted) return;

      if (result.error) {
        if (result.error.code === "RATE_LIMITED") {
          const resetSec = result.error.details?.resetSec ?? 30;
          setErrorInfo({
            code: result.error.code,
            message: result.error.message,
            requestId: result.error.requestId,
            resetSec,
          });
          setRetryCountdown(resetSec);
          setResults([]);
          return;
        }

        if (result.error.code === "AMADEUS_DISABLED" && shouldUseMockFallback()) {
          const mockResult = await mockSearch(searchState);
          setResults(mockResult.flights);
          setSessionId(null);
          setErrorInfo(null);
          return;
        }

        setErrorInfo({
          code: result.error.code,
          message: result.error.message,
          requestId: result.error.requestId,
        });
        setResults([]);
        return;
      }

      setResults(result.flights);
      setSessionId(result.sid || null);
      setErrorInfo(null);
    } catch (err) {
      if (!abortSignal?.aborted) {
        setErrorInfo({
          code: "UNKNOWN_ERROR",
          message: err instanceof Error ? err.message : "Erro desconhecido",
        });
        setResults([]);
      }
    } finally {
      if (!abortSignal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [from, to, depart, forceEmpty, forceError, searchState]);

  // Initial search effect
  useEffect(() => {
    const abortController = new AbortController();
    performSearch(abortController.signal);
    return () => abortController.abort();
  }, [searchKey, performSearch]);

  // Processar resultados com labels de decisão, filtros e ordenação
  const { displayFlights, humanMessage, totalCount } = useMemo(() => {
    if (results.length === 0) {
      return { displayFlights: [] as FlightWithLabels[], humanMessage: "", totalCount: 0 };
    }
    
    // 1. Aplicar filtros
    const filtered = applyFilters(results, filters);
    
    // 2. Ordenar por tipo de decisão
    const sorted = sortByDecisionType(filtered, decisionType);
    
    // 3. Adicionar labels (best_balance, cheapest, fastest) e contexto de preço
    const { flights: labeled } = addDecisionLabels(sorted);
    
    // 4. Gerar mensagem humana
    const message = getHumanMessageDeterministic(labeled.length, locale as "pt" | "en");
    
    return { 
      displayFlights: labeled, 
      humanMessage: message,
      totalCount: results.length,
    };
  }, [results, filters, decisionType, locale]);

  // Use normalized state for SearchModal
  const initialSearchState: Partial<SearchState> = searchState;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "T12:00:00");
    return date.toLocaleDateString(locale === "pt" ? "pt-BR" : "en-US", {
      day: "numeric",
      month: "short",
    }).replace(".", "");
  };

  function handleSearch(state: SearchState) {
    const normalizedState = normalizeSearchState(state);
    const queryString = serializeSearchState(normalizedState);
    router.replace(`/resultados?${queryString}`);
  }

  function handleFlightClick(flight: FlightResult) {
    const urlParams = new URLSearchParams();
    
    if (sessionId) {
      urlParams.set("sid", sessionId);
    }
    
    if (from) urlParams.set("from", from);
    if (to) urlParams.set("to", to);
    if (depart) urlParams.set("depart", depart);
    if (returnDate) urlParams.set("return", returnDate);
    
    const url = urlParams.toString()
      ? `/voos/${flight.id}?${urlParams.toString()}`
      : `/voos/${flight.id}`;
    router.push(url);
  }

  function handleRetry() {
    if (retryCountdown > 0) return;
    performSearch();
  }

  function handleEditSearch() {
    setShowEditModal(true);
  }

  function handleClearFilter(key: keyof FilterState) {
    setFilters(prev => ({
      ...prev,
      [key]: key === "stops" ? "all" : key === "departureTime" ? "all" : key === "airlines" ? [] : null,
    }));
  }

  const isRateLimited = errorInfo?.code === "RATE_LIMITED";
  const hasResults = !isLoading && !errorInfo && displayFlights.length > 0;
  const filteredCount = displayFlights.length;
  const isFiltered = filteredCount < totalCount;

  return (
    <>
      <BackgroundWaves />
      
      <div className="min-h-screen relative">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-cream/80 dark:bg-cream/90 backdrop-blur-md border-b border-cream-dark/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <LogoMark className="w-6 h-6" />
                <Wordmark className="text-lg hidden sm:block" />
              </Link>

              <div className="flex items-center gap-3 sm:gap-6">
                <div className="text-center">
                  <div className="text-sm sm:text-base text-ink lowercase">
                    {searchState.from?.city || from} → {searchState.to?.city || to}
                  </div>
                  <div className="text-xs text-ink-muted">
                    {formatDate(depart)}
                    {returnDate && ` – ${formatDate(returnDate)}`}
                  </div>
                </div>

                <button
                  onClick={handleEditSearch}
                  className="text-sm text-blue hover:text-blue-soft transition-colors lowercase"
                >
                  {t.results.edit}
                </button>

                <div className="hidden sm:flex items-center gap-1">
                  <LanguageToggle />
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Layout em 2 colunas */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-16">
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Sidebar (desktop only) */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-4">
                {/* Filtros */}
                {hasResults && (
                  <FiltersSidebar
                    flights={results}
                    filters={filters}
                    onFiltersChange={setFilters}
                  />
                )}

                {/* Alerta de preço */}
                {hasResults && (
                  <PriceAlertCTA 
                    route={`${searchState.from?.city || from} → ${searchState.to?.city || to}`}
                  />
                )}
              </div>
            </aside>

            {/* Conteúdo Principal */}
            <div className="flex-1 min-w-0">
              {/* Header da lista */}
              <div className="mb-4">
                <h1 className="text-lg sm:text-xl font-medium text-ink lowercase">
                  {t.results.flightsTo} {searchState.to?.city || to}
                </h1>
                <p className="text-ink-muted text-sm mt-1">
                  {isLoading 
                    ? t.results.searching
                    : errorInfo
                      ? t.results.errorTitle
                      : displayFlights.length === 0
                        ? t.results.noResults
                        : humanMessage
                  }
                </p>
              </div>

              {/* Decision Summary (sempre visível se houver resultados) */}
              {hasResults && (
                <DecisionSummary 
                  flights={results}
                  activeType={decisionType}
                  onTypeChange={setDecisionType}
                />
              )}

              {/* Mobile: botão de filtros + alerta */}
              {hasResults && (
                <div className="lg:hidden mb-4 flex items-center gap-3">
                  <button
                    onClick={() => setShowFiltersDrawer(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors"
                    style={{ background: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--ink)" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 4H14M4 8H12M6 12H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span>filtros</span>
                    {isFiltered && (
                      <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center" style={{ background: "var(--blue)", color: "var(--cream-soft)" }}>
                        {Object.values(filters).filter(v => v !== "all" && v !== null && (Array.isArray(v) ? v.length > 0 : true)).length}
                      </span>
                    )}
                  </button>
                  
                  <span className="text-sm text-ink-muted">
                    {isFiltered 
                      ? `${filteredCount} de ${totalCount}`
                      : `${totalCount} ${locale === "pt" ? "voos" : "flights"}`
                    }
                  </span>
                </div>
              )}

              {/* Chips de filtros ativos */}
              {hasResults && (
                <ActiveFiltersChips filters={filters} onClear={handleClearFilter} />
              )}

              {/* Estados ou Lista de voos */}
              {isLoading ? (
                <LoadingSkeleton />
              ) : isRateLimited && errorInfo ? (
                <RateLimitState 
                  error={errorInfo}
                  onRetry={handleRetry}
                  onEditSearch={handleEditSearch}
                  retryCountdown={retryCountdown}
                />
              ) : errorInfo ? (
                <ErrorState 
                  error={errorInfo}
                  onRetry={handleRetry} 
                  onEditSearch={handleEditSearch}
                />
              ) : displayFlights.length === 0 ? (
                <EmptyState onEditSearch={handleEditSearch} />
              ) : (
                <div className="space-y-3">
                  {displayFlights.map((flight, index) => {
                    const bestOfferInfo = flight.label === "best_balance"
                      ? { 
                          explanation: t.results.bestOfferExplanation,
                          priceDifference: calculateAveragePrice(results) - flight.price,
                        }
                      : null;
                    
                    return (
                      <div 
                        key={flight.id} 
                        id={`flight-${flight.id}`} 
                        className="transition-all duration-300"
                      >
                        <FlightCard 
                          flight={flight} 
                          onClick={() => handleFlightClick(flight)}
                          label={flight.label}
                          priceContext={flight.priceContext}
                          isHighlighted={index === 0 && decisionType === "best_balance"}
                          bestOfferInfo={bestOfferInfo}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        initialState={initialSearchState}
        onSearch={handleSearch}
      />

      {/* Mobile Filters Drawer */}
      {showFiltersDrawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowFiltersDrawer(false)}
          />
          
          {/* Drawer */}
          <div 
            className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-2xl p-4"
            style={{ background: "var(--cream)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-ink">filtros</h2>
              <button
                onClick={() => setShowFiltersDrawer(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "var(--cream-dark)" }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            
            <FiltersSidebar
              flights={results}
              filters={filters}
              onFiltersChange={(newFilters) => {
                setFilters(newFilters);
              }}
              className="border-0 p-0"
            />
            
            <div className="mt-6 pt-4 border-t" style={{ borderColor: "var(--cream-dark)" }}>
              <button
                onClick={() => setShowFiltersDrawer(false)}
                className="w-full py-3 rounded-xl text-sm font-medium transition-colors"
                style={{ background: "var(--blue)", color: "var(--cream-soft)" }}
              >
                {locale === "pt" 
                  ? `ver ${filteredCount} ${filteredCount === 1 ? "voo" : "voos"}`
                  : `see ${filteredCount} ${filteredCount === 1 ? "flight" : "flights"}`
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================================
// Page Export
// ============================================================================

export default function ResultadosPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream)" }}>
        <div className="text-ink-muted">carregando...</div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
