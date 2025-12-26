"use client";

import { useEffect } from "react";
import { SearchBar } from "@/components/searchbar";
import type { SearchState } from "@/lib/types/search";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialState: Partial<SearchState>;
  onSearch: (state: SearchState) => void;
}

export function SearchModal({ isOpen, onClose, initialState, onSearch }: SearchModalProps) {
  // Bloqueia scroll quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Fecha com ESC
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-start justify-center pt-20 px-4 overflow-y-auto">
        <div 
          className="relative w-full max-w-4xl mb-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botão fechar */}
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 w-10 h-10 flex items-center justify-center text-cream-soft hover:text-white transition-colors"
            aria-label="fechar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          <SearchBar
            initialState={initialState}
            onSearch={(state) => {
              onSearch(state);
              onClose();
            }}
            mode="compact"
          />
        </div>
      </div>
    </div>
  );
}

