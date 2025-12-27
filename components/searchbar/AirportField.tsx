"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { FloatingPopover } from "@/components/ui/FloatingPopover";
import { MobileAirportSheet } from "@/components/ui/MobileAirportSheet";
import { searchAirports, type Airport } from "@/lib/airports";

// Hook to detect mobile viewport
function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    setIsMobile(mq.matches);

    function handleChange(e: MediaQueryListEvent) {
      setIsMobile(e.matches);
    }

    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  return isMobile;
}

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
  placeholder = "city or code",
}: AirportFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const displayValue = value
    ? `${value.city.toLowerCase()} (${value.code.toLowerCase()})`
    : "";

  // Use the real search function
  const searchResults = searchAirports(query, 10);

  // Filter out excluded airport and limit results
  const suggestions = searchResults
    .filter((airport) => !exclude || airport.code !== exclude)
    .slice(0, 8);

  useEffect(() => {
    setHighlightIndex(0);
  }, [query]);

  useEffect(() => {
    if (listRef.current && isOpen) {
      const item = listRef.current.children[highlightIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex, isOpen]);

  function handleSelect(airport: Airport) {
    // Convert to the format expected by the search state
    const searchAirport = {
      code: airport.code,
      city: airport.city.toLowerCase(),
      country: airport.country.toLowerCase(),
      name: airport.name.toLowerCase(),
    };
    onChange(searchAirport as Airport);
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
    // On mobile, always open sheet on focus for better UX with keyboard
    if (isMobile) {
      setIsOpen(true);
      setQuery("");
      // Blur immediately to prevent keyboard from opening on the original input
      // The sheet will handle its own input
      inputRef.current?.blur();
      return;
    }
    
    // Desktop: Don't auto-open if input already has a value
    if (!value) {
      setIsOpen(true);
      setQuery("");
    }
  }

  function handleBlur() {
    // On mobile, don't close on blur (sheet handles its own lifecycle)
    if (isMobile) return;
    
    // Small delay to allow clicks on popover
    setTimeout(() => {
      setIsOpen(false);
      setQuery("");
    }, 200);
  }

  function handleMobileSelect(airport: Airport) {
    const searchAirport = {
      code: airport.code,
      city: airport.city.toLowerCase(),
      country: airport.country.toLowerCase(),
      name: airport.name.toLowerCase(),
    };
    onChange(searchAirport as Airport);
    setQuery("");
    setIsOpen(false);
  }

  function handleContainerClick() {
    // On mobile, clicking the container should open the sheet
    if (isMobile && !isOpen) {
      setIsOpen(true);
      setQuery("");
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    if (!isOpen) setIsOpen(true);
  }

  return (
    <div className="relative" ref={containerRef}>
      <div
        onClick={handleContainerClick}
        className={`
          w-full h-12 px-3
          border rounded-xl
          flex items-center gap-2
          transition-all duration-150
          ${isMobile ? "cursor-pointer" : ""}
          ${isOpen && !isMobile
            ? "border-blue ring-1 ring-blue/20"
            : "border-[var(--field-border)] hover:border-[var(--ink)]/20"
          }
        `}
        style={{ background: "var(--field-bg)" }}
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
            className="w-full bg-transparent border-none p-0 text-sm text-ink outline-none leading-tight placeholder:text-ink-muted"
          />
        </div>
      </div>

      {/* Desktop: Floating popover */}
      {!isMobile && (
        <FloatingPopover
          open={isOpen && suggestions.length > 0}
          anchorRef={containerRef}
          onClose={() => {
            setIsOpen(false);
            setQuery("");
          }}
          className="w-[280px]"
          maxHeight={320}
        >
          <div ref={listRef} role="listbox" className="py-1">
            {suggestions.map((airport, index) => (
              <button
                key={airport.code}
                type="button"
                role="option"
                aria-selected={index === highlightIndex}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(airport)}
                onMouseEnter={() => setHighlightIndex(index)}
                className={`
                  w-full px-4 py-2.5 text-left
                  transition-colors duration-75
                  ${index === highlightIndex ? "bg-cream-dark/50" : "hover:bg-cream-dark/30"}
                `}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm text-ink">
                    {airport.city.toLowerCase()}
                  </span>
                  <span className="text-xs font-medium text-blue">
                    {airport.code}
                  </span>
                </div>
                <div className="text-xs text-ink-muted truncate">
                  {airport.name}
                </div>
              </button>
            ))}
          </div>
        </FloatingPopover>
      )}

      {/* Mobile: Bottom sheet with fixed input */}
      {isMobile && (
        <MobileAirportSheet
          open={isOpen}
          onClose={() => {
            setIsOpen(false);
            setQuery("");
          }}
          title={label}
          query={query}
          onQueryChange={setQuery}
          suggestions={suggestions}
          onSelect={handleMobileSelect}
          highlightIndex={highlightIndex}
          onHighlightChange={setHighlightIndex}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
