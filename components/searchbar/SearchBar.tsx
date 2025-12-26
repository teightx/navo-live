"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SwapButton } from "./SwapButton";
import { AirportField } from "./AirportField";
import { DateField } from "./DateField";
import { PaxClassPopover } from "./PaxClassPopover";
import type { SearchState, TripType, Pax, CabinClass } from "@/lib/types/search";
import { defaultSearchState } from "@/lib/types/search";
import { cabinClassLabels } from "@/lib/mocks/searchConfig";
import type { Airport } from "@/lib/mocks/airports";

function formatPaxSummary(pax: Pax, cabin: CabinClass): string {
  const parts: string[] = [];
  
  if (pax.adults === 1 && pax.children === 0 && pax.infants === 0) {
    parts.push("1 adulto");
  } else {
    if (pax.adults > 0) {
      parts.push(`${pax.adults} ${pax.adults === 1 ? "adulto" : "adultos"}`);
    }
    if (pax.children > 0) {
      parts.push(`${pax.children} ${pax.children === 1 ? "criança" : "crianças"}`);
    }
    if (pax.infants > 0) {
      parts.push(`${pax.infants} ${pax.infants === 1 ? "bebê" : "bebês"}`);
    }
  }
  
  return `${parts.join(", ")}, ${cabinClassLabels[cabin]}`;
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
  
  // Cria estado inicial mesclado com useMemo para evitar recriação
  const mergedInitialState = useMemo(() => ({
    ...defaultSearchState,
    ...initialState,
  }), [initialState]);

  const [state, setState] = useState<SearchState>(mergedInitialState);
  const [paxOpen, setPaxOpen] = useState(false);

  // Handlers
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

  // Validação
  const isValid =
    state.from !== null &&
    state.to !== null &&
    state.departDate !== null &&
    (state.tripType === "oneway" || state.returnDate !== null);

  // Submit
  function handleSubmit() {
    if (!isValid) return;

    if (onSearch) {
      onSearch(state);
      return;
    }

    const params = new URLSearchParams({
      from: state.from!.code,
      to: state.to!.code,
      depart: state.departDate!,
      tripType: state.tripType,
      adults: String(state.pax.adults),
      children: String(state.pax.children),
      infants: String(state.pax.infants),
      cabin: state.cabinClass,
    });

    if (state.returnDate) {
      params.set("return", state.returnDate);
    }

    router.push(`/resultados?${params.toString()}`);
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Seletor de tipo de voo - acima do card, alinhado à esquerda */}
      <div className="mb-3 pl-1">
        <div className="relative inline-flex items-center">
          <select
            value={state.tripType}
            onChange={handleTripTypeChange}
            className="
              appearance-none bg-transparent
              text-sm text-ink-soft
              pr-5 cursor-pointer
              focus:outline-none
              hover:text-ink transition-colors
            "
          >
            <option value="roundtrip">ida e volta</option>
            <option value="oneway">só ida</option>
          </select>
          <ChevronDownIcon className="absolute right-0 pointer-events-none text-ink-muted" />
        </div>
      </div>

      {/* Card com efeito glass */}
      <div 
        className="rounded-2xl p-5 sm:p-6"
        style={{
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
        }}
      >
        {/* Linha 1: Trajeto (DE + PARA) */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1">
            <AirportField
              label="de"
              icon={<PlaneDepartIcon className="text-ink-muted" />}
              value={state.from}
              onChange={handleFromChange}
              exclude={state.to?.code}
              placeholder="origem"
            />
          </div>

          <SwapButton onClick={handleSwap} />

          <div className="flex-1">
            <AirportField
              label="para"
              icon={<MapPinIcon className="text-ink-muted" />}
              value={state.to}
              onChange={handleToChange}
              exclude={state.from?.code}
              placeholder="destino"
            />
          </div>
        </div>

        {/* Linha 2: Detalhes e Ação (IDA + VOLTA + VIAJANTES + BUSCAR) */}
        <div className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2">
          {/* Ida */}
          <DateField
            label="ida"
            icon={<CalendarIcon className="text-ink-muted" />}
            departDate={state.departDate}
            returnDate={state.returnDate}
            onApply={handleDatesApply}
            isRoundtrip={state.tripType === "roundtrip"}
            focusField="depart"
          />

          {/* Volta */}
          <DateField
            label="volta"
            icon={<CalendarIcon className="text-ink-muted" />}
            departDate={state.departDate}
            returnDate={state.returnDate}
            onApply={handleDatesApply}
            isRoundtrip={state.tripType === "roundtrip"}
            focusField="return"
            disabled={state.tripType === "oneway"}
          />

          {/* Viajantes */}
          <div className="relative col-span-2 sm:col-span-1">
            <button
              type="button"
              onClick={() => setPaxOpen(true)}
              className={`
                w-full h-12 px-3 text-left
                bg-white/60 border rounded-xl
                flex items-center gap-2
                transition-all duration-150
                ${paxOpen
                  ? "border-blue ring-1 ring-blue/20"
                  : "border-ink/10 hover:border-ink/20 hover:bg-white/80"
                }
              `}
            >
              <UsersIcon className="text-ink-muted flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-ink-muted">
                  viajantes
                </div>
                <div className="text-sm text-ink truncate">
                  {formatPaxSummary(state.pax, state.cabinClass)}
                </div>
              </div>
            </button>
            
            <PaxClassPopover
              isOpen={paxOpen}
              onClose={() => setPaxOpen(false)}
              pax={state.pax}
              cabinClass={state.cabinClass}
              onApply={handlePaxApply}
            />
          </div>

          {/* Botão buscar */}
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
            {mode === "compact" ? "aplicar" : "buscar"}
          </button>
        </div>
      </div>
    </div>
  );
}
