"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { Popover } from "./Popover";
import { airports, type Airport } from "@/lib/mocks/airports";

interface AirportFieldProps {
  label: string;
  icon?: ReactNode;
  value: Airport | null;
  onChange: (airport: Airport) => void;
  exclude?: string | null;
  placeholder?: string;
}

export function AirportField({
  label,
  icon,
  value,
  onChange,
  exclude,
  placeholder = "cidade ou código",
}: AirportFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Valor exibido no input
  const displayValue = value
    ? `${value.city.toLowerCase()} (${value.code.toLowerCase()})`
    : "";

  // Filtra aeroportos
  const filtered = airports.filter((airport) => {
    if (exclude && airport.code === exclude) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      airport.city.toLowerCase().includes(q) ||
      airport.code.toLowerCase().includes(q) ||
      airport.name.toLowerCase().includes(q)
    );
  });

  // Limita para 8 sugestões iniciais
  const suggestions = query ? filtered : filtered.slice(0, 8);

  // Reset highlight quando muda a lista
  useEffect(() => {
    setHighlightIndex(0);
  }, [query]);

  // Scroll para item destacado
  useEffect(() => {
    if (listRef.current && isOpen) {
      const item = listRef.current.children[highlightIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex, isOpen]);

  function handleSelect(airport: Airport) {
    onChange(airport);
    setQuery("");
    setIsOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (suggestions[highlightIndex]) {
          handleSelect(suggestions[highlightIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setQuery("");
        break;
    }
  }

  function handleFocus() {
    setIsOpen(true);
    setQuery("");
  }

  function handleBlur() {
    setTimeout(() => {
      setIsOpen(false);
      setQuery("");
    }, 150);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    if (!isOpen) setIsOpen(true);
  }

  return (
    <div className="relative">
      {/* Campo */}
      <div
        className={`
          w-full h-14 px-4
          bg-cream/80 border rounded-xl
          flex items-center gap-3
          transition-all duration-150
          ${isOpen
            ? "border-blue ring-2 ring-blue/20"
            : "border-ink/10 hover:border-ink/20 hover:bg-cream"
          }
        `}
      >
        {icon && <div className="flex-shrink-0">{icon}</div>}
        
        <div className="flex-1 min-w-0">
          <label className="block text-[10px] uppercase tracking-wider text-ink-muted">
            {label}
          </label>
          <input
            ref={inputRef}
            type="text"
            value={isOpen ? query : displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            className={`
              w-full bg-transparent border-none p-0
              text-sm outline-none
              placeholder:text-ink-muted
              ${displayValue && !isOpen ? "font-medium text-ink" : "text-ink"}
            `}
          />
        </div>
      </div>

      {/* Popover com lista */}
      <Popover
        isOpen={isOpen && suggestions.length > 0}
        onClose={() => {
          setIsOpen(false);
          setQuery("");
        }}
        className="w-full max-h-[300px] overflow-y-auto"
      >
        <div ref={listRef} className="py-1">
          {suggestions.map((airport, index) => (
            <button
              key={airport.code}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(airport)}
              onMouseEnter={() => setHighlightIndex(index)}
              className={`
                w-full px-4 py-3 text-left
                transition-colors duration-75
                ${index === highlightIndex
                  ? "bg-cream"
                  : "hover:bg-cream/50"
                }
              `}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm text-ink font-medium">
                  {airport.city.toLowerCase()}
                </span>
                <span className="text-xs font-semibold text-blue">
                  {airport.code}
                </span>
              </div>
              <div className="text-xs text-ink-muted truncate">
                {airport.name}
              </div>
            </button>
          ))}
        </div>
      </Popover>
    </div>
  );
}
