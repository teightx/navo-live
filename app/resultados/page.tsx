"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/brand";
import { Footer, ThemeToggle, LanguageToggle } from "@/components/layout";
import { BackgroundWaves, SearchModal } from "@/components/ui";
import { FlightCard } from "@/components/flights";
import { ResultsFilters, type FilterType } from "@/components/results";
import { generateResults, FlightResult } from "@/lib/mocks/results";
import { useI18n } from "@/lib/i18n";
import type { SearchState } from "@/lib/types/search";
import { parseSearchParams, normalizeSearchState, serializeSearchState } from "@/lib/utils/searchParams";

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div 
          key={i} 
          className="rounded-xl p-5 animate-pulse"
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

function EmptyState() {
  const { t } = useI18n();
  
  return (
    <div className="text-center py-16 px-4">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "var(--cream-dark)", opacity: 0.5 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-ink-muted">
          <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <h2 className="text-lg font-medium text-ink mb-2">{t.results.noFlightsFound}</h2>
      <p className="text-ink-muted text-sm max-w-xs mx-auto">
        {t.results.tryAdjusting}
      </p>
    </div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, locale } = useI18n();
  
  // Parse and normalize search state from URL
  const urlState = parseSearchParams(searchParams);
  const searchState = normalizeSearchState(urlState);
  
  const from = searchState.from?.code || "";
  const to = searchState.to?.code || "";
  const depart = searchState.departDate || "";
  const returnDate = searchState.returnDate || "";
  
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<FlightResult[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("best");

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setResults(generateResults(from, to));
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [from, to, depart, returnDate]);

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
    // Normalize and serialize to URL
    const normalizedState = normalizeSearchState(state);
    const queryString = serializeSearchState(normalizedState);
    router.push(`/resultados?${queryString}`);
  }

  function handleFlightClick(flight: FlightResult) {
    router.push(`/voos/${flight.id}`);
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
                : sortedResults.length === 0
                  ? t.results.noResults
                  : `${sortedResults.length} ${t.results.optionsFound}`
              }
            </p>
          </div>

          {/* Filtros */}
          {!isLoading && sortedResults.length > 0 && (
            <div className="mb-6">
              <ResultsFilters 
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />
            </div>
          )}

          {isLoading ? (
            <LoadingSkeleton />
          ) : sortedResults.length === 0 ? (
            <EmptyState />
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

          {!isLoading && sortedResults.length > 0 && (
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
