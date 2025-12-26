"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Airport, searchAirports, formatAirport } from "@/lib/mocks/airports";
import { AirportList } from "./AirportList";

interface AutocompleteFieldProps {
  label: string;
  value: Airport | null;
  onChange: (airport: Airport | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function AutocompleteField({
  label,
  value,
  onChange,
  placeholder = "",
  disabled = false,
}: AutocompleteFieldProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Airport[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = label.toLowerCase().replace(/\s+/g, "-");

  // Sincroniza input com value externo
  useEffect(() => {
    if (value) {
      setInputValue(formatAirport(value));
    }
  }, [value]);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Se tinha valor selecionado, restaura
        if (value) {
          setInputValue(formatAirport(value));
        } else {
          setInputValue("");
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue.length >= 2) {
      const searchResults = searchAirports(newValue);
      setResults(searchResults);
      setIsOpen(searchResults.length > 0);
      setHighlightedIndex(-1);
    } else {
      setResults([]);
      setIsOpen(false);
    }
    
    // Limpa seleção anterior se estiver digitando
    if (value) {
      onChange(null);
    }
  }, [value, onChange]);

  const handleSelect = useCallback((airport: Airport) => {
    onChange(airport);
    setInputValue(formatAirport(airport));
    setIsOpen(false);
    setResults([]);
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && results[highlightedIndex]) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  }, [isOpen, results, highlightedIndex, handleSelect]);

  const handleFocus = useCallback(() => {
    if (inputValue.length >= 2) {
      const searchResults = searchAirports(inputValue);
      if (searchResults.length > 0) {
        setResults(searchResults);
        setIsOpen(true);
      }
    }
  }, [inputValue]);

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="text-xs text-ink-soft lowercase tracking-wide"
      >
        {label}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        className={`
          h-12 px-4 w-full
          bg-cream-soft border rounded-lg
          text-ink text-base lowercase
          placeholder:text-ink-muted placeholder:lowercase
          transition-colors duration-150
          outline-none
          ${disabled
            ? "bg-cream-dark/30 border-cream-dark cursor-not-allowed"
            : "border-cream-dark hover:border-blue-soft focus:border-blue"
          }
        `}
      />
      {isOpen && (
        <AirportList
          airports={results}
          onSelect={handleSelect}
          highlightedIndex={highlightedIndex}
        />
      )}
    </div>
  );
}

