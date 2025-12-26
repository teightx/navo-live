"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/brand";
import { Footer, ThemeToggle, LanguageToggle } from "@/components/layout";
import { BackgroundWaves, SearchModal } from "@/components/ui";
import { FlightCard } from "@/components/flights";
import { ResultsFilters, type FilterType } from "@/components/results";
import { FlightResult } from "@/lib/mocks/flights";
import { mockSearch } from "@/lib/search/mockSearch";
import { useI18n } from "@/lib/i18n";
import type { SearchState } from "@/lib/types/search";
import { parseSearchParams, normalizeSearchState, serializeSearchState } from "@/lib/utils/searchParams";

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

function ErrorState({ onRetry }: { onRetry: () => void }) {
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
          <p className="text-xs text-ink-muted mb-4">{t.results.errorMessage}</p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue text-cream-soft rounded-lg text-xs font-medium lowercase hover:bg-blue-soft transition-colors"
          >
            {t.results.tryAgain}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, locale } = useI18n();
  
  // Parse and normalize search state from URL
  // Usar useMemo para estabilizar o objeto e evitar loop infinito
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
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("best");

  // Usar searchKey como dependência única para evitar loop infinito
  // searchState, forceEmpty e forceError são estáveis via useMemo/searchParams
  useEffect(() => {
    if (!from || !to) {
      setIsLoading(false);
      setResults([]);
      setError(null);
      return;
    }

    let cancelled = false;

    async function searchFlights() {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await mockSearch(searchState, {
          forceEmpty,
          forceError,
          delay: Math.random() * 300 + 600, // 600-900ms
        });
        
        if (!cancelled) {
          setResults(result.flights);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro desconhecido");
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    searchFlights();

    return () => {
      cancelled = true;
    };
    // searchKey já captura todas as mudanças relevantes (from, to, depart, returnDate, forceEmpty, forceError)
    // searchState é memoizado e só muda quando searchParams muda, que é capturado por searchKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKey]);

  // Ordenar resultados baseado no filtro
  const sortedResults = [...results].sort((a, b) => {
    if (activeFilter === "price") return a.price - b.price;
    if (activeFilter === "duration") {
      const durA = parseInt(a.duration);
      const durB = parseInt(b.duration);
      return durA - durB;
    }
    // "best" - combina preço e duração
    return (a.price * 0.6 + parseInt(a.duration) * 40) - (b.price * 0.6 + parseInt(b.duration) * 40);
  });

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
    // Remove flags de teste ao aplicar nova busca
    const normalizedState = normalizeSearchState(state);
    const queryString = serializeSearchState(normalizedState);
    router.replace(`/resultados?${queryString}`);
  }

  function handleFlightClick(flight: FlightResult) {
    // Preservar query params ao navegar para detalhes
    const currentParams = searchParams.toString();
    const url = currentParams 
      ? `/voos/${flight.id}?${currentParams}`
      : `/voos/${flight.id}`;
    router.push(url);
  }

  function handleRetry() {
    if (!searchState.from || !searchState.to) return;
    
    setIsLoading(true);
    setError(null);
    
    mockSearch(searchState, {
      forceEmpty,
      forceError,
      delay: Math.random() * 300 + 600,
    })
      .then((result) => {
        setResults(result.flights);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        setResults([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  const lowestPrice = sortedResults.length > 0 
    ? Math.min(...sortedResults.map(r => r.price)) 
    : 0;

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
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <LogoMark className="w-6 h-6" />
                <Wordmark className="text-lg" />
              </Link>

              <div className="flex items-center gap-4 sm:gap-6">
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
                  onClick={() => setShowEditModal(true)}
                  className="text-sm text-blue hover:text-blue-soft transition-colors lowercase"
                >
                  {t.results.edit}
                </button>

                <div className="hidden sm:flex items-center gap-1 ml-2">
                  <LanguageToggle />
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-medium text-ink lowercase">
              {t.results.flightsTo} {searchState.to?.city || to}
            </h1>
            <p className="text-ink-muted text-sm mt-1">
              {isLoading 
                ? t.results.searching
                : error
                  ? t.results.errorTitle
                  : sortedResults.length === 0
                    ? t.results.noResults
                    : `${sortedResults.length} ${t.results.optionsFound}`
              }
            </p>
          </div>

          {/* Filtros */}
          {!isLoading && !error && sortedResults.length > 0 && (
            <div className="mb-6">
              <ResultsFilters 
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />
            </div>
          )}

          {/* Estados */}
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorState onRetry={handleRetry} />
          ) : sortedResults.length === 0 ? (
            <EmptyState onEditSearch={() => setShowEditModal(true)} />
          ) : (
            <div className="space-y-3">
              {sortedResults.map((flight, index) => (
                <div
                  key={flight.id}
                  style={{
                    borderColor: index === 0 ? "var(--blue)" : undefined,
                    boxShadow: index === 0 ? "0 0 0 1px var(--blue)" : undefined,
                  }}
                >
                  <FlightCard 
                    flight={flight} 
                    onClick={() => handleFlightClick(flight)}
                  />
                </div>
              ))}
            </div>
          )}

          {!isLoading && !error && sortedResults.length > 0 && (
            <div 
              className="mt-10 p-6 rounded-2xl text-center"
              style={{
                background: "var(--card-bg)",
                backdropFilter: "blur(8px)",
                border: "1px solid var(--card-border)",
              }}
            >
              <p className="text-ink-soft mb-4 lowercase">
                {t.results.dontWantToCheck}
              </p>
              <button
                onClick={() => console.log("criar alerta:", { from, to, lowestPrice })}
                className="px-6 py-3 bg-blue text-cream-soft rounded-xl text-sm font-medium lowercase hover:bg-blue-soft transition-colors"
              >
                {t.results.createAlert}
              </button>
            </div>
          )}
        </main>

        <Footer />
      </div>

      <SearchModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        initialState={initialSearchState}
        onSearch={handleSearch}
      />
    </>
  );
}

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
