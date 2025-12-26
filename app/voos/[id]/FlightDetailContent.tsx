"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/brand";
import { Footer, ThemeToggle, LanguageToggle } from "@/components/layout";
import { BackgroundWaves } from "@/components/ui";
import { getFlightById, formatPrice, FlightResult } from "@/lib/mocks/flights";
import { useI18n } from "@/lib/i18n";

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
      <div className="h-40 rounded-xl" style={{ background: "var(--cream-dark)", opacity: 0.3 }} />
      <div className="h-6 w-48 rounded" style={{ background: "var(--cream-dark)", opacity: 0.3 }} />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 rounded-xl" style={{ background: "var(--cream-dark)", opacity: 0.3 }} />
        ))}
      </div>
    </div>
  );
}

export function FlightDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { t, locale } = useI18n();
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

  // Textos traduzidos
  const texts = {
    back: locale === "pt" ? "voltar" : "back",
    departure: locale === "pt" ? "partida" : "departure",
    arrival: locale === "pt" ? "chegada" : "arrival",
    from: locale === "pt" ? "a partir de" : "from",
    compare: locale === "pt" ? "comparar em" : "compare on",
    sites: locale === "pt" ? "sites" : "sites",
    lowestPrice: locale === "pt" ? "menor preço" : "lowest price",
    pricesNote: locale === "pt" 
      ? "preços sujeitos a alteração · verifique no site do parceiro" 
      : "prices subject to change · check on partner site",
    notFound: locale === "pt" ? "voo não encontrado" : "flight not found",
    backHome: locale === "pt" ? "voltar para home" : "back to home",
    direct: locale === "pt" ? "direto" : "direct",
  };

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
                  onClick={() => router.back()}
                  className="text-sm text-blue hover:text-blue-soft transition-colors lowercase flex items-center gap-1"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {texts.back}
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
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: "var(--blue)", color: "var(--cream-soft)" }}
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
                    <div className="text-sm text-ink-muted">{texts.departure}</div>
                  </div>

                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-full relative py-2">
                      <div className="h-px" style={{ background: "var(--cream-dark)" }} />
                      <div 
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-blue"
                        style={{ background: "var(--card-bg)" }}
                      />
                      <div 
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-blue"
                        style={{ background: "var(--card-bg)" }}
                      />
                    </div>
                    <div className={`text-xs ${flight.stops === "direto" || flight.stops === "direct" ? "text-sage" : "text-ink-muted"}`}>
                      {flight.stops === "direto" || flight.stops === "direct" ? texts.direct : flight.stops}
                      {flight.stopsCities && ` · ${flight.stopsCities.join(", ")}`}
                    </div>
                  </div>

                  <div className="flex-1 text-right">
                    <div className="text-3xl font-semibold text-ink">
                      {flight.arrival}
                      {flight.nextDayArrival && <sup className="text-xs text-ink-muted ml-1">+1</sup>}
                    </div>
                    <div className="text-sm text-ink-muted">{texts.arrival}</div>
                  </div>
                </div>

                <div className="text-center pt-4 border-t" style={{ borderColor: "var(--cream-dark)" }}>
                  <span className="text-sm text-ink-muted">{texts.from} </span>
                  <span className="text-2xl font-bold text-blue">{formatPrice(lowestPrice)}</span>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-medium text-ink lowercase mb-4">
                  {texts.compare} {partnerPrices.length} {texts.sites}
                </h2>

                <div className="space-y-2">
                  {partnerPrices.map((partner, index) => (
                    <a
                      key={partner.id}
                      href={`https://${partner.id}.com`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-4 p-4 rounded-xl border transition-all duration-150"
                      style={{
                        background: index === 0 ? "var(--sage-light, rgba(181, 201, 163, 0.1))" : "var(--card-bg)",
                        borderColor: index === 0 ? "var(--sage)" : "var(--card-border)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-semibold"
                          style={{
                            background: index === 0 ? "var(--sage)" : "var(--cream-dark)",
                            color: index === 0 ? "var(--cream-soft)" : "var(--ink-soft)",
                          }}
                        >
                          {partner.logo}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-ink">{partner.name}</div>
                          {index === 0 && <div className="text-xs text-sage">{texts.lowestPrice}</div>}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div 
                          className="text-lg font-semibold"
                          style={{ color: index === 0 ? "var(--sage)" : "var(--ink)" }}
                        >
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
                {texts.pricesNote}
              </p>
            </>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-lg font-medium text-ink mb-2">{texts.notFound}</h2>
              <Link href="/" className="text-blue hover:text-blue-soft transition-colors">
                {texts.backHome}
              </Link>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
