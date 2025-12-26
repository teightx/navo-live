"use client";

import { useState, useEffect, useMemo } from "react";
import { Popover } from "./Popover";
import { useI18n } from "@/lib/i18n";

interface CalendarPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  departDate: string | null;
  returnDate: string | null;
  onApply: (depart: string | null, returnD: string | null) => void;
  isRoundtrip: boolean;
  focusField: "depart" | "return";
}

const WEEKDAYS_PT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const WEEKDAYS_EN = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const MONTHS_PT = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
];
const MONTHS_EN = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december"
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
  const { locale } = useI18n();
  const weekdays = locale === "pt" ? WEEKDAYS_PT : WEEKDAYS_EN;
  const months = locale === "pt" ? MONTHS_PT : MONTHS_EN;

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
      onApply(dateISO, null);
      onClose();
    } else if (focusField === "depart") {
      if (returnDate && date >= parseDate(returnDate)) {
        onApply(dateISO, null);
      } else {
        onApply(dateISO, returnDate);
      }
      onClose();
    } else {
      if (departDate && date <= parseDate(departDate)) {
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

  const instructionText = locale === "pt" 
    ? (focusField === "depart" ? "selecione a data de ida" : "selecione a data de volta")
    : (focusField === "depart" ? "select departure date" : "select return date");

  return (
    <Popover isOpen={isOpen} onClose={onClose} className="w-[300px] p-4">
      {/* Header */}
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
              : "text-ink hover:bg-cream-dark/50"
            }
          `}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="text-sm font-medium text-ink">
          {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className="w-8 h-8 rounded-full flex items-center justify-center text-ink hover:bg-cream-dark/50 transition-colors duration-100"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-[10px] uppercase tracking-wider text-ink-muted"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
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
                        ? "ring-1 ring-blue/40 text-ink hover:bg-cream-dark/50"
                        : "text-ink hover:bg-cream-dark/50"
                }
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Instruction */}
      <div className="mt-3 text-xs text-ink-muted text-center">
        {instructionText}
      </div>
    </Popover>
  );
}
