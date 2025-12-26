"use client";

import { ReactNode, forwardRef } from "react";

interface SegmentProps {
  label: string;
  value?: string;
  placeholder?: string;
  onClick?: () => void;
  isActive?: boolean;
  disabled?: boolean;
  filled?: boolean;
  children?: ReactNode;
  className?: string;
  as?: "button" | "div";
}

export const Segment = forwardRef<HTMLDivElement, SegmentProps>(
  function Segment(
    {
      label,
      value,
      placeholder = "",
      onClick,
      isActive = false,
      disabled = false,
      filled,
      children,
      className = "",
      as = "button",
    },
    ref
  ) {
    const hasValue = filled ?? (value && value !== placeholder);

    const content = (
      <>
        <div className="text-[10px] uppercase tracking-wider text-ink-muted mb-0.5">
          {label}
        </div>
        <div
          className={`text-sm truncate ${
            hasValue ? "font-medium text-ink" : "text-ink-muted"
          }`}
        >
          {hasValue && value ? value : placeholder}
        </div>
      </>
    );

    const baseClasses = `
      w-full h-full px-4 py-3 text-left
      bg-cream/60 border rounded-xl
      transition-all duration-150
      ${isActive
        ? "border-blue-soft bg-cream ring-1 ring-blue-soft/30"
        : "border-cream-dark/60 hover:border-cream-dark hover:bg-cream/80"
      }
      ${disabled
        ? "opacity-50 cursor-not-allowed"
        : "cursor-pointer"
      }
    `;

    if (as === "div") {
      return (
        <div ref={ref} className={`relative ${className}`}>
          <div className={baseClasses}>{content}</div>
          {children}
        </div>
      );
    }

    return (
      <div ref={ref} className={`relative ${className}`}>
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          data-popover-trigger
          className={baseClasses}
        >
          {content}
        </button>
        {children}
      </div>
    );
  }
);
