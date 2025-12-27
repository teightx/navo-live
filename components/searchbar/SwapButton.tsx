"use client";

interface SwapButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

// Ícone horizontal (↔) para desktop
function HorizontalSwapIcon() {
  return (
    <svg 
      width="14" 
      height="14" 
      viewBox="0 0 14 14" 
      fill="none" 
      className="text-ink-soft"
    >
      <path 
        d="M3.5 5L1.5 7L3.5 9" 
        stroke="currentColor" 
        strokeWidth="1.2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M10.5 5L12.5 7L10.5 9" 
        stroke="currentColor" 
        strokeWidth="1.2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M1.5 7H9" 
        stroke="currentColor" 
        strokeWidth="1.2" 
        strokeLinecap="round"
      />
      <path 
        d="M12.5 7H5" 
        stroke="currentColor" 
        strokeWidth="1.2" 
        strokeLinecap="round"
      />
    </svg>
  );
}

// Ícone vertical (↕) para mobile - layout DE em cima, PARA embaixo
function VerticalSwapIcon() {
  return (
    <svg 
      width="14" 
      height="14" 
      viewBox="0 0 14 14" 
      fill="none" 
      className="text-ink-soft"
    >
      <path 
        d="M5 3.5L7 1.5L9 3.5" 
        stroke="currentColor" 
        strokeWidth="1.2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M5 10.5L7 12.5L9 10.5" 
        stroke="currentColor" 
        strokeWidth="1.2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M7 1.5V9" 
        stroke="currentColor" 
        strokeWidth="1.2" 
        strokeLinecap="round"
      />
      <path 
        d="M7 12.5V5" 
        stroke="currentColor" 
        strokeWidth="1.2" 
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SwapButton({ onClick, disabled = false }: SwapButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="inverter origem e destino"
      className={`
        flex-shrink-0 w-8 h-8 rounded-full
        flex items-center justify-center
        border transition-all duration-150
        ${disabled 
          ? "opacity-50 cursor-not-allowed border-[var(--field-border)] bg-[var(--field-bg)]" 
          : "border-[var(--field-border)] bg-[var(--card-bg)] hover:bg-blue hover:border-blue hover:text-cream-soft cursor-pointer shadow-sm"
        }
      `}
      style={{
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      {/* Mobile: ícone vertical, Desktop: ícone horizontal */}
      <span className="sm:hidden">
        <VerticalSwapIcon />
      </span>
      <span className="hidden sm:block">
        <HorizontalSwapIcon />
      </span>
    </button>
  );
}
