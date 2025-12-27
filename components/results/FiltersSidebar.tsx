"use client";

import { useState, useMemo } from "react";
import type { FlightResult } from "@/lib/search/types";
import { useI18n } from "@/lib/i18n";
import { parseDurationToMinutes } from "@/lib/utils/bestOffer";

// ============================================================================
// Types
// ============================================================================

export interface FilterState {
  stops: "all" | "direct" | "1" | "2+";
  maxDuration: number | null; // em minutos
  airlines: string[];
  departureTime: "all" | "morning" | "afternoon" | "evening" | "night";
}

export const defaultFilterState: FilterState = {
  stops: "all",
  maxDuration: null,
  airlines: [],
  departureTime: "all",
};

interface FiltersSidebarProps {
  flights: FlightResult[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getUniqueAirlines(flights: FlightResult[]): string[] {
  const airlines = new Set(flights.map((f) => f.airline));
  return Array.from(airlines).sort();
}

function getMaxDuration(flights: FlightResult[]): number {
  if (flights.length === 0) return 1440; // 24h default
  return Math.max(...flights.map((f) => parseDurationToMinutes(f.duration)));
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

// ============================================================================
// Component
// ============================================================================

export function FiltersSidebar({ flights, filters, onFiltersChange, className = "" }: FiltersSidebarProps) {
  const { locale } = useI18n();
  const [expanded, setExpanded] = useState({
    stops: true,
    duration: true,
    airlines: false,
    departure: false,
  });

  const airlines = useMemo(() => getUniqueAirlines(flights), [flights]);
  const maxDuration = useMemo(() => getMaxDuration(flights), [flights]);

  const text = {
    pt: {
      filters: "filtros",
      stops: "escalas",
      all: "todas",
      direct: "direto",
      oneStop: "1 escala",
      twoPlus: "2+ escalas",
      duration: "duração",
      maxDuration: "máximo",
      airlines: "companhias",
      departure: "horário de partida",
      morning: "manhã (6h-12h)",
      afternoon: "tarde (12h-18h)",
      evening: "noite (18h-00h)",
      night: "madrugada (00h-6h)",
      clearAll: "limpar filtros",
    },
    en: {
      filters: "filters",
      stops: "stops",
      all: "all",
      direct: "direct",
      oneStop: "1 stop",
      twoPlus: "2+ stops",
      duration: "duration",
      maxDuration: "maximum",
      airlines: "airlines",
      departure: "departure time",
      morning: "morning (6am-12pm)",
      afternoon: "afternoon (12pm-6pm)",
      evening: "evening (6pm-12am)",
      night: "night (12am-6am)",
      clearAll: "clear filters",
    },
  };

  const t = text[locale as "pt" | "en"] || text.pt;

  const hasActiveFilters =
    filters.stops !== "all" ||
    filters.maxDuration !== null ||
    filters.airlines.length > 0 ||
    filters.departureTime !== "all";

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className={`rounded-xl border p-4 ${className}`} style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-ink">{t.filters}</h3>
        {hasActiveFilters && (
          <button
            onClick={() => onFiltersChange(defaultFilterState)}
            className="text-xs text-blue hover:text-blue-soft transition-colors"
          >
            {t.clearAll}
          </button>
        )}
      </div>

      {/* Escalas */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection("stops")}
          className="flex items-center justify-between w-full text-left py-2"
        >
          <span className="text-sm font-medium text-ink">{t.stops}</span>
          <ChevronIcon expanded={expanded.stops} />
        </button>
        {expanded.stops && (
          <div className="space-y-2 mt-2">
            {(["all", "direct", "1", "2+"] as const).map((value) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="stops"
                  checked={filters.stops === value}
                  onChange={() => onFiltersChange({ ...filters, stops: value })}
                  className="w-4 h-4 accent-blue"
                />
                <span className="text-sm text-ink-muted group-hover:text-ink transition-colors">
                  {value === "all" ? t.all : value === "direct" ? t.direct : value === "1" ? t.oneStop : t.twoPlus}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Duração */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection("duration")}
          className="flex items-center justify-between w-full text-left py-2"
        >
          <span className="text-sm font-medium text-ink">{t.duration}</span>
          <ChevronIcon expanded={expanded.duration} />
        </button>
        {expanded.duration && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-ink-muted">{t.maxDuration}</span>
              <span className="text-xs font-medium text-ink">
                {filters.maxDuration ? formatDuration(filters.maxDuration) : formatDuration(maxDuration)}
              </span>
            </div>
            <input
              type="range"
              min={60}
              max={maxDuration}
              step={30}
              value={filters.maxDuration || maxDuration}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                onFiltersChange({
                  ...filters,
                  maxDuration: value >= maxDuration ? null : value,
                });
              }}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-blue"
              style={{ background: "var(--cream-dark)" }}
            />
          </div>
        )}
      </div>

      {/* Companhias */}
      {airlines.length > 1 && (
        <div className="mb-4">
          <button
            onClick={() => toggleSection("airlines")}
            className="flex items-center justify-between w-full text-left py-2"
          >
            <span className="text-sm font-medium text-ink">{t.airlines}</span>
            <ChevronIcon expanded={expanded.airlines} />
          </button>
          {expanded.airlines && (
            <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
              {airlines.map((airline) => (
                <label key={airline} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.airlines.length === 0 || filters.airlines.includes(airline)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        // Se estava filtrado, adiciona essa
                        if (filters.airlines.length > 0) {
                          onFiltersChange({
                            ...filters,
                            airlines: [...filters.airlines, airline],
                          });
                        }
                        // Se estava mostrando todas, agora mostra só essa
                        // Não faz nada se já mostra todas
                      } else {
                        // Remove essa companhia
                        const newAirlines = filters.airlines.filter((a) => a !== airline);
                        onFiltersChange({
                          ...filters,
                          airlines: filters.airlines.length === 0 
                            ? airlines.filter((a) => a !== airline)
                            : newAirlines,
                        });
                      }
                    }}
                    className="w-4 h-4 accent-blue rounded"
                  />
                  <span className="text-sm text-ink-muted group-hover:text-ink transition-colors capitalize">
                    {airline}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Horário de Partida */}
      <div>
        <button
          onClick={() => toggleSection("departure")}
          className="flex items-center justify-between w-full text-left py-2"
        >
          <span className="text-sm font-medium text-ink">{t.departure}</span>
          <ChevronIcon expanded={expanded.departure} />
        </button>
        {expanded.departure && (
          <div className="space-y-2 mt-2">
            {(["all", "morning", "afternoon", "evening", "night"] as const).map((value) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="departure"
                  checked={filters.departureTime === value}
                  onChange={() => onFiltersChange({ ...filters, departureTime: value })}
                  className="w-4 h-4 accent-blue"
                />
                <span className="text-sm text-ink-muted group-hover:text-ink transition-colors">
                  {t[value]}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-ink-muted transition-transform ${expanded ? "rotate-180" : ""}`}
      viewBox="0 0 16 16"
      fill="none"
    >
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ============================================================================
// Filter Logic
// ============================================================================

export function applyFilters(flights: FlightResult[], filters: FilterState): FlightResult[] {
  return flights.filter((flight) => {
    // Filtro de escalas
    if (filters.stops !== "all") {
      const isDirect = flight.stops === "direto" || flight.stops === "direct";
      const stopCount = isDirect ? 0 : parseInt(flight.stops) || (flight.stops.includes("1") ? 1 : 2);
      
      if (filters.stops === "direct" && !isDirect) return false;
      if (filters.stops === "1" && stopCount !== 1) return false;
      if (filters.stops === "2+" && stopCount < 2) return false;
    }

    // Filtro de duração
    if (filters.maxDuration !== null) {
      const duration = parseDurationToMinutes(flight.duration);
      if (duration > filters.maxDuration) return false;
    }

    // Filtro de companhias
    if (filters.airlines.length > 0 && !filters.airlines.includes(flight.airline)) {
      return false;
    }

    // Filtro de horário de partida
    if (filters.departureTime !== "all") {
      const [hours] = flight.departure.split(":").map(Number);
      if (filters.departureTime === "morning" && (hours < 6 || hours >= 12)) return false;
      if (filters.departureTime === "afternoon" && (hours < 12 || hours >= 18)) return false;
      if (filters.departureTime === "evening" && (hours < 18 || hours >= 24)) return false;
      if (filters.departureTime === "night" && hours >= 6) return false;
    }

    return true;
  });
}

