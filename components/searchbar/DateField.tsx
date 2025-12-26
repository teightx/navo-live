"use client";

import { useState, ReactNode } from "react";
import { CalendarPopover } from "./CalendarPopover";
import { useI18n } from "@/lib/i18n";

interface DateFieldProps {
  label: string;
  icon?: ReactNode;
  departDate: string | null;
  returnDate: string | null;
  onApply: (depart: string | null, returnD: string | null) => void;
  isRoundtrip: boolean;
  focusField: "depart" | "return";
  disabled?: boolean;
  placeholder?: string;
}

const MONTHS_PT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MONTHS_EN = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

export function DateField({
  label,
  icon,
  departDate,
  returnDate,
  onApply,
  isRoundtrip,
  focusField,
  disabled = false,
  placeholder,
}: DateFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { locale } = useI18n();

  const months = locale === "pt-BR" ? MONTHS_PT : MONTHS_EN;

  function formatDateDisplay(date: string | null): string {
    if (!date) return "";
    const [year, month, day] = date.split("-").map(Number);
    return `${day} ${months[month - 1]} ${year}`;
  }

  const displayValue =
    focusField === "depart"
      ? formatDateDisplay(departDate)
      : formatDateDisplay(returnDate);

  const displayPlaceholder = disabled ? "—" : (placeholder || "add date");

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={`
          w-full h-12 px-3 text-left
          border rounded-xl
          flex items-center gap-2
          transition-all duration-150
          ${isOpen
            ? "border-blue ring-1 ring-blue/20"
            : disabled
              ? "border-[var(--field-border)] opacity-50 cursor-not-allowed"
              : "border-[var(--field-border)] hover:border-[var(--ink)]/20 cursor-pointer"
          }
        `}
        style={{ background: "var(--field-bg)" }}
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
            className={`text-sm leading-tight truncate ${
              disabled 
                ? "text-ink-muted/50" 
                : displayValue 
                  ? "text-ink" 
                  : "text-ink-muted"
            }`}
          >
            {displayValue || displayPlaceholder}
          </div>
        </div>
      </button>

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
