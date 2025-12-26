"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  label: string;
  error?: string;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, id, disabled, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-xs text-ink-soft lowercase tracking-wide"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          {...props}
          className={`
            h-12 px-4 w-full
            bg-white border rounded-lg
            text-ink text-base lowercase
            placeholder:text-ink-muted placeholder:lowercase
            transition-colors duration-150
            outline-none
            ${disabled
              ? "border-cream-dark bg-cream cursor-not-allowed text-ink-muted"
              : "border-cream-dark hover:border-blue-muted focus:border-blue-soft"
            }
            ${error ? "border-accent" : ""}
          `}
        />
        {error && (
          <span className="text-xs text-accent">{error}</span>
        )}
      </div>
    );
  }
);

Field.displayName = "Field";

