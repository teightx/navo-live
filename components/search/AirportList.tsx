"use client";

import { Airport, formatAirport } from "@/lib/airports";

interface AirportListProps {
  airports: Airport[];
  onSelect: (airport: Airport) => void;
  highlightedIndex: number;
}

export function AirportList({ airports, onSelect, highlightedIndex }: AirportListProps) {
  if (airports.length === 0) return null;

  return (
    <ul
      className="absolute top-full left-0 right-0 mt-1 bg-cream-soft border border-cream-dark rounded-lg shadow-sm overflow-hidden z-50"
      role="listbox"
    >
      {airports.map((airport, index) => (
        <li
          key={airport.code}
          role="option"
          aria-selected={index === highlightedIndex}
          className={`
            px-4 py-3 cursor-pointer transition-colors
            ${index === highlightedIndex ? "bg-cream" : "hover:bg-cream/50"}
            ${index !== airports.length - 1 ? "border-b border-cream-dark/50" : ""}
          `}
          onClick={() => onSelect(airport)}
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-ink lowercase">
              {airport.city}
            </span>
            <span className="text-ink-muted text-sm uppercase tracking-wide">
              {airport.code}
            </span>
          </div>
          <div className="text-xs text-ink-muted mt-0.5 lowercase">
            {airport.country}
          </div>
        </li>
      ))}
    </ul>
  );
}

