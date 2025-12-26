"use client";

import { useState, useEffect, RefObject } from "react";
import { FloatingPopover } from "@/components/ui/FloatingPopover";
import { useI18n } from "@/lib/i18n";
import type { Pax, CabinClass } from "@/lib/types/search";
import { cabinClasses, paxLimits } from "@/lib/mocks/searchConfig";

interface PaxClassPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  pax: Pax;
  cabinClass: CabinClass;
  onApply: (pax: Pax, cabinClass: CabinClass) => void;
  triggerRef?: RefObject<HTMLElement | null>;
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
        <div className="text-sm" style={{ color: "var(--ink)" }}>{label}</div>
        {sublabel && <div className="text-xs" style={{ color: "var(--ink-muted)" }}>{sublabel}</div>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(value - 1)}
          disabled={!canDecrement}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-100"
          style={{
            border: canDecrement ? "1px solid var(--blue-soft)" : "1px solid var(--cream-dark)",
            color: canDecrement ? "var(--blue)" : "var(--ink-muted)",
            opacity: canDecrement ? 1 : 0.5,
            cursor: canDecrement ? "pointer" : "not-allowed",
          }}
        >
          <svg width="12" height="2" viewBox="0 0 12 2" fill="none">
            <path d="M0 1H12" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </button>
        <span className="w-6 text-center text-sm font-medium" style={{ color: "var(--ink)" }}>{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          disabled={!canIncrement}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-100"
          style={{
            border: canIncrement ? "1px solid var(--blue-soft)" : "1px solid var(--cream-dark)",
            color: canIncrement ? "var(--blue)" : "var(--ink-muted)",
            opacity: canIncrement ? 1 : 0.5,
            cursor: canIncrement ? "pointer" : "not-allowed",
          }}
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
  triggerRef,
}: PaxClassPopoverProps) {
  const { t, locale } = useI18n();
  const [localPax, setLocalPax] = useState<Pax>(pax);
  const [localCabin, setLocalCabin] = useState<CabinClass>(cabinClass);

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

  const isPt = locale === "pt";
  const ageLabels = isPt 
    ? { adults: "12+ anos", children: "2-11 anos", infants: "até 2 anos" }
    : { adults: "12+ years", children: "2-11 years", infants: "under 2" };

  const maxPaxLabel = isPt 
    ? `máximo de ${paxLimits.total} passageiros`
    : `maximum ${paxLimits.total} passengers`;

  function handleApply() {
    onApply(localPax, localCabin);
    onClose();
  }

  return (
    <FloatingPopover
      open={isOpen}
      anchorRef={triggerRef!}
      onClose={onClose}
      placement="bottom-end"
      className="w-[300px]"
      maxHeight={420}
    >
      <div className="p-4 space-y-4">
        {/* Cabin class */}
        <div>
          <label 
            className="block text-xs uppercase tracking-wider mb-2"
            style={{ color: "var(--ink-muted)" }}
          >
            {locale === "pt" ? "classe da cabine" : "cabin class"}
          </label>
          <select
            value={localCabin}
            onChange={(e) => setLocalCabin(e.target.value as CabinClass)}
            className="w-full h-10 px-3 rounded-lg text-sm focus:outline-none transition-all duration-150 appearance-none cursor-pointer"
            style={{
              background: "var(--field-bg)",
              border: "1px solid var(--field-border)",
              color: "var(--ink)",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%238a8a8a' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
            }}
          >
            {cabinClasses.map((cabin) => (
              <option key={cabin} value={cabin}>
                {t.search.cabin[cabin as keyof typeof t.search.cabin]}
              </option>
            ))}
          </select>
        </div>

        {/* Divider */}
        <div className="h-px" style={{ background: "var(--cream-dark)" }} />

        {/* Travelers */}
        <div>
          <div 
            className="text-xs uppercase tracking-wider mb-2"
            style={{ color: "var(--ink-muted)" }}
          >
            {t.search.travelers}
          </div>

          <Counter
            label={t.search.adults}
            sublabel={ageLabels.adults}
            value={localPax.adults}
            min={paxLimits.adults.min}
            max={maxAdults}
            onChange={(v) => setLocalPax((p) => ({ 
              ...p, 
              adults: v,
              infants: Math.min(p.infants, v)
            }))}
          />

          <Counter
            label={t.search.children}
            sublabel={ageLabels.children}
            value={localPax.children}
            min={paxLimits.children.min}
            max={maxChildren}
            onChange={(v) => setLocalPax((p) => ({ ...p, children: v }))}
          />

          <Counter
            label={t.search.infants}
            sublabel={ageLabels.infants}
            value={localPax.infants}
            min={paxLimits.infants.min}
            max={maxInfants}
            onChange={(v) => setLocalPax((p) => ({ ...p, infants: v }))}
          />

          {totalPax >= paxLimits.total && (
            <div className="text-xs mt-2" style={{ color: "var(--ink-muted)" }}>
              {maxPaxLabel}
            </div>
          )}
        </div>

        {/* Apply button */}
        <button
          type="button"
          onClick={handleApply}
          className="w-full h-10 rounded-xl text-sm font-medium transition-colors duration-150"
          style={{
            background: "var(--blue)",
            color: "var(--cream-soft)",
          }}
        >
          {t.search.apply}
        </button>
      </div>
    </FloatingPopover>
  );
}
