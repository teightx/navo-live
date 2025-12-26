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
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [currentMonth, setCurrentMonth] = useState(() => {
    if (focusField === "return" && returnDate) {
      return parseDate(returnDate);
    }
    if (departDate) {
      return parseDate(departDate);
    }
    return today;
  });

  // Sincroniza quando abre
  useEffect(() => {
    if (isOpen) {
      if (focusField === "return" && returnDate) {
        setCurrentMonth(parseDate(returnDate));
      } else if (departDate) {
        setCurrentMonth(parseDate(departDate));
      } else {
        setCurrentMonth(today);
      }
    }
  }, [isOpen, departDate, returnDate, focusField, today]);

  // Gera dias do mês atual
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();

    const days: (Date | null)[] = [];

    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  }, [currentMonth]);

  function handleDayClick(date: Date) {
    if (date < today) return;

    const dateISO = formatToISO(date);

    if (!isRoundtrip) {
      // Só ida - aplica e fecha
      onApply(dateISO, null);
      onClose();
    } else if (focusField === "depart") {
      // Selecionando ida
      // Se a data selecionada é depois da volta, limpa volta
      if (returnDate && date >= parseDate(returnDate)) {
        onApply(dateISO, null);
      } else {
        onApply(dateISO, returnDate);
      }
      onClose();
    } else {
      // Selecionando volta
      if (departDate && date <= parseDate(departDate)) {
        // Se clicou antes ou igual à ida, não faz nada
        return;
      }
      onApply(departDate, dateISO);
      onClose();
    }
  }

  function handlePrevMonth() {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }

  function handleNextMonth() {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }

  const isPrevDisabled =
    currentMonth.getFullYear() === today.getFullYear() &&
    currentMonth.getMonth() === today.getMonth();

  const localDepart = departDate ? parseDate(departDate) : null;
  const localReturn = returnDate ? parseDate(returnDate) : null;

  return (
    <Popover isOpen={isOpen} onClose={onClose} className="w-[300px] p-4">
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
              ? "text-ink-muted/40 cursor-not-allowed"
              : "text-ink hover:bg-ink/5"
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
          className="w-8 h-8 rounded-full flex items-center justify-center text-ink hover:bg-ink/5 transition-colors duration-100"
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
      <div className="grid grid-cols-7 gap-1">
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

          // Se estamos selecionando volta e a data é <= ida, desabilita
          const isBeforeDepart = focusField === "return" && localDepart ? date <= localDepart : false;

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => handleDayClick(date)}
              disabled={isPast || isBeforeDepart}
              className={`
                h-9 rounded-lg text-sm
                transition-colors duration-100
                ${isPast || isBeforeDepart
                  ? "text-ink-muted/30 cursor-not-allowed"
                  : isSelected
                    ? "bg-blue text-white font-medium"
                    : inRange
                      ? "bg-blue/10 text-ink"
                      : isToday
                        ? "ring-1 ring-blue/40 text-ink hover:bg-ink/5"
                        : "text-ink hover:bg-ink/5"
                }
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Instrução sutil */}
      <div className="mt-3 text-xs text-ink-muted text-center">
        {focusField === "depart" ? "selecione a data de ida" : "selecione a data de volta"}
      </div>
    </Popover>
  );
}
