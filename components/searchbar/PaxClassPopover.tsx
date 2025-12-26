"use client";

import { useState, useEffect } from "react";
import { Popover } from "./Popover";
import type { Pax, CabinClass } from "@/lib/types/search";
import { cabinClasses, cabinClassLabels, paxLimits } from "@/lib/mocks/searchConfig";

interface PaxClassPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  pax: Pax;
  cabinClass: CabinClass;
  onApply: (pax: Pax, cabinClass: CabinClass) => void;
}

interface CounterProps {
  label: string;
  sublabel?: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

function Counter({ label, sublabel, value, min, max, onChange }: CounterProps) {
  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <div className="text-sm text-ink">{label}</div>
        {sublabel && <div className="text-xs text-ink-muted">{sublabel}</div>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(value - 1)}
          disabled={!canDecrement}
          className={`
            w-8 h-8 rounded-full flex items-center justify-center
            border transition-colors duration-100
            ${canDecrement 
              ? "border-blue-soft text-blue hover:bg-blue hover:text-cream-soft" 
              : "border-cream-dark text-ink-muted cursor-not-allowed"
            }
          `}
        >
          <svg width="12" height="2" viewBox="0 0 12 2" fill="none">
            <path d="M0 1H12" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </button>
        <span className="w-6 text-center text-sm font-medium text-ink">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          disabled={!canIncrement}
          className={`
            w-8 h-8 rounded-full flex items-center justify-center
            border transition-colors duration-100
            ${canIncrement 
              ? "border-blue-soft text-blue hover:bg-blue hover:text-cream-soft" 
              : "border-cream-dark text-ink-muted cursor-not-allowed"
            }
          `}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 0V12M0 6H12" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export function PaxClassPopover({
  isOpen,
  onClose,
  pax,
  cabinClass,
  onApply,
}: PaxClassPopoverProps) {
  const [localPax, setLocalPax] = useState<Pax>(pax);
  const [localCabin, setLocalCabin] = useState<CabinClass>(cabinClass);

  // Sincroniza quando abre
  useEffect(() => {
    if (isOpen) {
      setLocalPax(pax);
      setLocalCabin(cabinClass);
    }
  }, [isOpen, pax, cabinClass]);

  const totalPax = localPax.adults + localPax.children;
  const maxAdults = Math.min(paxLimits.adults.max, paxLimits.total - localPax.children);
  const maxChildren = Math.min(paxLimits.children.max, paxLimits.total - localPax.adults);
  const maxInfants = Math.min(paxLimits.infants.max, localPax.adults);

  function handleApply() {
    onApply(localPax, localCabin);
    onClose();
  }

  return (
    <Popover isOpen={isOpen} onClose={onClose} align="right" className="w-[300px] p-4">
      <div className="space-y-4">
        {/* Classe da cabine */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-ink-muted mb-2">
            classe da cabine
          </label>
          <select
            value={localCabin}
            onChange={(e) => setLocalCabin(e.target.value as CabinClass)}
            className="
              w-full h-10 px-3 rounded-lg
              bg-cream border border-cream-dark
              text-sm text-ink
              focus:outline-none focus:ring-1 focus:ring-blue-soft
              transition-all duration-150
              appearance-none cursor-pointer
            "
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%235a5a5a' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
            }}
          >
            {cabinClasses.map((cabin) => (
              <option key={cabin} value={cabin}>
                {cabinClassLabels[cabin]}
              </option>
            ))}
          </select>
        </div>

        {/* Divisor */}
        <div className="h-px bg-cream-dark" />

        {/* Viajantes */}
        <div>
          <div className="text-xs uppercase tracking-wider text-ink-muted mb-2">
            viajantes
          </div>

          <Counter
            label="adultos"
            sublabel="12+ anos"
            value={localPax.adults}
            min={paxLimits.adults.min}
            max={maxAdults}
            onChange={(v) => setLocalPax((p) => ({ 
              ...p, 
              adults: v,
              // Ajusta bebês se necessário
              infants: Math.min(p.infants, v)
            }))}
          />

          <Counter
            label="crianças"
            sublabel="2-11 anos"
            value={localPax.children}
            min={paxLimits.children.min}
            max={maxChildren}
            onChange={(v) => setLocalPax((p) => ({ ...p, children: v }))}
          />

          <Counter
            label="bebês"
            sublabel="até 2 anos"
            value={localPax.infants}
            min={paxLimits.infants.min}
            max={maxInfants}
            onChange={(v) => setLocalPax((p) => ({ ...p, infants: v }))}
          />

          {totalPax >= paxLimits.total && (
            <div className="text-xs text-ink-muted mt-2">
              máximo de {paxLimits.total} passageiros
            </div>
          )}
        </div>

        {/* Botão aplicar */}
        <button
          type="button"
          onClick={handleApply}
          className="
            w-full h-10 rounded-xl text-sm font-medium
            bg-blue text-cream-soft hover:bg-blue-soft
            transition-colors duration-150
          "
        >
          aplicar
        </button>
      </div>
    </Popover>
  );
}

