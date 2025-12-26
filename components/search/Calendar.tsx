"use client";

import { useMemo, useState } from "react";

interface CalendarProps {
  selectedStart?: Date | null;
  selectedEnd?: Date | null;
  onSelectDate: (date: Date) => void;
  selectingEnd?: boolean;
}

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MONTHS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

function isInRange(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const time = date.getTime();
  return time > start.getTime() && time < end.getTime();
}

export function Calendar({
  selectedStart,
  selectedEnd,
  onSelectDate,
  selectingEnd = false,
}: CalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(() => {
    if (selectingEnd && selectedStart) {
      return new Date(selectedStart.getFullYear(), selectedStart.getMonth(), 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const result: (Date | null)[] = [];

    for (let i = 0; i < startPadding; i++) {
      result.push(null);
    }

    for (let d = 1; d <= totalDays; d++) {
      result.push(new Date(year, month, d));
    }

    return result;
  }, [year, month]);

  const goToPrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const isPastDate = (date: Date): boolean => {
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date.getTime() < todayStart.getTime();
  };

  const isBeforeStart = (date: Date): boolean => {
    if (!selectingEnd || !selectedStart) return false;
    return date.getTime() < selectedStart.getTime();
  };

  return (
    <div className="w-72 bg-white border border-cream-dark rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goToPrevMonth}
          className="w-8 h-8 flex items-center justify-center text-ink-soft hover:text-ink hover:bg-cream rounded transition-colors"
          aria-label="mês anterior"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <span className="text-sm font-medium text-ink lowercase">
          {MONTHS[month]} {year}
        </span>

        <button
          type="button"
          onClick={goToNextMonth}
          className="w-8 h-8 flex items-center justify-center text-ink-soft hover:text-ink hover:bg-cream rounded transition-colors"
          aria-label="próximo mês"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-xs text-ink-muted lowercase"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} className="h-9" />;
          }

          const isToday = isSameDay(date, today);
          const isSelectedStart = selectedStart && isSameDay(date, selectedStart);
          const isSelectedEnd = selectedEnd && isSameDay(date, selectedEnd);
          const isSelected = isSelectedStart || isSelectedEnd;
          const inRange = isInRange(date, selectedStart, selectedEnd);
          const isPast = isPastDate(date);
          const isDisabled = isPast || isBeforeStart(date);

          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelectDate(date)}
              className={`
                h-9 flex items-center justify-center text-sm rounded transition-colors
                ${isDisabled
                  ? "text-ink-muted/40 cursor-not-allowed"
                  : "hover:bg-cream cursor-pointer"
                }
                ${isSelected
                  ? "bg-blue text-white hover:bg-blue-soft"
                  : ""
                }
                ${inRange && !isSelected
                  ? "bg-blue-muted/20"
                  : ""
                }
                ${isToday && !isSelected
                  ? "font-medium text-blue"
                  : ""
                }
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

