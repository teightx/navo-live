"use client";

import { FlightResult, formatPrice } from "@/lib/mocks/results";

interface FlightCardProps {
  flight: FlightResult;
  onClick: () => void;
}

const AIRLINE_COLORS: Record<string, string> = {
  latam: "#E4002B",
  tap: "#00B2A9",
  azul: "#0033A0",
  iberia: "#D30032",
  "air france": "#002157",
  gol: "#FF6600",
  lufthansa: "#05164D",
};

function AirlineLogo({ airline, code }: { airline: string; code: string }) {
  const color = AIRLINE_COLORS[airline] || "#4f7386";
  
  return (
    <div 
      className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {code}
    </div>
  );
}

export function FlightCard({ flight, onClick }: FlightCardProps) {
  const isDirect = flight.stops === "direto";
  
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-xl border border-cream-dark bg-white/80 backdrop-blur-sm hover:border-blue-soft hover:shadow-lg transition-all duration-200"
    >
      {/* Header contextual */}
      {flight.co2 && (
        <div className={`px-4 py-2 text-xs font-medium rounded-t-xl ${
          flight.co2.startsWith("-") 
            ? "bg-sage/10 text-sage" 
            : "bg-accent/10 text-accent"
        }`}>
          {flight.co2}
        </div>
      )}

      {/* Corpo principal */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          
          {/* Coluna 1: Companhia */}
          <div className="flex items-center gap-3 sm:w-32 sm:flex-shrink-0">
            <AirlineLogo airline={flight.airline} code={flight.airlineCode} />
            <div className="sm:hidden">
              <div className="text-sm font-medium text-ink capitalize">
                {flight.airline}
              </div>
              <div className="text-xs text-ink-muted">
                {flight.duration}
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-ink capitalize">
                {flight.airline}
              </div>
            </div>
          </div>

          {/* Coluna 2: Itinerário */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {/* Partida */}
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-2xl font-semibold text-ink">
                  {flight.departure}
                </div>
              </div>

              {/* Linha de trajeto */}
              <div className="flex-1 flex flex-col items-center px-2">
                <div className="text-[10px] text-ink-muted mb-1 hidden sm:block">
                  {flight.duration}
                </div>
                <div className="w-full relative">
                  <div className="h-px bg-cream-dark" />
                  {/* Indicadores de escala */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-blue bg-white" />
                  {!isDirect && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-ink-muted" />
                  )}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-blue bg-white" />
                </div>
                <div className={`text-[10px] mt-1 ${isDirect ? "text-sage" : "text-ink-muted"}`}>
                  {isDirect ? "direto" : flight.stops}
                  {flight.stopsCities && flight.stopsCities.length > 0 && (
                    <span className="hidden sm:inline"> · {flight.stopsCities.join(", ")}</span>
                  )}
                </div>
              </div>

              {/* Chegada */}
              <div className="text-center sm:text-right">
                <div className="text-xl sm:text-2xl font-semibold text-ink">
                  {flight.arrival}
                  {flight.nextDayArrival && (
                    <sup className="text-[10px] text-ink-muted ml-0.5">+1</sup>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Coluna 3: Preço e CTA */}
          <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:w-36 sm:flex-shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 sm:border-l border-cream-dark sm:pl-4">
            <div className="text-right">
              <div className="text-xs text-ink-muted">
                {flight.offersCount} {flight.offersCount === 1 ? "oferta" : "ofertas"} a partir de
              </div>
              <div className="text-xl sm:text-2xl font-bold text-ink group-hover:text-blue transition-colors">
                {formatPrice(flight.price)}
              </div>
            </div>
            
            <button
              className="px-4 py-2 rounded-lg bg-blue text-cream-soft text-sm font-medium hover:bg-blue-soft transition-colors"
            >
              ver ofertas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

