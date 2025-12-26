"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/brand";
import { Footer, ThemeToggle, LanguageToggle } from "@/components/layout";
import { BackgroundWaves, SearchModal } from "@/components/ui";
import { FlightCard } from "@/components/flights";
import { getAirportByCode } from "@/lib/mocks/airports";
import { generateResults, FlightResult } from "@/lib/mocks/results";
import type { SearchState, TripType, CabinClass } from "@/lib/types/search";
import { defaultSearchState } from "@/lib/types/search";

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div 
          key={i} 
          className="bg-white/50 border border-cream-dark rounded-xl p-5 animate-pulse"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-cream-dark rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-4">
                <div className="h-6 w-16 bg-cream-dark rounded" />
                <div className="flex-1 h-px bg-cream-dark" />
                <div className="h-6 w-16 bg-cream-dark rounded" />
              </div>
              <div className="h-3 w-24 bg-cream-dark rounded mx-auto" />
            </div>
            <div className="space-y-2 text-right">
              <div className="h-6 w-20 bg-cream-dark rounded" />
              <div className="h-8 w-24 bg-cream-dark rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cream-dark/50 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-ink-muted">
          <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <h2 className="text-lg font-medium text-ink mb-2">nenhum voo encontrado</h2>
      <p className="text-ink-muted text-sm max-w-xs mx-auto">
        tente ajustar as datas ou escolher outros aeroportos para encontrar mais opções
      </p>
    </div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const depart = searchParams.get("depart") || "";
  const returnDate = searchParams.get("return") || "";
  const tripType = (searchParams.get("tripType") as TripType) || "roundtrip";
  const adults = parseInt(searchParams.get("adults") || "1", 10);
  const children = parseInt(searchParams.get("children") || "0", 10);
  const infants = parseInt(searchParams.get("infants") || "0", 10);
  const cabin = (searchParams.get("cabin") as CabinClass) || "economy";

  const originAirport = getAirportByCode(from);
  const destAirport = getAirportByCode(to);
  
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<FlightResult[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setResults(generateResults(from, to));
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [from, to, depart, returnDate]);

  const initialSearchState: Partial<SearchState> = {
    ...defaultSearchState,
    from: originAirport || null,
    to: destAirport || null,
    departDate: depart || null,
    returnDate: returnDate || null,
    tripType,
    pax: { adults, children, infants },
    cabinClass: cabin,
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "T12:00:00");
    return date.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "short",
    }).replace(".", "");
  };

  function handleSearch(state: SearchState) {
    const params = new URLSearchParams({
      from: state.from!.code,
      to: state.to!.code,
      depart: state.departDate!,
      tripType: state.tripType,
      adults: String(state.pax.adults),
      children: String(state.pax.children),
      infants: String(state.pax.infants),
      cabin: state.cabinClass,
    });

    if (state.returnDate) {
      params.set("return", state.returnDate);
    }

    router.push(`/resultados?${params.toString()}`);
  }

  function handleFlightClick(flight: FlightResult) {
    router.push(`/voos/${flight.id}`);
  }

  const lowestPrice = results.length > 0 
    ? Math.min(...results.map(r => r.price)) 
    : 0;

  return (
    <>
      <BackgroundWaves />
      
      <div className="min-h-screen relative">
        <header className="sticky top-0 z-50 bg-cream/90 dark:bg-cream/95 backdrop-blur-sm border-b border-cream-dark/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <LogoMark className="w-6 h-6" />
                <Wordmark className="text-lg" />
              </Link>

              <div className="flex items-center gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="text-sm sm:text-base text-ink lowercase">
                    {originAirport?.city || from} → {destAirport?.city || to}
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
                  editar
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
              voos para {destAirport?.city || to}
            </h1>
            <p className="text-ink-muted text-sm mt-1">
              {isLoading 
                ? "buscando melhores ofertas..." 
                : results.length === 0
                  ? "nenhum resultado"
                  : `${results.length} opções encontradas`
              }
            </p>
          </div>

          {isLoading ? (
            <LoadingSkeleton />
          ) : results.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {results.map((flight) => (
                <FlightCard 
                  key={flight.id} 
                  flight={flight} 
                  onClick={() => handleFlightClick(flight)}
                />
              ))}
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div 
              className="mt-10 p-6 rounded-2xl text-center"
              style={{
                background: "rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.4)",
              }}
            >
              <p className="text-ink-soft mb-4 lowercase">
                não quer verificar todo dia?
              </p>
              <button
                onClick={() => console.log("criar alerta:", { from, to, lowestPrice })}
                className="px-6 py-3 bg-blue text-cream-soft rounded-xl text-sm font-medium lowercase hover:bg-blue-soft transition-colors"
              >
                criar alerta de preço
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
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-ink-muted">carregando...</div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
