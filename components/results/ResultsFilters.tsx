"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";

export type FilterType = "price" | "duration" | "best";

interface ResultsFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export function ResultsFilters({ activeFilter, onFilterChange }: ResultsFiltersProps) {
  const { locale } = useI18n();

  const filters: { id: FilterType; label: string; sublabel: string }[] = [
    {
      id: "price",
      label: locale === "pt" ? "menor preço" : "lowest price",
      sublabel: locale === "pt" ? "a partir de R$ 890" : "from R$ 890",
    },
    {
      id: "duration",
      label: locale === "pt" ? "mais rápido" : "fastest",
      sublabel: locale === "pt" ? "2h 15min" : "2h 15min",
    },
    {
      id: "best",
      label: locale === "pt" ? "melhor opção" : "best value",
      sublabel: locale === "pt" ? "preço + tempo" : "price + time",
    },
  ];

  return (
    <div className="flex gap-2 sm:gap-3">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.id;
        
        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onFilterChange(filter.id)}
            className={`
              flex-1 py-3 px-4 rounded-xl
              border transition-all duration-150
              text-left
              ${isActive
                ? "border-blue bg-blue/5 ring-1 ring-blue/20"
                : "border-[var(--field-border)] hover:border-ink/20"
              }
            `}
            style={{ background: isActive ? undefined : "var(--field-bg)" }}
          >
            <div className={`text-sm font-medium ${isActive ? "text-blue" : "text-ink"}`}>
              {filter.label}
            </div>
            <div className={`text-xs mt-0.5 ${isActive ? "text-blue/70" : "text-ink-muted"}`}>
              {filter.sublabel}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// Componente standalone para uso direto com estado interno
export function ResultsFiltersStandalone() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("best");

  return (
    <ResultsFilters
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
    />
  );
}

