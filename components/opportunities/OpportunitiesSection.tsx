"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import { serializeSearchState } from "@/lib/utils/searchParams";
import { defaultSearchState } from "@/lib/types/search";
import { getAirportByCode } from "@/lib/airports";
import { findNearestAirport, getAllAirports } from "@/lib/geo/nearestAirport";

// ============================================================================
// Destination Images Mapping
// ============================================================================

const DESTINATION_IMAGES: Record<string, string> = {
  // Cidade -> arquivo de imagem
  "lisboa": "/destinations/lisboa.jpg",
  "madrid": "/destinations/madrid.jpg",
  "miami": "/destinations/miami.jpg",
  "orlando": "/destinations/orlando.jpg",
  "buenos aires": "/destinations/buenosaires.jpg",
  // Fallback para códigos de aeroporto comuns
  "LIS": "/destinations/lisboa.avif",
  "MAD": "/destinations/madrid.jpg",
  "MIA": "/destinations/miami.jpg",
  "MCO": "/destinations/orlando.jpg",
  "EZE": "/destinations/buenosaires.jpg",
  "AEP": "/destinations/buenosaires.jpg",
};

function getDestinationImage(city: string, code?: string): string | null {
  // Primeiro tenta pelo nome da cidade (lowercase)
  const cityLower = city.toLowerCase();
  if (DESTINATION_IMAGES[cityLower]) {
    return DESTINATION_IMAGES[cityLower];
  }
  // Depois tenta pelo código do aeroporto
  if (code && DESTINATION_IMAGES[code]) {
    return DESTINATION_IMAGES[code];
  }
  return null;
}

// ============================================================================
// Carousel Arrow Icons
// ============================================================================

function ChevronLeftIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M12.5 15L7.5 10L12.5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M7.5 15L12.5 10L7.5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ============================================================================
// Feature Flag
// ============================================================================

const SMART_ROUTES_ENABLED =
  process.env.NEXT_PUBLIC_SMART_ROUTES !== "false"; // Default: true

// ============================================================================
// Filter Types (mock - para futuro uso real)
// ============================================================================

type DurationFilter = "all" | "3" | "5" | "7+";
type TypeFilter = "all" | "beach" | "city" | "nature";

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-full text-xs font-medium
        transition-all duration-150 border
        ${active 
          ? "bg-blue text-cream-soft border-blue" 
          : "bg-transparent text-ink-muted border-[var(--field-border)] hover:border-[var(--ink)]/20 hover:text-ink"
        }
      `}
    >
      {label}
    </button>
  );
}

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

// Mock destination types for filtering
const DESTINATION_TYPES: Record<string, "beach" | "city" | "nature"> = {
  // Praias
  "miami": "beach",
  "cancun": "beach",
  "punta cana": "beach",
  "orlando": "beach",
  "cartagena": "beach",
  "rio de janeiro": "beach",
  "salvador": "beach",
  "florianópolis": "beach",
  "natal": "beach",
  "fortaleza": "beach",
  "recife": "beach",
  "maceió": "beach",
  // Cidades
  "buenos aires": "city",
  "santiago": "city",
  "lima": "city",
  "bogotá": "city",
  "montevidéu": "city",
  "são paulo": "city",
  "nova york": "city",
  "new york": "city",
  "paris": "city",
  "madrid": "city",
  "lisboa": "city",
  "londres": "city",
  "roma": "city",
  // Natureza
  "bariloche": "nature",
  "patagônia": "nature",
  "cusco": "nature",
  "machu picchu": "nature",
  "iguaçu": "nature",
  "chapada": "nature",
  "bonito": "nature",
  "gramado": "nature",
};

function getDestinationType(city: string): "beach" | "city" | "nature" | null {
  const normalized = city.toLowerCase();
  return DESTINATION_TYPES[normalized] || null;
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
// Holiday Section with Mobile Carousel
// ============================================================================

interface HolidaySectionProps {
  name: string;
  dates: string;
  tripDays: number;
  routes: SmartRouteCard[];
  locale: string;
  onRouteClick: (route: SmartRouteCard) => void;
  /** Whether to use glass styling for cards (for home page) */
  isGlass?: boolean;
}

function HolidaySection({
  name,
  dates,
  tripDays,
  routes,
  locale,
  onRouteClick,
  isGlass = false,
}: HolidaySectionProps) {
  // State for active card index (starts at 0)
  const [activeIndex, setActiveIndex] = useState(0);
  const daysText = locale === "pt" ? "dias" : "days";

  // Ensure we have routes
  if (routes.length === 0) return null;

  // Navigation functions - move one card at a time
  function goToPrev() {
    setActiveIndex((prev) => (prev === 0 ? routes.length - 1 : prev - 1));
  }

  function goToNext() {
    setActiveIndex((prev) => (prev === routes.length - 1 ? 0 : prev + 1));
  }

  // Calculate translateX for slide animation
  // Each card is 100% width (1 card per view)
  // Moving one card = 100% of container + gap
  const cardOffset = activeIndex * 100; // 100% per card

  return (
    <div>
      {/* Holiday header */}
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-base font-medium text-ink capitalize">{name}</h3>
        <span className="text-xs text-ink-muted">
          {dates} · {tripDays} {daysText}
        </span>
      </div>

      {/* Mobile: Carousel with 1 card per view and slide animation */}
      <div className="sm:hidden relative py-4">
        <div className="flex items-center gap-2 px-2">
          {/* Left arrow button */}
          <button
            onClick={goToPrev}
            className="flex-shrink-0 p-2 rounded-full border transition-colors hover:bg-cream-dark/30 z-10"
            style={{
              background: "var(--card-bg)",
              borderColor: "var(--card-border)",
            }}
            aria-label="Anterior"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>

          {/* Cards container with overflow hidden */}
          <div className="flex-1 overflow-hidden relative">
            <div
              className="flex gap-4 transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(calc(-${cardOffset}% - ${activeIndex * 16}px))`,
                willChange: "transform",
              }}
            >
              {routes.map((route) => (
                <div
                  key={route.id}
                  className="flex-shrink-0 w-full"
                >
                  <SmartRouteCardComponent
                    route={route}
                    onClick={() => onRouteClick(route)}
                    isGlass={isGlass}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right arrow button */}
          <button
            onClick={goToNext}
            className="flex-shrink-0 p-2 rounded-full border transition-colors hover:bg-cream-dark/30 z-10"
            style={{
              background: "var(--card-bg)",
              borderColor: "var(--card-border)",
            }}
            aria-label="Próximo"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Pagination dots */}
      <div className="sm:hidden flex justify-center gap-1.5 mt-2">
        {routes.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === activeIndex
                ? "bg-blue w-4"
                : "bg-ink/20 hover:bg-ink/40"
            }`}
            aria-label={`Ir para card ${idx + 1}`}
          />
        ))}
      </div>

      {/* Desktop: Grid layout */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {routes.map((route) => (
          <SmartRouteCardComponent
            key={route.id}
            route={route}
            onClick={() => onRouteClick(route)}
            isGlass={isGlass}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Smart Mode Components (new holiday-based)
// ============================================================================

interface SmartRouteCardProps {
  route: SmartRouteCard;
  onClick: () => void;
  /** Whether to use glass styling (for home page) */
  isGlass?: boolean;
}

function SmartRouteCardComponent({ route, onClick, isGlass = false }: SmartRouteCardProps) {
  const { locale, t } = useI18n();

  const priceLabel = t.home.lowestPriceFound;
  const viewFlightsText = locale === "pt" ? "ver voos" : "view flights";
  
  // Get destination image if available
  const destinationImage = getDestinationImage(route.toCity, route.to);
  const hasImage = !!destinationImage;

  // Premium solid card styles (não transparente)
  // Escuro: superfície ink/slate | Claro: branco com sombra
  const cardStyles = isGlass
    ? {
        // Premium solid - NOT transparent
        background: "var(--home-card-bg, #121A2A)",
        borderColor: "var(--home-card-border, rgba(255, 255, 255, 0.06))",
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.15)",
      }
    : {
        background: "var(--card-bg)",
        borderColor: "var(--card-border)",
      };

  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-2xl border transition-all duration-200 hover:border-blue-soft/50 hover:shadow-xl overflow-hidden"
      style={cardStyles}
    >
      {/* Image section with fixed height */}
      {hasImage && (
        <div className="relative h-32 md:h-36 w-full overflow-hidden rounded-t-2xl">
          <Image
            src={destinationImage}
            alt={`${route.toCity}, ${route.toCountry}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          {/* Enhanced gradient overlay for better text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
          {/* Destination name over image - improved contrast */}
          <div className="absolute bottom-3 left-3 right-3">
            <div 
              className="text-base font-semibold text-white capitalize"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
            >
              {route.toCity}
            </div>
            <div 
              className="text-xs text-white/90 capitalize"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}
            >
              {route.toCountry}
            </div>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Destination (only if no image) */}
        {!hasImage && (
          <div className="mb-3">
            <div className="text-base font-semibold text-ink capitalize mb-0.5">
              {route.toCity}
            </div>
            <div className="text-xs opacity-65 capitalize">
              {route.toCountry}
            </div>
          </div>
        )}

        {/* Price - only show if we have data */}
        <div className={`flex flex-col gap-0.5 min-h-[36px] ${hasImage ? "mb-2" : "mb-3"}`}>
          {route.price !== undefined && (
            <>
              <span className="text-[10px] uppercase tracking-wider opacity-50">{priceLabel}</span>
              <span className="text-xl font-bold text-blue">
                {formatPrice(route.price)}
              </span>
            </>
          )}
        </div>

        {/* CTA */}
        <div
          className="flex items-center justify-end pt-3 border-t"
          style={{ borderColor: isGlass ? "rgba(255, 255, 255, 0.08)" : "var(--cream-dark)" }}
        >
          <span className="text-xs font-medium lowercase transition-colors group-hover:text-blue text-ink">
            {viewFlightsText}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className="inline-block ml-1 opacity-60"
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

interface OpportunitiesSectionProps {
  /**
   * Variant controls styling:
   * - "home": Used on homepage with solid background (no waves behind)
   * - "default": Used on other pages with normal styling
   */
  variant?: "home" | "default";
}

export function OpportunitiesSection({ variant = "default" }: OpportunitiesSectionProps) {
  const router = useRouter();
  const { locale, t } = useI18n();

  // State for simple mode
  const [simpleRoutes, setSimpleRoutes] = useState<PopularRouteCard[]>([]);

  // State for smart mode
  const [smartRoutes, setSmartRoutes] = useState<SmartRouteCard[]>([]);
  const [origin, setOrigin] = useState<{ code: string; city: string } | null>(null);
  const [detectedOrigin, setDetectedOrigin] = useState<string | null>(null);
  const [showOriginSelector, setShowOriginSelector] = useState(false);

  // Filter states
  const [durationFilter, setDurationFilter] = useState<DurationFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  // Filtered routes based on active filters
  const filteredSmartRoutes = useMemo(() => {
    return smartRoutes.filter((route) => {
      // Duration filter
      if (durationFilter !== "all") {
        const days = route.tripDays;
        if (durationFilter === "3" && days > 4) return false;
        if (durationFilter === "5" && (days < 4 || days > 6)) return false;
        if (durationFilter === "7+" && days < 7) return false;
      }
      
      // Type filter
      if (typeFilter !== "all") {
        const destinationType = getDestinationType(route.toCity);
        if (destinationType !== typeFilter) return false;
      }
      
      return true;
    });
  }, [smartRoutes, durationFilter, typeFilter]);

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

  // Classes e estilos baseados na variante
  const isHome = variant === "home";
  
  return (
    <section 
      className={`w-full max-w-5xl mx-auto px-4 sm:px-6 ${isHome ? "pb-16" : "pt-12 pb-24"}`}
    >
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl sm:text-2xl font-medium text-ink lowercase">
            {headerText}
          </h2>
        </div>
        <div className="flex items-center gap-3 mb-4">
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

        {/* Filter chips - mock for now */}
        {isSmartMode && (
          <div className="flex flex-wrap gap-2">
            {/* Duration filters */}
            <div className="flex items-center gap-1.5 mr-2">
              <span className="text-[10px] uppercase tracking-wider text-ink-muted mr-1">
                {locale === "pt" ? "duração" : "duration"}
              </span>
              <FilterChip 
                label={t.home.filterDuration3} 
                active={durationFilter === "3"} 
                onClick={() => setDurationFilter(durationFilter === "3" ? "all" : "3")} 
              />
              <FilterChip 
                label={t.home.filterDuration5} 
                active={durationFilter === "5"} 
                onClick={() => setDurationFilter(durationFilter === "5" ? "all" : "5")} 
              />
              <FilterChip 
                label={t.home.filterDuration7} 
                active={durationFilter === "7+"} 
                onClick={() => setDurationFilter(durationFilter === "7+" ? "all" : "7+")} 
              />
            </div>

            {/* Separator */}
            <span className="w-px h-6 bg-ink-muted/20 mx-1 hidden sm:block" />

            {/* Type filters */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-ink-muted mr-1">
                {locale === "pt" ? "tipo" : "type"}
              </span>
              <FilterChip 
                label={t.home.filterBeach} 
                active={typeFilter === "beach"} 
                onClick={() => setTypeFilter(typeFilter === "beach" ? "all" : "beach")} 
              />
              <FilterChip 
                label={t.home.filterCity} 
                active={typeFilter === "city"} 
                onClick={() => setTypeFilter(typeFilter === "city" ? "all" : "city")} 
              />
              <FilterChip 
                label={t.home.filterNature} 
                active={typeFilter === "nature"} 
                onClick={() => setTypeFilter(typeFilter === "nature" ? "all" : "nature")} 
              />
            </div>
          </div>
        )}
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

      {/* No routes after filtering */}
      {!loading && !error && isSmartMode && smartRoutes.length > 0 && filteredSmartRoutes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-ink-muted text-sm">
            {locale === "pt" 
              ? "nenhuma rota encontrada com esses filtros" 
              : "no routes found with these filters"}
          </p>
          <button
            onClick={() => {
              setDurationFilter("all");
              setTypeFilter("all");
            }}
            className="mt-3 text-blue hover:text-blue-soft text-sm transition-colors"
          >
            {locale === "pt" ? "limpar filtros" : "clear filters"}
          </button>
        </div>
      )}

      {/* Smart mode: grouped by holiday */}
      {!loading && !error && isSmartMode && filteredSmartRoutes.length > 0 && (
        <div className="space-y-8">
          {/* Group routes by holiday */}
          {(() => {
            const groupedByHoliday = filteredSmartRoutes.reduce((acc, route) => {
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
              <HolidaySection
                key={key}
                name={group.name}
                dates={group.dates}
                tripDays={group.tripDays}
                routes={group.routes}
                locale={locale}
                onRouteClick={handleSmartRouteClick}
                isGlass={isHome}
              />
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
