"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/brand";
import { getAirportByCode } from "@/lib/mocks/airports";
import { generateResults, formatPrice, FlightResult } from "@/lib/mocks/results";

function ResultsContent() {
  const searchParams = useSearchParams();
  
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const depart = searchParams.get("depart") || "";
  const returnDate = searchParams.get("return") || "";

  const originAirport = getAirportByCode(from);
  const destAirport = getAirportByCode(to);
  const results = generateResults(from, to);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "T12:00:00");
    return date.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "short",
    }).replace(".", "");
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header fixo */}
      <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-cream-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
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

              <Link
                href="/"
                className="text-sm text-blue hover:text-blue-soft transition-colors lowercase"
              >
                editar
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Título */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-medium text-ink lowercase">
            voos para {destAirport?.city || to}
          </h1>
          <p className="text-ink-muted text-sm mt-1">
            {results.length} opções encontradas
          </p>
        </div>

        {/* Lista de resultados */}
        <div className="space-y-4">
          {results.map((flight) => (
            <FlightCard key={flight.id} flight={flight} />
          ))}
        </div>

        {/* CTA Alerta */}
        <div className="mt-10 p-6 bg-white/60 backdrop-blur-sm border border-cream-dark rounded-2xl text-center">
          <p className="text-ink-soft mb-4 lowercase">
            não quer acompanhar todo dia?
          </p>
          <button
            onClick={() => {
              console.log("criar alerta:", {
                from,
                to,
                depart,
                returnDate,
                lowestPrice: Math.min(...results.map((r) => r.price)),
              });
            }}
            className="px-6 py-3 bg-blue text-white rounded-xl text-sm font-medium lowercase hover:bg-blue-soft transition-colors"
          >
            criar alerta
          </button>
        </div>
      </main>
    </div>
  );
}

function FlightCard({ flight }: { flight: FlightResult }) {
  return (
    <button
      onClick={() => console.log("selecionado:", flight)}
      className="w-full bg-white border border-cream-dark rounded-xl p-5 sm:p-6 text-left hover:border-blue-muted transition-colors group"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Esquerda: companhia e horários */}
        <div className="flex-1">
          <div className="text-sm text-ink-muted lowercase mb-2">
            {flight.airline}
          </div>
          
          <div className="flex items-center gap-3">
            <div>
              <div className="text-lg font-medium text-ink">
                {flight.departure}
              </div>
              <div className="text-xs text-ink-muted">partida</div>
            </div>
            
            <div className="flex-1 px-3">
              <div className="h-px bg-cream-dark relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cream px-2">
                  <span className="text-xs text-ink-muted">{flight.duration}</span>
                </div>
              </div>
              <div className="text-center mt-1">
                <span className="text-xs text-ink-muted lowercase">{flight.stops}</span>
              </div>
            </div>
            
            <div>
              <div className="text-lg font-medium text-ink">
                {flight.arrival}
              </div>
              <div className="text-xs text-ink-muted">chegada</div>
            </div>
          </div>
        </div>

        {/* Direita: preço */}
        <div className="text-right">
          <div className="text-xl sm:text-2xl font-medium text-ink group-hover:text-blue transition-colors">
            {formatPrice(flight.price)}
          </div>
          <div className="text-xs text-ink-muted">por pessoa</div>
        </div>
      </div>
    </button>
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

