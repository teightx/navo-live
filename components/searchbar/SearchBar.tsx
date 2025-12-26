"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Segment } from "./Segment";
import { SwapButton } from "./SwapButton";
import { TripTypeSelect } from "./TripTypeSelect";
import { AirportPopover } from "./AirportPopover";
import { DatePopover } from "./DatePopover";
import { PaxClassPopover } from "./PaxClassPopover";
import type { SearchState, TripType, Pax, CabinClass } from "@/lib/types/search";
import { defaultSearchState } from "@/lib/types/search";
import { cabinClassLabels } from "@/lib/mocks/searchConfig";
import type { Airport } from "@/lib/mocks/airports";

type ActivePopover = "from" | "to" | "dates" | "pax" | null;
type DateFocus = "depart" | "return";

function formatDate(date: string | null): string {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  return `${day}/${month}`;
}

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
  const [activePopover, setActivePopover] = useState<ActivePopover>(null);
  const [dateFocus, setDateFocus] = useState<DateFocus>("depart");

  const togglePopover = useCallback((popover: ActivePopover) => {
    setActivePopover((current) => (current === popover ? null : popover));
  }, []);

  const closePopover = useCallback(() => {
    setActivePopover(null);
  }, []);

  // Handlers
  function handleTripTypeChange(tripType: TripType) {
    setState((s) => ({
      ...s,
      tripType,
      returnDate: tripType === "oneway" ? null : s.returnDate,
    }));
  }

  function handleFromSelect(airport: Airport) {
    setState((s) => ({ ...s, from: airport }));
  }

  function handleToSelect(airport: Airport) {
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

  function openDatePopover(focus: DateFocus) {
    setDateFocus(focus);
    setActivePopover("dates");
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
      <div className="bg-cream-soft/90 backdrop-blur-sm border border-cream-dark rounded-2xl p-4 sm:p-5">
        {/* Linha 1: Origem + Swap + Destino + Ida + Volta */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          {/* Origem */}
          <div className="flex-1 relative">
            <Segment
              label="de"
              value={state.from ? `${state.from.city.toLowerCase()} (${state.from.code.toLowerCase()})` : ""}
              placeholder="origem"
              onClick={() => togglePopover("from")}
              isActive={activePopover === "from"}
            >
              <AirportPopover
                isOpen={activePopover === "from"}
                onClose={closePopover}
                onSelect={handleFromSelect}
                exclude={state.to?.code}
              />
            </Segment>
          </div>

          {/* Botão Swap */}
          <div className="hidden sm:flex items-center justify-center">
            <SwapButton onClick={handleSwap} />
          </div>

          {/* Destino */}
          <div className="flex-1 relative">
            <Segment
              label="para"
              value={state.to ? `${state.to.city.toLowerCase()} (${state.to.code.toLowerCase()})` : ""}
              placeholder="destino"
              onClick={() => togglePopover("to")}
              isActive={activePopover === "to"}
            >
              <AirportPopover
                isOpen={activePopover === "to"}
                onClose={closePopover}
                onSelect={handleToSelect}
                exclude={state.from?.code}
              />
            </Segment>
          </div>

          {/* Ida */}
          <div className="relative sm:w-[120px]">
            <Segment
              label="ida"
              value={formatDate(state.departDate)}
              placeholder="data"
              onClick={() => openDatePopover("depart")}
              isActive={activePopover === "dates" && dateFocus === "depart"}
            >
              <DatePopover
                isOpen={activePopover === "dates"}
                onClose={closePopover}
                tripType={state.tripType}
                departDate={state.departDate}
                returnDate={state.returnDate}
                onApply={handleDatesApply}
                focusField={dateFocus}
              />
            </Segment>
          </div>

          {/* Volta */}
          <div className="relative sm:w-[120px]">
            <Segment
              label="volta"
              value={state.tripType === "roundtrip" ? formatDate(state.returnDate) : ""}
              placeholder={state.tripType === "roundtrip" ? "data" : "—"}
              onClick={() => openDatePopover("return")}
              isActive={activePopover === "dates" && dateFocus === "return"}
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
          <div className="relative flex-1 sm:max-w-[280px]">
            <Segment
              label="viajantes"
              value={formatPaxSummary(state.pax, state.cabinClass)}
              onClick={() => togglePopover("pax")}
              isActive={activePopover === "pax"}
            >
              <PaxClassPopover
                isOpen={activePopover === "pax"}
                onClose={closePopover}
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
              h-12 px-8 rounded-full
              text-sm font-medium lowercase
              transition-colors duration-150
              ${isValid
                ? "bg-blue text-cream-soft hover:bg-blue-soft cursor-pointer"
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
