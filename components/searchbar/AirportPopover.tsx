"use client";

import { useState, useEffect, useRef } from "react";
import { Popover } from "./Popover";
import { searchAirports, getAllAirports, type Airport } from "@/lib/airports";

interface AirportPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (airport: Airport) => void;
  exclude?: string | null;
}

export function AirportPopover({
  isOpen,
  onClose,
  onSelect,
  exclude,
}: AirportPopoverProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Foca no input quando abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    if (!isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  // Use real search when query exists, otherwise show first airports
  const filtered = query.length >= 2
    ? searchAirports(query, 10).filter((airport) => !exclude || airport.code !== exclude)
    : getAllAirports()
        .filter((airport) => !exclude || airport.code !== exclude)
        .slice(0, 10);

  function handleSelect(airport: Airport) {
    onSelect(airport);
    onClose();
  }

  return (
    <Popover isOpen={isOpen} onClose={onClose} className="w-[280px]">
      <div className="p-3 border-b border-cream-dark">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="buscar cidade ou código"
          className="
            w-full h-9 px-3 rounded-lg
            bg-cream border border-cream-dark
            text-sm text-ink placeholder:text-ink-muted
            focus:outline-none focus:ring-1 focus:ring-blue-soft
            transition-all duration-150
          "
        />
      </div>
      <div className="max-h-[240px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-ink-muted">
            nenhum aeroporto encontrado
          </div>
        ) : (
          <div className="py-1">
            {filtered.map((airport) => (
              <button
                key={airport.code}
                type="button"
                onClick={() => handleSelect(airport)}
                className="
                  w-full px-4 py-2.5 text-left
                  hover:bg-cream transition-colors duration-100
                "
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm text-ink">{airport.city.toLowerCase()}</span>
                  <span className="text-xs font-medium text-blue">{airport.code}</span>
                </div>
                <div className="text-xs text-ink-muted truncate">{airport.name}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Popover>
  );
}

