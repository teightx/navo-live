"use client";

import { ReactNode } from "react";

interface SegmentProps {
  label: string;
  value: string;
  placeholder?: string;
  onClick?: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
}

export function Segment({
  label,
  value,
  placeholder = "",
  onClick,
  isActive = false,
  disabled = false,
  children,
  className = "",
}: SegmentProps) {
  const hasValue = value && value !== placeholder;

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        data-popover-trigger
        className={`
          w-full h-full px-4 py-3 text-left
          rounded-xl transition-colors duration-150
          ${isActive 
            ? "bg-cream ring-1 ring-blue-soft" 
            : "hover:bg-cream/50"
          }
          ${disabled 
            ? "opacity-50 cursor-not-allowed" 
            : "cursor-pointer"
          }
        `}
      >
        <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-0.5">
          {label}
        </div>
        <div className={`text-sm font-medium truncate ${hasValue ? "text-ink" : "text-ink-muted"}`}>
          {hasValue ? value : placeholder}
        </div>
      </button>
      {children}
    </div>
  );
}

