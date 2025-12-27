"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { serializeSearchState } from "@/lib/utils/searchParams";
import { defaultSearchState } from "@/lib/types/search";
import { getAirportByCode } from "@/lib/airports";
import { findNearestAirport, getAllAirports, type AirportLocation } from "@/lib/geo/nearestAirport";

// ============================================================================
// Feature Flag
// ============================================================================

const SMART_ROUTES_ENABLED =
  process.env.NEXT_PUBLIC_SMART_ROUTES !== "false"; // Default: true

// ============================================================================
// Types
// ============================================================================

// Simple mode types (current)
interface PopularRouteCard {
  id: string;
  from: string;
  to: string;
  title: string;
  subtitle: string;
  routeLabel: string;
  price?: number;
  sampleCount: number;
  lastUpdated?: string;
  hasReliableData: boolean;
}

interface PopularApiResponse {
  routes: PopularRouteCard[];
  meta: {
    fetchedAt: string;
    minSamplesRequired: number;
  };
  requestId: string;
}

// Smart mode types (new)
interface SmartRouteCard {
  id: string;
  from: string;
  fromCity: string;
  to: string;
  toCity: string;
  toCountry: string;
  holidayName: string;
  holidayKey: string;
  departDate: string;
  returnDate: string;
  tripDays: number;
  price?: number;
  sampleCount: number;
  hasReliableData: boolean;
}

interface SmartApiResponse {
  routes: SmartRouteCard[];
  origin: {
    code: string;
    city: string;
  };
  holidays: {
    key: string;
    name: string;
    startDate: string;
    endDate: string;
  }[];
  meta: {
    fetchedAt: string;
    minSamplesRequired: number;
  };
  requestId: string;
}

// ============================================================================
// LocalStorage Keys
// ============================================================================

const LAST_ORIGIN_KEY = "navo_last_origin";

function getLastOrigin(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(LAST_ORIGIN_KEY);
  } catch {
    return null;
  }
}

function setLastOrigin(code: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAST_ORIGIN_KEY, code.toUpperCase());
  } catch {
    // Ignore storage errors
  }
}

// ============================================================================
// Utility
// ============================================================================

function formatPrice(price: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatShortDate(dateStr: string, locale: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString(locale === "pt" ? "pt-BR" : "en-US", {
    day: "numeric",
    month: "short",
  }).replace(".", "");
}

// ============================================================================
// Simple Mode Components (existing behavior)
// ============================================================================

interface SimpleRouteCardProps {
  route: PopularRouteCard;
  onClick: () => void;
}

function SimpleRouteCard({ route, onClick }: SimpleRouteCardProps) {
  const { locale } = useI18n();

  const badgeText = locale === "pt" ? "rota popular" : "popular route";
  const fromText = locale === "pt" ? "a partir de" : "from";
  const viewFlightsText = locale === "pt" ? "ver voos" : "view flights";

  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-xl border transition-all duration-200 hover:border-blue-soft hover:shadow-md"
      style={{
        background: "var(--card-bg)",
        borderColor: "var(--card-border)",
      }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="text-sm font-medium text-ink capitalize mb-1">
              {route.title}
            </div>
            <div className="text-xs text-ink-muted capitalize">
              {route.subtitle}
            </div>
          </div>

          <div
            className="px-2 py-0.5 rounded-full text-[10px] font-medium ml-2 flex-shrink-0"
            style={{
              background: "var(--sage)",
              color: "var(--cream-soft)",
              opacity: 0.9,
            }}
          >
            {badgeText}
          </div>
        </div>

        {/* Price - only show if we have data */}
        <div className="flex items-baseline gap-2 mb-3 min-h-[28px]">
          {route.price !== undefined && (
            <>
              <span className="text-xs text-ink-muted lowercase">{fromText}</span>
              <span className="text-xl font-bold text-blue">
                {formatPrice(route.price)}
              </span>
            </>
          )}
        </div>

        <div
          className="flex items-center justify-between pt-2 border-t"
          style={{ borderColor: "var(--cream-dark)" }}
        >
          <span className="text-xs text-ink-muted lowercase">{route.routeLabel}</span>
          <span
            className="text-xs font-medium lowercase transition-colors group-hover:text-blue"
            style={{ color: "var(--ink)" }}
          >
            {viewFlightsText}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className="inline-block ml-1"
              style={{ color: "var(--ink-muted)" }}
            >
              <path
                d="M4.5 9L7.5 6L4.5 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>
    </button>
  );
}

// ============================================================================
// Smart Mode Components (new holiday-based)
// ============================================================================

interface SmartRouteCardProps {
  route: SmartRouteCard;
  onClick: () => void;
}

function SmartRouteCardComponent({ route, onClick }: SmartRouteCardProps) {
  const { locale } = useI18n();

  const fromText = locale === "pt" ? "a partir de" : "from";
  const viewFlightsText = locale === "pt" ? "ver voos" : "view flights";

  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-xl border transition-all duration-200 hover:border-blue-soft hover:shadow-md"
      style={{
        background: "var(--card-bg)",
        borderColor: "var(--card-border)",
      }}
    >
      <div className="p-4">
        {/* Destination */}
        <div className="mb-3">
          <div className="text-sm font-medium text-ink capitalize mb-1">
            {route.toCity}
          </div>
          <div className="text-xs text-ink-muted capitalize">
            {route.toCountry}
          </div>
        </div>

        {/* Price - only show if we have data */}
        <div className="flex items-baseline gap-2 mb-3 min-h-[24px]">
          {route.price !== undefined && (
            <>
              <span className="text-xs text-ink-muted lowercase">{fromText}</span>
              <span className="text-lg font-bold text-blue">
                {formatPrice(route.price)}
              </span>
            </>
          )}
        </div>

        {/* CTA */}
        <div
          className="flex items-center justify-end pt-2 border-t"
          style={{ borderColor: "var(--cream-dark)" }}
        >
          <span
            className="text-xs font-medium lowercase transition-colors group-hover:text-blue"
            style={{ color: "var(--ink)" }}
          >
            {viewFlightsText}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className="inline-block ml-1"
              style={{ color: "var(--ink-muted)" }}
            >
              <path
                d="M4.5 9L7.5 6L4.5 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>
    </button>
  );
}

// ============================================================================
// Shared Components
// ============================================================================

function LoadingSkeleton() {
  return (
    <div
      className="rounded-xl border animate-pulse"
      style={{
        background: "var(--card-bg)",
        borderColor: "var(--card-border)",
      }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div
              className="h-4 w-24 rounded mb-2"
              style={{ background: "var(--cream-dark)" }}
            />
            <div
              className="h-3 w-16 rounded"
              style={{ background: "var(--cream-dark)" }}
            />
          </div>
          <div
            className="h-4 w-16 rounded-full"
            style={{ background: "var(--cream-dark)" }}
          />
        </div>
        <div
          className="h-6 w-28 rounded mb-3"
          style={{ background: "var(--cream-dark)" }}
        />
        <div
          className="h-3 w-full rounded"
          style={{ background: "var(--cream-dark)" }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function OpportunitiesSection() {
  const router = useRouter();
  const { locale } = useI18n();

  // State for simple mode
  const [simpleRoutes, setSimpleRoutes] = useState<PopularRouteCard[]>([]);

  // State for smart mode
  const [smartRoutes, setSmartRoutes] = useState<SmartRouteCard[]>([]);
  const [origin, setOrigin] = useState<{ code: string; city: string } | null>(null);
  const [detectedOrigin, setDetectedOrigin] = useState<string | null>(null);
  const [showOriginSelector, setShowOriginSelector] = useState(false);

  // Shared state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(true);

  // Determine which mode to use
  const isSmartMode = SMART_ROUTES_ENABLED;

  // Detect user location on mount
  useEffect(() => {
    async function detectLocation() {
      // Always try geolocation first (more accurate than cache)
      if (typeof navigator !== "undefined" && "geolocation" in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,
              timeout: 8000,
              maximumAge: 3600000, // 1h cache
            });
          });

          const nearest = findNearestAirport({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });

          setDetectedOrigin(nearest.code);
          setLastOrigin(nearest.code);
          setGeoLoading(false);
          return;
        } catch {
          // Geolocation failed or denied - continue to fallback
        }
      }

      // Fallback: check localStorage
      const savedOrigin = getLastOrigin();
      if (savedOrigin) {
        setDetectedOrigin(savedOrigin);
        setGeoLoading(false);
        return;
      }

      // Final fallback to GRU
      setDetectedOrigin("GRU");
      setGeoLoading(false);
    }

    detectLocation();
  }, []);

  // Fetch routes when origin is detected
  useEffect(() => {
    if (geoLoading || !detectedOrigin) return;

    async function fetchRoutes() {
      try {
        setLoading(true);
        setError(null);

        if (isSmartMode) {
          // Add timestamp to bust cache when origin changes
          const cacheKey = Math.floor(Date.now() / 60000); // Changes every minute
          const res = await fetch(`/api/routes/smart-popular?from=${detectedOrigin}&_t=${cacheKey}`);

          if (!res.ok) {
            throw new Error(`Failed to fetch: ${res.status}`);
          }

          const data: SmartApiResponse = await res.json();
          setSmartRoutes(data.routes);
          setOrigin(data.origin);
        } else {
          const res = await fetch("/api/routes/popular?limit=6", {
            next: { revalidate: 300 },
          });

          if (!res.ok) {
            throw new Error(`Failed to fetch: ${res.status}`);
          }

          const data: PopularApiResponse = await res.json();
          setSimpleRoutes(data.routes);
        }
      } catch (err) {
        console.error("Failed to fetch routes:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchRoutes();
  }, [isSmartMode, detectedOrigin, geoLoading]);

  // Handle origin change
  function handleOriginChange(newCode: string) {
    setDetectedOrigin(newCode);
    setLastOrigin(newCode);
    setShowOriginSelector(false);
  }

  // Handle simple route click
  function handleSimpleRouteClick(route: PopularRouteCard) {
    const originAirport = getAirportByCode(route.from);
    const destinationAirport = getAirportByCode(route.to);

    if (!originAirport || !destinationAirport) return;

    // Use a date 30 days from now as default
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const departureDateStr = futureDate.toISOString().split("T")[0];

    // Save origin for future smart mode
    setLastOrigin(route.from);

    const searchState = {
      ...defaultSearchState,
      from: originAirport,
      to: destinationAirport,
      departDate: departureDateStr,
      tripType: "oneway" as const,
    };

    const queryString = serializeSearchState(searchState);
    router.push(`/resultados?${queryString}`);
  }

  // Handle smart route click
  function handleSmartRouteClick(route: SmartRouteCard) {
    const originAirport = getAirportByCode(route.from);
    const destinationAirport = getAirportByCode(route.to);

    if (!originAirport || !destinationAirport) return;

    // Save origin for future
    setLastOrigin(route.from);

    const searchState = {
      ...defaultSearchState,
      from: originAirport,
      to: destinationAirport,
      departDate: route.departDate,
      returnDate: route.returnDate,
      tripType: "roundtrip" as const,
    };

    const queryString = serializeSearchState(searchState);
    router.push(`/resultados?${queryString}`);
  }

  // Header text based on mode
  const headerText = isSmartMode
    ? locale === "pt"
      ? "próximos feriados"
      : "upcoming holidays"
    : locale === "pt"
      ? "rotas populares"
      : "popular routes";

  const descriptionText = isSmartMode
    ? locale === "pt"
      ? `sugestões saindo de ${origin?.city || "são paulo"}`
      : `suggestions from ${origin?.city || "são paulo"}`
    : locale === "pt"
      ? "explore destinos populares saindo do brasil"
      : "explore popular destinations from brazil";

  const routes = isSmartMode ? smartRoutes : simpleRoutes;

  // Get airports for selector
  const allAirports = getAllAirports();

  const changeOriginText = locale === "pt" ? "trocar origem" : "change origin";

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl sm:text-2xl font-medium text-ink lowercase">
            {headerText}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-ink-muted">{descriptionText}</p>
          {isSmartMode && (
            <div className="relative">
              <button
                onClick={() => setShowOriginSelector(!showOriginSelector)}
                className="text-xs text-blue hover:text-blue-soft transition-colors lowercase"
              >
                {changeOriginText}
              </button>

              {/* Origin Selector Dropdown */}
              {showOriginSelector && (
                <div
                  className="absolute top-full left-0 mt-1 z-50 w-48 max-h-60 overflow-y-auto rounded-lg border shadow-lg"
                  style={{
                    background: "var(--card-bg)",
                    borderColor: "var(--card-border)",
                  }}
                >
                  {allAirports.map((airport) => (
                    <button
                      key={airport.code}
                      onClick={() => handleOriginChange(airport.code)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-cream-dark/30 transition-colors flex items-center justify-between"
                      style={{
                        background: airport.code === detectedOrigin ? "var(--cream-dark)" : undefined,
                      }}
                    >
                      <span className="capitalize text-ink">{airport.city}</span>
                      <span className="text-xs text-ink-muted">{airport.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      )}

      {/* Error state */}
      {error && null}

      {/* Empty state */}
      {!loading && !error && routes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-ink-muted">
            {locale === "pt"
              ? "nenhuma rota disponível no momento"
              : "no routes available at the moment"}
          </p>
        </div>
      )}

      {/* Smart mode: grouped by holiday */}
      {!loading && !error && isSmartMode && smartRoutes.length > 0 && (
        <div className="space-y-8">
          {/* Group routes by holiday */}
          {(() => {
            const groupedByHoliday = smartRoutes.reduce((acc, route) => {
              if (!acc[route.holidayKey]) {
                acc[route.holidayKey] = {
                  name: route.holidayName,
                  dates: `${formatShortDate(route.departDate, locale)} – ${formatShortDate(route.returnDate, locale)}`,
                  tripDays: route.tripDays,
                  routes: [],
                };
              }
              acc[route.holidayKey].routes.push(route);
              return acc;
            }, {} as Record<string, { name: string; dates: string; tripDays: number; routes: SmartRouteCard[] }>);

            return Object.entries(groupedByHoliday).map(([key, group]) => (
              <div key={key}>
                {/* Holiday header */}
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-base font-medium text-ink capitalize">
                    {group.name}
                  </h3>
                  <span className="text-xs text-ink-muted">
                    {group.dates} · {group.tripDays} {locale === "pt" ? "dias" : "days"}
                  </span>
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {group.routes.map((route) => (
                    <SmartRouteCardComponent
                      key={route.id}
                      route={route}
                      onClick={() => handleSmartRouteClick(route)}
                    />
                  ))}
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {/* Simple mode: flat grid */}
      {!loading && !error && !isSmartMode && simpleRoutes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {simpleRoutes.map((route) => (
            <SimpleRouteCard
              key={route.id}
              route={route}
              onClick={() => handleSimpleRouteClick(route)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
