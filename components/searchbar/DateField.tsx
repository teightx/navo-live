"use client";

import { useState, ReactNode } from "react";
import { CalendarPopover } from "./CalendarPopover";

interface DateFieldProps {
  label: string;
  icon?: ReactNode;
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
  icon,
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
          w-full h-14 px-4 text-left
          bg-cream/80 border rounded-xl
          flex items-center gap-3
          transition-all duration-150
          ${isOpen
            ? "border-blue ring-2 ring-blue/20"
            : disabled
              ? "border-ink/5 bg-cream-dark/30 cursor-not-allowed"
              : "border-ink/10 hover:border-ink/20 hover:bg-cream cursor-pointer"
          }
        `}
      >
        {icon && (
          <div className={`flex-shrink-0 ${disabled ? "opacity-40" : ""}`}>
            {icon}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className={`text-[10px] uppercase tracking-wider ${disabled ? "text-ink-muted/50" : "text-ink-muted"}`}>
            {label}
          </div>
          <div
            className={`text-sm truncate ${
              disabled 
                ? "text-ink-muted/50" 
                : displayValue 
                  ? "font-medium text-ink" 
                  : "text-ink-muted"
            }`}
          >
            {displayValue || placeholder}
          </div>
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
