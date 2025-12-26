"use client";

import { useEffect, useRef, ReactNode } from "react";

interface PopoverProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}

export function Popover({
  isOpen,
  onClose,
  children,
  align = "left",
  className = "",
}: PopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        // Verifica se o clique não foi no elemento pai (segmento)
        const target = event.target as HTMLElement;
        if (!target.closest("[data-popover-trigger]")) {
          onClose();
        }
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const alignmentClasses = {
    left: "left-0",
    center: "left-1/2 -translate-x-1/2",
    right: "right-0",
  };

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-modal="true"
      className={`
        absolute top-full mt-2 z-50
        bg-cream-soft border border-cream-dark rounded-xl
        shadow-lg shadow-ink/5
        animate-in fade-in slide-in-from-top-2 duration-150
        ${alignmentClasses[align]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

