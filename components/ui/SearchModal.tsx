"use client";

import { useEffect, useRef } from "react";
import { SearchBar } from "@/components/searchbar";
import type { SearchState } from "@/lib/types/search";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialState: Partial<SearchState>;
  onSearch: (state: SearchState) => void;
}

export function SearchModal({ isOpen, onClose, initialState, onSearch }: SearchModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

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

  // Focus no primeiro campo ao abrir
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Pequeno delay para garantir que o modal está renderizado
      const timer = setTimeout(() => {
        const firstInput = modalRef.current?.querySelector<HTMLInputElement>(
          'input[type="text"], input[type="search"]'
        );
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999]" ref={modalRef}>
      {/* Overlay */}
      <div 
        className="absolute inset-0 backdrop-blur-sm transition-opacity"
        style={{ background: "rgba(0, 0, 0, 0.2)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-start justify-center pt-12 sm:pt-20 px-4 overflow-y-auto">
        <div 
          className="relative w-full max-w-4xl mb-10"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="search-modal-title"
        >
          {/* Botão fechar */}
          <button
            onClick={onClose}
            className="absolute -top-10 sm:-top-12 right-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors"
            style={{
              background: "var(--card-bg)",
              color: "var(--ink)",
            }}
            aria-label="fechar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
