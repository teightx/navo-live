"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { BackgroundWaves } from "@/components/ui";
import { SearchBar } from "@/components/searchbar";
import { ResultsFilters, type FilterType } from "@/components/results";
import { useI18n } from "@/lib/i18n";

// Resultados mockados
const MOCK_FLIGHTS = [
  {
    id: "1",
    airline: "LATAM",
    departure: "06:30",
    arrival: "08:45",
    duration: "2h 15min",
    stops: 0,
    price: 890,
  },
  {
    id: "2",
    airline: "GOL",
    departure: "09:15",
    arrival: "11:20",
    duration: "2h 05min",
    stops: 0,
    price: 945,
  },
  {
    id: "3",
    airline: "Azul",
    departure: "14:00",
    arrival: "18:30",
    duration: "4h 30min",
    stops: 1,
    price: 720,
  },
];

export default function Home() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const [showResults, setShowResults] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("best");

  function handleSearch() {
    setShowResults(true);
  }

  function handleFlightClick(flightId: string) {
    router.push(`/voos/flight-${flightId}`);
  }

  // Ordenar voos baseado no filtro
  const sortedFlights = [...MOCK_FLIGHTS].sort((a, b) => {
    if (activeFilter === "price") return a.price - b.price;
    if (activeFilter === "duration") {
      const durA = parseInt(a.duration);
      const durB = parseInt(b.duration);
      return durA - durB;
    }
    // "best" - combina preço e duração
    return (a.price * 0.6 + parseInt(a.duration) * 40) - (b.price * 0.6 + parseInt(b.duration) * 40);
  });

  return (
    <>
      <BackgroundWaves />
      <Header />

      <main className="min-h-screen flex flex-col">
        <section className={`flex-1 flex flex-col items-center ${showResults ? "justify-start pt-24" : "justify-center"} px-4 sm:px-6 pt-24 pb-16`}>
          {!showResults && (
            <div className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium text-ink mb-4 tracking-tight">
                {t.home.headline}
              </h1>
              <p className="text-ink-soft text-base sm:text-lg">
                {t.home.subheadline}
              </p>
            </div>
          )}

          <SearchBar 
            mode={showResults ? "compact" : "default"} 
            onSearch={handleSearch}
          />

          {/* Resultados mockados */}
          {showResults && (
            <div className="w-full max-w-4xl mt-8">
              {/* Filtros */}
              <div className="mb-6">
                <ResultsFilters 
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                />
              </div>

              {/* Lista de voos */}
              <div className="space-y-3">
                {sortedFlights.map((flight, index) => (
                  <div
                    key={flight.id}
                    onClick={() => handleFlightClick(flight.id)}
                    className="p-4 rounded-xl border transition-all duration-150 hover:shadow-md cursor-pointer"
                    style={{
                      background: "var(--card-bg)",
                      borderColor: index === 0 ? "var(--blue)" : "var(--card-border)",
                      boxShadow: index === 0 ? "0 0 0 1px var(--blue)" : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Airline */}
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-xs font-medium"
                          style={{ background: "var(--cream-dark)", color: "var(--ink-soft)" }}
                        >
                          {flight.airline.slice(0, 3).toUpperCase()}
                        </div>

                        {/* Times */}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-medium text-ink">{flight.departure}</span>
                            <span className="text-ink-muted">→</span>
                            <span className="text-lg font-medium text-ink">{flight.arrival}</span>
                          </div>
                          <div className="text-xs text-ink-muted mt-0.5">
                            {flight.duration} · {flight.stops === 0 
                              ? (locale === "pt" ? "direto" : "direct")
                              : `${flight.stops} ${locale === "pt" ? "parada" : "stop"}`
                            }
                          </div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="text-xl font-semibold" style={{ color: "var(--blue)" }}>
                          R$ {flight.price}
                        </div>
                        <div className="text-xs text-ink-muted">
                          {locale === "pt" ? "por pessoa" : "per person"}
                        </div>
                      </div>
                    </div>

                    {index === 0 && (
                      <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--cream-dark)" }}>
                        <span 
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ background: "var(--blue)", color: "var(--cream-soft)" }}
                        >
                          {activeFilter === "price" 
                            ? (locale === "pt" ? "menor preço" : "lowest price")
                            : activeFilter === "duration"
                              ? (locale === "pt" ? "mais rápido" : "fastest")
                              : (locale === "pt" ? "melhor opção" : "best value")
                          }
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Voltar */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowResults(false)}
                  className="text-sm text-ink-muted hover:text-ink transition-colors"
                >
                  ← {locale === "pt" ? "nova busca" : "new search"}
                </button>
              </div>
            </div>
          )}
        </section>

        <Footer />
      </main>
    </>
  );
}
