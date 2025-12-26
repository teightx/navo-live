"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Segment } from "./Segment";
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
      <div className="bg-cream-soft/95 backdrop-blur-sm border border-cream-dark/50 rounded-2xl p-5 sm:p-6 shadow-sm shadow-ink/5">
        {/* Linha 1: Origem + Swap + Destino + Ida + Volta */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          {/* Origem */}
          <AirportField
            label="de"
            value={state.from}
            onChange={handleFromChange}
            exclude={state.to?.code}
            placeholder="origem"
          />

          {/* Botão Swap */}
          <div className="hidden sm:flex items-center justify-center flex-shrink-0">
            <SwapButton onClick={handleSwap} />
          </div>

          {/* Destino */}
          <AirportField
            label="para"
            value={state.to}
            onChange={handleToChange}
            exclude={state.from?.code}
            placeholder="destino"
          />

          {/* Ida */}
          <div className="sm:w-[130px] flex-shrink-0">
            <DateField
              label="ida"
              departDate={state.departDate}
              returnDate={state.returnDate}
              onApply={handleDatesApply}
              isRoundtrip={state.tripType === "roundtrip"}
              focusField="depart"
            />
          </div>

          {/* Volta */}
          <div className="sm:w-[130px] flex-shrink-0">
            <DateField
              label="volta"
              departDate={state.departDate}
              returnDate={state.returnDate}
              onApply={handleDatesApply}
              isRoundtrip={state.tripType === "roundtrip"}
              focusField="return"
              disabled={state.tripType === "oneway"}
            />
          </div>
        </div>

        {/* Linha 2: TripType + Viajantes + Buscar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* TripType Select */}
          <TripTypeSelect
            value={state.tripType}
            onChange={handleTripTypeChange}
          />

          {/* Viajantes e classe */}
          <div className="relative flex-1 sm:max-w-[300px]">
            <Segment
              label="viajantes"
              value={formatPaxSummary(state.pax, state.cabinClass)}
              onClick={() => setPaxOpen(true)}
              isActive={paxOpen}
              filled
            >
              <PaxClassPopover
                isOpen={paxOpen}
                onClose={() => setPaxOpen(false)}
                pax={state.pax}
                cabinClass={state.cabinClass}
                onApply={handlePaxApply}
              />
            </Segment>
          </div>

          {/* Espaçador */}
          <div className="hidden sm:block flex-1" />

          {/* Botão buscar */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid}
            className={`
              h-12 px-10 rounded-full
              text-sm font-medium lowercase
              transition-all duration-150
              ${isValid
                ? "bg-blue text-cream-soft hover:bg-blue-soft shadow-sm shadow-blue/20 cursor-pointer"
                : "bg-cream-dark/80 text-ink-muted cursor-not-allowed"
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
