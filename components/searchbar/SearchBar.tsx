"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SwapButton } from "./SwapButton";
import { TripTypeSelect } from "./TripTypeSelect";
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
function PlaneIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path 
        d="M14 4L9 8L14 12M2 8H9M5 5L2 8L5 11" 
        stroke="currentColor" 
        strokeWidth="1.2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MapPinIcon({ className = "" }: { className?: string }) {
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

function CalendarIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M2 6H14" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M5 1.5V3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M11 1.5V3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function UsersIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M1 14C1 11.2386 3.23858 9 6 9C8.76142 9 11 11.2386 11 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="11" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M12 9C13.6569 9.5 15 11.067 15 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export function SearchBar() {
  const router = useRouter();
  const [state, setState] = useState<SearchState>(defaultSearchState);
  const [paxOpen, setPaxOpen] = useState(false);

  // Handlers
  function handleTripTypeChange(tripType: TripType) {
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
      {/* Card principal com sombra e bordas arredondadas */}
      <div 
        className="bg-cream-soft border border-cream-dark/40 rounded-2xl p-6 sm:p-8"
        style={{
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.06), 0px 4px 8px rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* LINHA 1: Para onde (origem + destino) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          {/* Origem */}
          <div className="flex-1">
            <AirportField
              label="de"
              icon={<PlaneIcon className="text-ink-muted" />}
              value={state.from}
              onChange={handleFromChange}
              exclude={state.to?.code}
              placeholder="origem"
            />
          </div>

          {/* Botão Swap */}
          <div className="hidden sm:flex items-center justify-center">
            <SwapButton onClick={handleSwap} />
          </div>

          {/* Destino */}
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

        {/* LINHA 2: Quando (datas) */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="flex-1">
            <DateField
              label="ida"
              icon={<CalendarIcon className="text-ink-muted" />}
              departDate={state.departDate}
              returnDate={state.returnDate}
              onApply={handleDatesApply}
              isRoundtrip={state.tripType === "roundtrip"}
              focusField="depart"
            />
          </div>

          <div className="flex-1">
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
          </div>
        </div>

        {/* LINHA 3: Quem + Buscar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* TripType Select */}
          <TripTypeSelect
            value={state.tripType}
            onChange={handleTripTypeChange}
          />

          {/* Viajantes e classe */}
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => setPaxOpen(true)}
              className={`
                w-full h-14 px-4 text-left
                bg-cream/80 border rounded-xl
                flex items-center gap-3
                transition-all duration-150
                ${paxOpen
                  ? "border-blue ring-2 ring-blue/20"
                  : "border-ink/10 hover:border-ink/20 hover:bg-cream"
                }
              `}
            >
              <UsersIcon className="text-ink-muted flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-ink-muted">
                  viajantes
                </div>
                <div className="text-sm font-medium text-ink truncate">
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

          {/* Espaçador desktop */}
          <div className="hidden sm:block flex-1 max-w-[100px]" />

          {/* Botão buscar - destaque principal */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid}
            className={`
              h-14 px-10 rounded-xl
              text-base font-semibold uppercase tracking-wide
              transition-all duration-200
              ${isValid
                ? "bg-blue text-cream-soft hover:bg-blue-soft shadow-md shadow-blue/25 hover:shadow-lg hover:shadow-blue/30 cursor-pointer"
                : "bg-cream-dark text-ink-muted cursor-not-allowed"
              }
            `}
          >
            buscar
          </button>
        </div>
      </div>
    </div>
  );
}
