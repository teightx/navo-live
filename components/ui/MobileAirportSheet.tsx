"use client";

import * as React from "react";
import { createPortal } from "react-dom";

// Inline SVG icons to avoid external dependencies
function IconX({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconSearch({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconMapPin({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

interface Airport {
  code: string;
  city: string;
  name: string;
  country: string;
}

interface MobileAirportSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  query: string;
  onQueryChange: (query: string) => void;
  suggestions: Airport[];
  onSelect: (airport: Airport) => void;
  highlightIndex: number;
  onHighlightChange: (index: number) => void;
  placeholder?: string;
}

/**
 * Mobile-optimized bottom sheet for airport selection.
 * 
 * Uses visualViewport API to detect iOS keyboard and adjust height,
 * ensuring the list is always visible above the keyboard.
 */
export function MobileAirportSheet({
  open,
  onClose,
  title,
  query,
  onQueryChange,
  suggestions,
  onSelect,
  highlightIndex,
  onHighlightChange,
  placeholder = "buscar cidade ou código",
}: MobileAirportSheetProps) {
  const [mounted, setMounted] = React.useState(false);
  const [viewportHeight, setViewportHeight] = React.useState<number | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Mount check for portal
  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Auto-focus input when sheet opens
  React.useEffect(() => {
    if (open && inputRef.current) {
      // Delay focus to ensure sheet is rendered
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Listen to visualViewport for keyboard detection (iOS)
  React.useEffect(() => {
    if (!open) return;

    const viewport = window.visualViewport;
    if (!viewport) {
      // Fallback for browsers without visualViewport
      setViewportHeight(window.innerHeight);
      return;
    }

    function handleResize() {
      if (viewport) {
        setViewportHeight(viewport.height);
      }
    }

    // Initial height
    setViewportHeight(viewport.height);

    viewport.addEventListener("resize", handleResize);
    viewport.addEventListener("scroll", handleResize);

    return () => {
      viewport.removeEventListener("resize", handleResize);
      viewport.removeEventListener("scroll", handleResize);
    };
  }, [open]);

  // Block body scroll when open
  React.useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const originalWidth = document.body.style.width;
      const scrollY = window.scrollY;

      // Lock body scroll (iOS-friendly)
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = originalWidth;
        window.scrollTo(0, scrollY);
      };
    }
  }, [open]);

  // Scroll highlighted item into view
  React.useEffect(() => {
    if (listRef.current && open && highlightIndex >= 0) {
      const items = listRef.current.querySelectorAll("[role='option']");
      const item = items[highlightIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex, open]);

  // Handle keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        onHighlightChange(Math.min(highlightIndex + 1, suggestions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        onHighlightChange(Math.max(highlightIndex - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (suggestions[highlightIndex]) {
          onSelect(suggestions[highlightIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        onClose();
        break;
    }
  }

  if (!open || !mounted) return null;

  const overlayRoot = document.getElementById("overlay-root") || document.body;

  // Calculate sheet height based on viewport (accounts for iOS keyboard)
  const sheetMaxHeight = viewportHeight 
    ? Math.min(viewportHeight * 0.9, viewportHeight - 20)
    : "85vh";

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed left-0 right-0 z-[9999] rounded-t-2xl overflow-hidden animate-slide-up"
        style={{
          bottom: 0,
          maxHeight: typeof sheetMaxHeight === "number" ? `${sheetMaxHeight}px` : sheetMaxHeight,
          background: "var(--popover-bg)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid var(--card-border)",
          borderBottom: "none",
          boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "var(--ink-muted)", opacity: 0.3 }}
          />
        </div>

        {/* Header with input - FIXED at top */}
        <div
          className="sticky top-0 z-10 px-4 pb-3 pt-1"
          style={{ background: "var(--popover-bg)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-ink">{title}</span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 -mr-1.5 rounded-full hover:bg-cream-dark/50 transition-colors"
              aria-label="Fechar"
            >
              <IconX size={20} className="text-ink-muted" />
            </button>
          </div>

          {/* Search input */}
          <div
            className="flex items-center gap-2 h-12 px-3 rounded-xl border transition-colors"
            style={{
              background: "var(--field-bg)",
              borderColor: "var(--field-border)",
            }}
          >
            <IconSearch size={18} className="text-ink-muted flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="search"
              role="combobox"
              aria-expanded={suggestions.length > 0}
              aria-haspopup="listbox"
              aria-autocomplete="list"
              aria-controls="airport-suggestions"
              className="flex-1 bg-transparent border-none p-0 text-base text-ink outline-none placeholder:text-ink-muted"
            />
            {query && (
              <button
                type="button"
                onClick={() => onQueryChange("")}
                className="p-1 rounded-full hover:bg-cream-dark/50"
                aria-label="Limpar busca"
              >
                <IconX size={16} className="text-ink-muted" />
              </button>
            )}
          </div>
        </div>

        {/* Results list - scrollable */}
        <div
          ref={listRef}
          id="airport-suggestions"
          role="listbox"
          aria-label="Sugestões de aeroportos"
          className="overflow-y-auto overscroll-contain pb-safe"
          style={{
            maxHeight: typeof sheetMaxHeight === "number"
              ? `${sheetMaxHeight - 120}px`
              : "calc(85vh - 120px)",
          }}
        >
          {suggestions.length === 0 ? (
            <div className="px-4 py-8 text-center text-ink-muted text-sm">
              {query.length < 2
                ? "Digite pelo menos 2 caracteres"
                : "Nenhum aeroporto encontrado"}
            </div>
          ) : (
            suggestions.map((airport, index) => (
              <button
                key={airport.code}
                type="button"
                role="option"
                aria-selected={index === highlightIndex}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelect(airport)}
                onMouseEnter={() => onHighlightChange(index)}
                className={`
                  w-full px-4 py-3 text-left flex items-start gap-3
                  transition-colors duration-75
                  ${index === highlightIndex 
                    ? "bg-blue/10" 
                    : "hover:bg-cream-dark/30 active:bg-cream-dark/50"
                  }
                `}
              >
                <IconMapPin
                  size={18}
                  className={`flex-shrink-0 mt-0.5 ${
                    index === highlightIndex ? "text-blue" : "text-ink-muted"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-base text-ink font-medium">
                      {airport.city.toLowerCase()}
                    </span>
                    <span className="text-sm font-semibold text-blue flex-shrink-0">
                      {airport.code}
                    </span>
                  </div>
                  <div className="text-xs text-ink-muted truncate mt-0.5">
                    {airport.name}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Safe area padding for iOS home indicator */}
        <div className="h-safe" />
      </div>
    </>,
    overlayRoot
  );
}

