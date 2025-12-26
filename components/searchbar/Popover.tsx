"use client";

import { useEffect, useRef, useState, ReactNode, RefObject } from "react";
import { Portal } from "@/components/ui/Portal";

interface PopoverProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  triggerRef?: RefObject<HTMLElement | null>;
  align?: "left" | "center" | "right";
  className?: string;
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    function handleChange(e: MediaQueryListEvent) {
      setMatches(e.matches);
    }

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}

export function Popover({
  isOpen,
  onClose,
  children,
  triggerRef,
  align = "left",
  className = "",
}: PopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const isMobile = useMediaQuery("(max-width: 640px)");

  // Calcula posição baseada no trigger
  useEffect(() => {
    if (!isOpen || !triggerRef?.current) return;

    function updatePosition() {
      if (!triggerRef?.current) return;
      
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      
      let left = rect.left;
      if (align === "center") {
        left = rect.left + rect.width / 2;
      } else if (align === "right") {
        left = rect.right;
      }

      setPosition({
        top: rect.bottom + 8,
        left,
        width: rect.width,
      });
    }

    updatePosition();

    // Atualiza ao redimensionar ou scroll
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, triggerRef, align]);

  // Fecha ao clicar fora
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      
      // Não fecha se clicou no trigger
      if (triggerRef?.current?.contains(target)) return;
      
      // Não fecha se clicou dentro do popover
      if (popoverRef.current?.contains(target)) return;

      onClose();
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    // Delay para evitar conflito com o click que abriu
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, triggerRef]);

  // Bloqueia scroll do body no mobile quando aberto
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isMobile, isOpen]);

  if (!isOpen) return null;

  // Mobile: Bottom sheet
  if (isMobile) {
    return (
      <Portal>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 z-[100] bg-black/30 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
        
        {/* Bottom sheet */}
        <div
          ref={popoverRef}
          role="dialog"
          aria-modal="true"
          className={`
            fixed left-0 right-0 bottom-0 z-[101]
            rounded-t-2xl max-h-[85vh] overflow-y-auto
            animate-slide-up
            ${className}
          `}
          style={{
            background: "var(--popover-bg)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid var(--card-border)",
            borderBottom: "none",
            boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.2)",
          }}
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2">
            <div 
              className="w-10 h-1 rounded-full"
              style={{ background: "var(--ink-muted)", opacity: 0.3 }}
            />
          </div>
          {children}
        </div>
      </Portal>
    );
  }

  // Desktop: Popover flutuante ancorado
  const alignTransform = 
    align === "center" ? "translateX(-50%)" :
    align === "right" ? "translateX(-100%)" : 
    "translateX(0)";

  return (
    <Portal>
      <div
        ref={popoverRef}
        role="dialog"
        aria-modal="true"
        className={`fixed z-[100] rounded-xl ${className}`}
        style={{
          top: position.top,
          left: position.left,
          transform: alignTransform,
          background: "var(--popover-bg)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid var(--card-border)",
          boxShadow: "var(--card-shadow)",
        }}
      >
        {children}
      </div>
    </Portal>
  );
}
