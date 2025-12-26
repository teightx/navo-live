"use client";

import { useState, useEffect, useRef } from "react";
import { Popover } from "./Popover";
import type { TripType } from "@/lib/types/search";

interface DatePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  tripType: TripType;
  departDate: string | null;
  returnDate: string | null;
  onApply: (depart: string | null, returnD: string | null) => void;
  focusField?: "depart" | "return";
}

function formatDateInput(date: string | null): string {
  return date || "";
}

function getMinDate(): string {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

export function DatePopover({
  isOpen,
  onClose,
  tripType,
  departDate,
  returnDate,
  onApply,
  focusField = "depart",
}: DatePopoverProps) {
  const [localDepart, setLocalDepart] = useState(departDate);
  const [localReturn, setLocalReturn] = useState(returnDate);
  const departRef = useRef<HTMLInputElement>(null);
  const returnRef = useRef<HTMLInputElement>(null);

  // Sincroniza quando abre
  useEffect(() => {
    if (isOpen) {
      setLocalDepart(departDate);
      setLocalReturn(returnDate);

      // Foca no campo correto
      setTimeout(() => {
        if (focusField === "return" && tripType === "roundtrip" && returnRef.current) {
          returnRef.current.focus();
        } else if (departRef.current) {
          departRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, departDate, returnDate, focusField, tripType]);

  // Limpa volta quando muda para só ida
  useEffect(() => {
    if (tripType === "oneway") {
      setLocalReturn(null);
    }
  }, [tripType]);

  function handleApply() {
    onApply(localDepart, tripType === "oneway" ? null : localReturn);
    onClose();
  }

  const isValid = localDepart !== null && localDepart !== "";

  return (
    <Popover isOpen={isOpen} onClose={onClose} className="w-[280px] p-4">
      <div className="space-y-4">
        <div className="text-xs uppercase tracking-wider text-ink-muted mb-3">
          selecione as datas
        </div>

        {/* Data de ida */}
        <div>
          <label className="block text-xs text-ink-soft mb-1.5">ida</label>
          <input
            ref={departRef}
            type="date"
            value={formatDateInput(localDepart)}
            onChange={(e) => setLocalDepart(e.target.value || null)}
            min={getMinDate()}
            className="
              w-full h-10 px-3 rounded-lg
              bg-cream border border-cream-dark
              text-sm text-ink
              focus:outline-none focus:ring-1 focus:ring-blue-soft
              transition-all duration-150
            "
          />
        </div>

        {/* Data de volta (só se roundtrip) */}
        {tripType === "roundtrip" && (
          <div>
            <label className="block text-xs text-ink-soft mb-1.5">volta</label>
            <input
              ref={returnRef}
              type="date"
              value={formatDateInput(localReturn)}
              onChange={(e) => setLocalReturn(e.target.value || null)}
              min={localDepart || getMinDate()}
              className="
                w-full h-10 px-3 rounded-lg
                bg-cream border border-cream-dark
                text-sm text-ink
                focus:outline-none focus:ring-1 focus:ring-blue-soft
                transition-all duration-150
              "
            />
          </div>
        )}

        {/* Botão aplicar */}
        <button
          type="button"
          onClick={handleApply}
          disabled={!isValid}
          className={`
            w-full h-10 rounded-xl text-sm font-medium
            transition-colors duration-150
            ${isValid 
              ? "bg-blue text-cream-soft hover:bg-blue-soft" 
              : "bg-cream-dark text-ink-muted cursor-not-allowed"
            }
          `}
        >
          aplicar
        </button>
      </div>
    </Popover>
  );
}
