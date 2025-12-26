"use client";

import { useState, useEffect, useMemo } from "react";
import { Popover } from "./Popover";

interface CalendarPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  departDate: string | null;
  returnDate: string | null;
  onApply: (depart: string | null, returnD: string | null) => void;
  isRoundtrip: boolean;
  focusField: "depart" | "return";
}

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MONTHS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
];

function formatDateDisplay(date: string | null): string {
  if (!date) return "";
  const [year, month, day] = date.split("-").map(Number);
  const monthName = MONTHS[month - 1].slice(0, 3);
  return `${day} ${monthName} ${year}`;
}

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isInRange(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  return date > start && date < end;
}

export function CalendarPopover({
  isOpen,
  onClose,
  departDate,
  returnDate,
  onApply,
  isRoundtrip,
  focusField,
}: CalendarPopoverProps) {
  const today = useMemo(() => new Date(), []);
  today.setHours(0, 0, 0, 0);

  const [currentMonth, setCurrentMonth] = useState(() => {
    if (focusField === "return" && returnDate) {
      return parseDate(returnDate);
    }
    if (departDate) {
      return parseDate(departDate);
    }
    return today;
  });

  const [localDepart, setLocalDepart] = useState<Date | null>(
    departDate ? parseDate(departDate) : null
  );
  const [localReturn, setLocalReturn] = useState<Date | null>(
    returnDate ? parseDate(returnDate) : null
  );
  const [selectingReturn, setSelectingReturn] = useState(
    focusField === "return" && isRoundtrip
  );

  // Sincroniza quando abre
  useEffect(() => {
    if (isOpen) {
      setLocalDepart(departDate ? parseDate(departDate) : null);
      setLocalReturn(returnDate ? parseDate(returnDate) : null);
      setSelectingReturn(focusField === "return" && isRoundtrip);

      // Define o mês inicial baseado no foco
      if (focusField === "return" && returnDate) {
        setCurrentMonth(parseDate(returnDate));
      } else if (departDate) {
        setCurrentMonth(parseDate(departDate));
      } else {
        setCurrentMonth(today);
      }
    }
  }, [isOpen, departDate, returnDate, focusField, isRoundtrip, today]);

  // Gera dias do mês atual
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Padding inicial
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    // Dias do mês
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  }, [currentMonth]);

  function handleDayClick(date: Date) {
    if (date < today) return;

    if (!isRoundtrip) {
      // Só ida
      setLocalDepart(date);
      setLocalReturn(null);
    } else if (!selectingReturn || !localDepart) {
      // Selecionando ida
      setLocalDepart(date);
      setLocalReturn(null);
      setSelectingReturn(true);
    } else {
      // Selecionando volta
      if (date < localDepart) {
        // Se clicou antes da ida, reseta
        setLocalDepart(date);
        setLocalReturn(null);
      } else {
        setLocalReturn(date);
        setSelectingReturn(false);
      }
    }
  }

  function handlePrevMonth() {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }

  function handleNextMonth() {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }

  function handleClear() {
    setLocalDepart(null);
    setLocalReturn(null);
    setSelectingReturn(false);
  }

  function handleApply() {
    onApply(
      localDepart ? formatToISO(localDepart) : null,
      localReturn ? formatToISO(localReturn) : null
    );
    onClose();
  }

  const canApply = localDepart !== null;
  const isPrevDisabled =
    currentMonth.getFullYear() === today.getFullYear() &&
    currentMonth.getMonth() === today.getMonth();

  return (
    <Popover isOpen={isOpen} onClose={onClose} className="w-[320px] p-4">
      {/* Header do calendário */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          disabled={isPrevDisabled}
          className={`
            w-8 h-8 rounded-full flex items-center justify-center
            transition-colors duration-100
            ${isPrevDisabled
              ? "text-ink-muted cursor-not-allowed"
              : "text-ink hover:bg-cream"
            }
          `}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="text-sm font-medium text-ink">
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className="w-8 h-8 rounded-full flex items-center justify-center text-ink hover:bg-cream transition-colors duration-100"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-[10px] uppercase tracking-wider text-ink-muted"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid de dias */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="h-9" />;
          }

          const isPast = date < today;
          const isToday = isSameDay(date, today);
          const isSelectedDepart = localDepart && isSameDay(date, localDepart);
          const isSelectedReturn = localReturn && isSameDay(date, localReturn);
          const isSelected = isSelectedDepart || isSelectedReturn;
          const inRange = isInRange(date, localDepart, localReturn);

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => handleDayClick(date)}
              disabled={isPast}
              className={`
                h-9 rounded-lg text-sm
                transition-colors duration-100
                ${isPast
                  ? "text-ink-muted/40 cursor-not-allowed"
                  : isSelected
                    ? "bg-blue text-cream-soft font-medium"
                    : inRange
                      ? "bg-blue-soft/20 text-ink"
                      : isToday
                        ? "ring-1 ring-blue-soft/50 text-ink hover:bg-cream"
                        : "text-ink hover:bg-cream"
                }
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Resumo da seleção */}
      {isRoundtrip && (
        <div className="text-xs text-ink-muted mb-4 text-center">
          {!localDepart && "selecione a data de ida"}
          {localDepart && !localReturn && "selecione a data de volta"}
          {localDepart && localReturn && (
            <>
              {formatDateDisplay(formatToISO(localDepart))} →{" "}
              {formatDateDisplay(formatToISO(localReturn))}
            </>
          )}
        </div>
      )}

      {/* Botões */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleClear}
          className="flex-1 h-10 rounded-xl text-sm text-ink-soft hover:bg-cream transition-colors duration-100"
        >
          limpar
        </button>
        <button
          type="button"
          onClick={handleApply}
          disabled={!canApply}
          className={`
            flex-1 h-10 rounded-xl text-sm font-medium
            transition-colors duration-150
            ${canApply
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

