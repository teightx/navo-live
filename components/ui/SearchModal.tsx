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
  const contentRef = useRef<HTMLDivElement>(null);

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

  // Não fazer focus automático para evitar que popovers abram automaticamente
  // O usuário pode clicar no campo quando quiser

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999]" ref={modalRef}>
      {/* Overlay - clicável para fechar */}
      <div 
        className="absolute inset-0 backdrop-blur-sm transition-opacity cursor-pointer"
        style={{ background: "rgba(0, 0, 0, 0.2)" }}
        onClick={(e) => {
          // Garantir que o clique no overlay fecha o modal
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        aria-hidden="true"
      />

      {/* Desktop: Modal centralizado */}
      <div 
        className="hidden sm:flex absolute inset-0 items-center justify-center px-4"
        onClick={(e) => {
          // Fechar se clicar no container (mas não no conteúdo)
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div 
          ref={contentRef}
          className="relative w-full max-w-4xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="search-modal-title"
        >
          {/* Botão fechar */}
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors hover:opacity-80 z-10"
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

      {/* Mobile: Bottom Sheet */}
      <div 
        className="sm:hidden absolute inset-0 flex flex-col justify-end"
        onClick={(e) => {
          // Fechar se clicar no container (mas não no bottom sheet)
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div 
          className="w-full max-h-[90vh] rounded-t-2xl overflow-hidden animate-slide-up relative z-10"
          style={{
            background: "var(--card-bg)",
            boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.15)",
          }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="search-modal-title"
        >
          {/* Handle bar - clicável para fechar */}
          <button
            onClick={onClose}
            className="w-full flex justify-center pt-3 pb-2 cursor-pointer active:opacity-70"
            aria-label="fechar"
          >
            <div 
              className="w-10 h-1 rounded-full pointer-events-none"
              style={{ background: "var(--ink-muted)", opacity: 0.3 }}
            />
          </button>

          {/* Botão fechar mobile */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full transition-colors z-20"
            style={{
              background: "var(--cream-dark)",
              color: "var(--ink)",
            }}
            aria-label="fechar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Conteúdo com scroll */}
          <div 
            ref={contentRef}
            className="overflow-y-auto max-h-[calc(90vh-60px)] px-4 pb-6"
          >
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
    </div>
  );
}
