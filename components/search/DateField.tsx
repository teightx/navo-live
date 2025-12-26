"use client";

import { useRef, useState, useEffect } from "react";
import { Calendar } from "./Calendar";

interface DateFieldProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  otherDate?: Date | null;
  isEndDate?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function DateField({
  label,
  value,
  onChange,
  otherDate,
  isEndDate = false,
  placeholder = "selecionar",
  disabled = false,
}: DateFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputId = label.toLowerCase().replace(/\s+/g, "-");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectDate = (date: Date) => {
    onChange(date);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-xs text-ink-soft lowercase tracking-wide"
      >
        {label}
      </label>
      
      <button
        type="button"
        id={inputId}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`
          h-12 px-4 w-full text-left
          bg-white border rounded-lg
          text-base lowercase
          transition-colors duration-150
          outline-none flex items-center justify-between
          ${disabled
            ? "border-cream-dark bg-cream cursor-not-allowed text-ink-muted"
            : "border-cream-dark hover:border-blue-muted focus:border-blue-soft cursor-pointer"
          }
          ${isOpen ? "border-blue-soft" : ""}
          ${value ? "text-ink" : "text-ink-muted"}
        `}
      >
        <span>{value ? formatDate(value) : placeholder}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`text-ink-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50">
          <Calendar
            selectedStart={isEndDate ? otherDate : value}
            selectedEnd={isEndDate ? value : otherDate}
            onSelectDate={handleSelectDate}
            selectingEnd={isEndDate}
          />
        </div>
      )}
    </div>
  );
}

