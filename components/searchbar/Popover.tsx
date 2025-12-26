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
      className={`absolute top-full mt-2 z-50 rounded-xl ${alignmentClasses[align]} ${className}`}
      style={{
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.6)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
      }}
    >
      {children}
    </div>
  );
}
