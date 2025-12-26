"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { SwapButton } from "./SwapButton";
import { AirportField } from "./AirportField";
import { DateField } from "./DateField";
import { PaxClassPopover } from "./PaxClassPopover";
import { useI18n } from "@/lib/i18n";
import type { SearchState, TripType, Pax, CabinClass } from "@/lib/types/search";
import { defaultSearchState } from "@/lib/types/search";
import type { Airport } from "@/lib/mocks/airports";
import { normalizeSearchState, serializeSearchState } from "@/lib/utils/searchParams";

function formatPaxSummary(pax: Pax, cabin: CabinClass, t: ReturnType<typeof useI18n>["t"]): string {
  const parts: string[] = [];
  
  if (pax.adults === 1 && pax.children === 0 && pax.infants === 0) {
    parts.push(`1 ${t.search.adult}`);
  } else {
    if (pax.adults > 0) {
      parts.push(`${pax.adults} ${t.search.adults}`);
    }
    if (pax.children > 0) {
      parts.push(`${pax.children} ${t.search.children}`);
    }
    if (pax.infants > 0) {
      parts.push(`${pax.infants} ${t.search.infants}`);
    }
  }
  
  const cabinLabel = t.search.cabin[cabin as keyof typeof t.search.cabin];
  return `${parts.join(", ")}, ${cabinLabel}`;
}

// Ícones SVG
export function PlaneDepartIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path 
        d="M1.5 13H14.5" 
        stroke="currentColor" 
        strokeWidth="1.2" 
        strokeLinecap="round"
      />
      <path 
        d="M13.5 7.5L12 8.5L9 7L6.5 8L3.5 6.5L2 7.5L4.5 9.5L8 10L11 9L13.5 7.5Z" 
        stroke="currentColor" 
        strokeWidth="1.2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M9.5 3L11.5 5.5L9 7" 
        stroke="currentColor" 
        strokeWidth="1.2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MapPinIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path 
        d="M8 8.5C9.10457 8.5 10 7.60457 10 6.5C10 5.39543 9.10457 4.5 8 4.5C6.89543 4.5 6 5.39543 6 6.5C6 7.60457 6.89543 8.5 8 8.5Z" 
        stroke="currentColor" 
        strokeWidth="1.2"
      />
      <path 
        d="M8 14C8 14 13 10 13 6.5C13 3.73858 10.7614 1.5 8 1.5C5.23858 1.5 3 3.73858 3 6.5C3 10 8 14 8 14Z" 
        stroke="currentColor" 
        strokeWidth="1.2"
      />
    </svg>
  );
}

export function CalendarIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M2 6H14" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M5 1.5V3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M11 1.5V3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export function UsersIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M1 14C1 11.2386 3.23858 9 6 9C8.76142 9 11 11.2386 11 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="11" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M12 9C13.6569 9.5 15 11.067 15 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

interface SearchBarProps {
  initialState?: Partial<SearchState>;
  onSearch?: (state: SearchState) => void;
  mode?: "default" | "compact";
}

export function SearchBar({ initialState, onSearch, mode = "default" }: SearchBarProps) {
  const router = useRouter();
  const { t } = useI18n();
  
  const mergedInitialState = useMemo(() => ({
    ...defaultSearchState,
    ...initialState,
  }), [initialState]);

  const [state, setState] = useState<SearchState>(mergedInitialState);
  const [paxOpen, setPaxOpen] = useState(false);
  const paxButtonRef = useRef<HTMLButtonElement>(null);

  function handleTripTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const tripType = e.target.value as TripType;
    setState((s) => ({
      ...s,
      tripType,
      returnDate: tripType === "oneway" ? null : s.returnDate,
    }));
  }

  function handleFromChange(airport: Airport) {
    setState((s) => ({ ...s, from: airport }));
  }

  function handleToChange(airport: Airport) {
    setState((s) => ({ ...s, to: airport }));
  }

  function handleSwap() {
    setState((s) => ({ ...s, from: s.to, to: s.from }));
  }

  function handleDatesApply(depart: string | null, returnD: string | null) {
    setState((s) => ({ ...s, departDate: depart, returnDate: returnD }));
  }

  function handlePaxApply(pax: Pax, cabin: CabinClass) {
    setState((s) => ({ ...s, pax, cabinClass: cabin }));
  }

  const isValid =
    state.from !== null &&
    state.to !== null &&
    state.departDate !== null &&
    (state.tripType === "oneway" || state.returnDate !== null);

  function handleSubmit() {
    if (!isValid) return;

    // Normalize state before submitting
    const normalizedState = normalizeSearchState(state);

    if (onSearch) {
      onSearch(normalizedState);
      return;
    }

    // Serialize to URL and navigate
    const queryString = serializeSearchState(normalizedState);
    router.push(`/resultados?${queryString}`);
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-0">
      {/* Trip type selector */}
      <div className="mb-3 pl-1">
        <div className="relative inline-flex items-center">
          <select
            value={state.tripType}
            onChange={handleTripTypeChange}
            className="appearance-none bg-transparent text-sm text-ink-soft pr-5 cursor-pointer focus:outline-none hover:text-ink transition-colors"
          >
            <option value="roundtrip">{t.search.tripType.roundtrip}</option>
            <option value="oneway">{t.search.tripType.oneway}</option>
          </select>
          <ChevronDownIcon className="absolute right-0 pointer-events-none text-ink-muted" />
        </div>
      </div>

      {/* Glass card */}
      <div 
        className="rounded-2xl p-5 sm:p-6"
        style={{
          background: "var(--card-bg)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid var(--card-border)",
          boxShadow: "var(--card-shadow)",
        }}
      >
        {/* Row 1: Origin + Destination */}
        {/* Layout unificado: campos com swap flutuante no centro */}
        <div className="relative mb-4">
          {/* Layout Mobile: campos empilhados */}
          <div className="sm:hidden flex flex-col gap-2">
            <AirportField
              label={t.search.from}
              icon={<PlaneDepartIcon className="text-ink-muted" />}
              value={state.from}
              onChange={handleFromChange}
              exclude={state.to?.code}
              placeholder={t.search.origin}
            />
            
            <AirportField
              label={t.search.to}
              icon={<MapPinIcon className="text-ink-muted" />}
              value={state.to}
              onChange={handleToChange}
              exclude={state.from?.code}
              placeholder={t.search.destination}
            />
            
            {/* Swap button mobile - direita */}
            <div className="absolute z-10 top-1/2 -translate-y-1/2 right-3">
              <SwapButton onClick={handleSwap} />
            </div>
          </div>
          
          {/* Layout Desktop: campos lado a lado com swap no centro */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-2">
            <AirportField
              label={t.search.from}
              icon={<PlaneDepartIcon className="text-ink-muted" />}
              value={state.from}
              onChange={handleFromChange}
              exclude={state.to?.code}
              placeholder={t.search.origin}
            />

            {/* Swap button desktop - centro */}
            <SwapButton onClick={handleSwap} />

            <AirportField
              label={t.search.to}
              icon={<MapPinIcon className="text-ink-muted" />}
              value={state.to}
              onChange={handleToChange}
              exclude={state.from?.code}
              placeholder={t.search.destination}
            />
          </div>
        </div>

        {/* Row 2: Dates + Travelers + Search */}
        <div className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2">
          <DateField
            label={t.search.departDate}
            icon={<CalendarIcon className="text-ink-muted" />}
            departDate={state.departDate}
            returnDate={state.returnDate}
            onApply={handleDatesApply}
            isRoundtrip={state.tripType === "roundtrip"}
            focusField="depart"
            placeholder={t.search.addDate}
          />

          <DateField
            label={t.search.returnDate}
            icon={<CalendarIcon className="text-ink-muted" />}
            departDate={state.departDate}
            returnDate={state.returnDate}
            onApply={handleDatesApply}
            isRoundtrip={state.tripType === "roundtrip"}
            focusField="return"
            disabled={state.tripType === "oneway"}
            placeholder={t.search.addDate}
          />

          {/* Travelers */}
          <div className="relative col-span-2 sm:col-span-1">
            <button
              ref={paxButtonRef}
              type="button"
              onClick={() => setPaxOpen(true)}
              className={`
                w-full h-12 px-3 text-left
                border rounded-xl
                flex items-center gap-2
                transition-all duration-150
                ${paxOpen
                  ? "border-blue ring-1 ring-blue/20"
                  : "border-[var(--field-border)] hover:border-[var(--ink)]/20"
                }
              `}
              style={{ background: "var(--field-bg)" }}
            >
              <UsersIcon className="text-ink-muted flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-ink-muted">
                  {t.search.travelers}
                </div>
                <div className="text-sm text-ink truncate">
                  {formatPaxSummary(state.pax, state.cabinClass, t)}
                </div>
              </div>
            </button>
            
            <PaxClassPopover
              isOpen={paxOpen}
              onClose={() => setPaxOpen(false)}
              pax={state.pax}
              cabinClass={state.cabinClass}
              onApply={handlePaxApply}
              triggerRef={paxButtonRef}
            />
          </div>

          {/* Search button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid}
            className={`
              col-span-2 sm:col-span-1
              h-12 px-8 rounded-xl
              text-sm font-medium
              transition-all duration-150
              ${isValid
                ? "bg-blue text-cream-soft hover:bg-blue-soft cursor-pointer"
                : "bg-ink/10 text-ink-muted cursor-not-allowed"
              }
            `}
          >
            {mode === "compact" ? t.search.apply : t.search.search}
          </button>
        </div>
      </div>
    </div>
  );
}
