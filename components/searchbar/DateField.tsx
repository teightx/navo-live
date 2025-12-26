"use client";

import { useState } from "react";
import { CalendarPopover } from "./CalendarPopover";

interface DateFieldProps {
  label: string;
  departDate: string | null;
  returnDate: string | null;
  onApply: (depart: string | null, returnD: string | null) => void;
  isRoundtrip: boolean;
  focusField: "depart" | "return";
  disabled?: boolean;
}

const MONTHS = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez"
];

function formatDateDisplay(date: string | null): string {
  if (!date) return "";
  const [year, month, day] = date.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

export function DateField({
  label,
  departDate,
  returnDate,
  onApply,
  isRoundtrip,
  focusField,
  disabled = false,
}: DateFieldProps) {
  const [isOpen, setIsOpen] = useState(false);

  const displayValue =
    focusField === "depart"
      ? formatDateDisplay(departDate)
      : formatDateDisplay(returnDate);

  const placeholder = disabled ? "—" : "adicionar data";

  return (
    <div className="relative">
      {/* Campo */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={`
          w-full px-4 py-3 text-left
          bg-cream/60 border rounded-xl
          transition-all duration-150
          ${isOpen
            ? "border-blue-soft bg-cream ring-1 ring-blue-soft/30"
            : "border-cream-dark/60 hover:border-cream-dark hover:bg-cream/80"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-0.5">
          {label}
        </div>
        <div
          className={`text-sm truncate ${
            displayValue ? "font-medium text-ink" : "text-ink-muted"
          }`}
        >
          {displayValue || placeholder}
        </div>
      </button>

      {/* Calendar Popover */}
      <CalendarPopover
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        departDate={departDate}
        returnDate={returnDate}
        onApply={onApply}
        isRoundtrip={isRoundtrip}
        focusField={focusField}
      />
    </div>
  );
}

