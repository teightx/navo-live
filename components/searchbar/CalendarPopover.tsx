"use client";

import { useState, useEffect, useMemo, RefObject } from "react";
import { FloatingPopover } from "@/components/ui/FloatingPopover";
import { useI18n } from "@/lib/i18n";

interface CalendarPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  departDate: string | null;
  returnDate: string | null;
  onApply: (depart: string | null, returnD: string | null) => void;
  isRoundtrip: boolean;
  focusField: "depart" | "return";
  triggerRef?: RefObject<HTMLElement | null>;
}

type DateMode = "specific" | "flexible";
type FlexibleOption = "7days" | "month";

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

const MONTHS_SHORT_PT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MONTHS_SHORT_EN = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

// Preços mockados por mês (para demonstração visual)
function getMockMonthlyPrices(): { month: number; year: number; price: number; isCheapest: boolean }[] {
  const today = new Date();
  const prices = [];
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
    // Preços aleatórios entre 800 e 2500
    const basePrice = 800 + Math.random() * 1700;
    prices.push({
      month: date.getMonth(),
      year: date.getFullYear(),
      price: Math.round(basePrice),
      isCheapest: false,
    });
  }
  
  // Marca o mais barato
  const cheapestIdx = prices.reduce((minIdx, curr, idx, arr) => 
    curr.price < arr[minIdx].price ? idx : minIdx, 0);
  prices[cheapestIdx].isCheapest = true;
  
  return prices;
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
  triggerRef,
}: CalendarPopoverProps) {
  const { locale } = useI18n();
  const weekdays = locale === "pt" ? WEEKDAYS_PT : WEEKDAYS_EN;
  const months = locale === "pt" ? MONTHS_PT : MONTHS_EN;
  const monthsShort = locale === "pt" ? MONTHS_SHORT_PT : MONTHS_SHORT_EN;

  const [dateMode, setDateMode] = useState<DateMode>("specific");
  const [flexibleOption, setFlexibleOption] = useState<FlexibleOption>("7days");
  const [selectedFlexMonth, setSelectedFlexMonth] = useState<{ month: number; year: number } | null>(null);

  // Preços mockados (gerados uma vez)
  const monthlyPrices = useMemo(() => getMockMonthlyPrices(), []);

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

  function handleFlexMonthSelect(month: number, year: number) {
    setSelectedFlexMonth({ month, year });
    // Para demo, aplica o primeiro dia do mês
    const date = new Date(year, month, 15); // Meio do mês
    onApply(formatToISO(date), null);
    onClose();
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

  const modeLabels = locale === "pt" 
    ? { specific: "data específica", flexible: "datas flexíveis" }
    : { specific: "specific date", flexible: "flexible dates" };

  const flexLabels = locale === "pt"
    ? { "7days": "± 7 dias", month: "mês mais barato" }
    : { "7days": "± 7 days", month: "cheapest month" };

  const instructionText = locale === "pt" 
    ? (focusField === "depart" ? "selecione a data de ida" : "selecione a data de volta")
    : (focusField === "depart" ? "select departure date" : "select return date");

  return (
    <FloatingPopover
      open={isOpen}
      anchorRef={triggerRef!}
      onClose={onClose}
      className={dateMode === "flexible" && flexibleOption === "month" ? "w-[340px]" : "w-[300px]"}
      maxHeight={520}
    >
      <div className="p-4">
        {/* Mode Toggle */}
        <div className="flex gap-1 p-1 rounded-lg mb-4" style={{ background: "var(--cream-dark)" }}>
          <button
            type="button"
            onClick={() => setDateMode("specific")}
            className={`
              flex-1 py-1.5 px-3 text-xs font-medium rounded-md
              transition-all duration-150
              ${dateMode === "specific"
                ? "bg-white text-ink shadow-sm"
                : "text-ink-muted hover:text-ink"
              }
            `}
            style={dateMode === "specific" ? { background: "var(--popover-bg)" } : {}}
          >
            {modeLabels.specific}
          </button>
          <button
            type="button"
            onClick={() => setDateMode("flexible")}
            className={`
              flex-1 py-1.5 px-3 text-xs font-medium rounded-md
              transition-all duration-150
              ${dateMode === "flexible"
                ? "bg-white text-ink shadow-sm"
                : "text-ink-muted hover:text-ink"
              }
            `}
            style={dateMode === "flexible" ? { background: "var(--popover-bg)" } : {}}
          >
            {modeLabels.flexible}
          </button>
        </div>

        {dateMode === "specific" ? (
          <>
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
          </>
        ) : (
          <>
            {/* Flexible Options */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setFlexibleOption("7days")}
                className={`
                  flex-1 py-2 px-3 text-xs font-medium rounded-lg
                  border transition-all duration-150
                  ${flexibleOption === "7days"
                    ? "border-blue bg-blue/5 text-blue"
                    : "border-[var(--field-border)] text-ink-muted hover:border-ink/20"
                  }
                `}
              >
                {flexLabels["7days"]}
              </button>
              <button
                type="button"
                onClick={() => setFlexibleOption("month")}
                className={`
                  flex-1 py-2 px-3 text-xs font-medium rounded-lg
                  border transition-all duration-150
                  ${flexibleOption === "month"
                    ? "border-blue bg-blue/5 text-blue"
                    : "border-[var(--field-border)] text-ink-muted hover:border-ink/20"
                  }
                `}
              >
                {flexLabels.month}
              </button>
            </div>

            {flexibleOption === "7days" ? (
              <>
                {/* 7 days flexible - same calendar with ± indicator */}
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
                    
                    // Para modo flexível, mostra range visual ao redor da data selecionada
                    let inFlexRange = false;
                    if (localDepart) {
                      const diff = Math.abs(date.getTime() - localDepart.getTime()) / (1000 * 60 * 60 * 24);
                      inFlexRange = diff <= 7 && diff > 0;
                    }

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
                            ? "text-ink-muted/30 cursor-not-allowed"
                            : isSelected
                              ? "bg-blue text-white font-medium"
                              : inFlexRange
                                ? "bg-sage/20 text-ink"
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

                <div className="mt-3 text-xs text-ink-muted text-center">
                  {locale === "pt" 
                    ? "buscaremos voos 7 dias antes e depois"
                    : "we'll search flights 7 days before and after"
                  }
                </div>
              </>
            ) : (
              <>
                {/* Monthly grid with prices */}
                <div className="grid grid-cols-3 gap-2">
                  {monthlyPrices.map((item) => {
                    const isSelected = 
                      selectedFlexMonth?.month === item.month && 
                      selectedFlexMonth?.year === item.year;
                    
                    return (
                      <button
                        key={`${item.year}-${item.month}`}
                        type="button"
                        onClick={() => handleFlexMonthSelect(item.month, item.year)}
                        className={`
                          p-3 rounded-xl text-center
                          border transition-all duration-150
                          ${isSelected
                            ? "border-blue bg-blue/5"
                            : item.isCheapest
                              ? "border-sage bg-sage/10"
                              : "border-[var(--field-border)] hover:border-ink/20"
                          }
                        `}
                      >
                        <div className={`text-xs font-medium mb-1 ${isSelected ? "text-blue" : "text-ink"}`}>
                          {monthsShort[item.month]}
                        </div>
                        <div className={`text-[10px] ${item.isCheapest ? "text-sage font-medium" : "text-ink-muted"}`}>
                          R$ {item.price}
                        </div>
                        {item.isCheapest && (
                          <div className="mt-1">
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sage/20 text-sage font-medium">
                              {locale === "pt" ? "mais barato" : "cheapest"}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 text-xs text-ink-muted text-center">
                  {locale === "pt" 
                    ? "preços estimados · podem variar"
                    : "estimated prices · may vary"
                  }
                </div>
              </>
            )}
          </>
        )}
      </div>
    </FloatingPopover>
  );
}
