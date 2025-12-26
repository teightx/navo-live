"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/brand";
import { BackgroundWaves } from "@/components/ui";
import { getFlightById, formatPrice, FlightResult } from "@/lib/mocks/results";

const PARTNERS = [
  { id: "decolar", name: "Decolar", logo: "D" },
  { id: "maxmilhas", name: "MaxMilhas", logo: "M" },
  { id: "google", name: "Google Flights", logo: "G" },
  { id: "kayak", name: "Kayak", logo: "K" },
  { id: "skyscanner", name: "Skyscanner", logo: "S" },
];

function generatePartnerPrices(basePrice: number) {
  return PARTNERS.map((partner, i) => ({
    ...partner,
    price: Math.round(basePrice * (0.95 + i * 0.03)),
  })).sort((a, b) => a.price - b.price);
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-40 bg-cream-dark/30 rounded-xl" />
      <div className="h-6 w-48 bg-cream-dark/30 rounded" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-cream-dark/30 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function FlightDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [flight, setFlight] = useState<FlightResult | null>(null);
  const [partnerPrices, setPartnerPrices] = useState<ReturnType<typeof generatePartnerPrices>>([]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const flightData = getFlightById(id);
      setFlight(flightData);
      if (flightData) {
        setPartnerPrices(generatePartnerPrices(flightData.price));
      }
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [id]);

  const lowestPrice = partnerPrices.length > 0 ? partnerPrices[0].price : 0;

  return (
    <>
      <BackgroundWaves />

      <div className="min-h-screen relative">
        <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-sm border-b border-cream-dark">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <LogoMark className="w-6 h-6" />
                <Wordmark className="text-lg" />
              </Link>

              <button
                onClick={() => router.back()}
                className="text-sm text-blue hover:text-blue-soft transition-colors lowercase flex items-center gap-1"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                voltar
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {isLoading ? (
            <LoadingSkeleton />
          ) : flight ? (
            <>
              <div 
                className="rounded-2xl p-6 mb-8"
                style={{
                  background: "rgba(255, 255, 255, 0.75)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.5)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06)",
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                      style={{ backgroundColor: "#4f7386" }}
                    >
                      {flight.airlineCode}
                    </div>
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
                    <div className="text-sm text-ink-muted">partida</div>
                  </div>

                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-full relative py-2">
                      <div className="h-px bg-cream-dark" />
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-blue bg-white" />
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-blue bg-white" />
                    </div>
                    <div className={`text-xs ${flight.stops === "direto" ? "text-sage" : "text-ink-muted"}`}>
                      {flight.stops}
                      {flight.stopsCities && ` · ${flight.stopsCities.join(", ")}`}
                    </div>
                  </div>

                  <div className="flex-1 text-right">
                    <div className="text-3xl font-semibold text-ink">
                      {flight.arrival}
                      {flight.nextDayArrival && <sup className="text-xs text-ink-muted ml-1">+1</sup>}
                    </div>
                    <div className="text-sm text-ink-muted">chegada</div>
                  </div>
                </div>

                <div className="text-center pt-4 border-t border-cream-dark/50">
                  <span className="text-sm text-ink-muted">a partir de </span>
                  <span className="text-2xl font-bold text-blue">{formatPrice(lowestPrice)}</span>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-medium text-ink lowercase mb-4">
                  comparar em {partnerPrices.length} sites
                </h2>

                <div className="space-y-2">
                  {partnerPrices.map((partner, index) => (
                    <a
                      key={partner.id}
                      href={`https://${partner.id}.com`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-all duration-150 ${
                        index === 0 
                          ? "bg-sage/5 border-sage/20 hover:border-sage" 
                          : "bg-white/60 border-cream-dark hover:border-blue-soft"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-semibold ${
                          index === 0 ? "bg-sage text-white" : "bg-cream-dark text-ink-soft"
                        }`}>
                          {partner.logo}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-ink">{partner.name}</div>
                          {index === 0 && <div className="text-xs text-sage">menor preço</div>}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className={`text-lg font-semibold ${index === 0 ? "text-sage" : "text-ink"}`}>
                          {formatPrice(partner.price)}
                        </div>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-ink-muted">
                          <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <p className="text-center text-xs text-ink-muted">
                preços sujeitos a alteração · verifique no site do parceiro
              </p>
            </>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-lg font-medium text-ink mb-2">voo não encontrado</h2>
              <Link href="/" className="text-blue hover:text-blue-soft transition-colors">
                voltar para home
              </Link>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
