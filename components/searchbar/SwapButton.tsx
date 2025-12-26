"use client";

interface SwapButtonProps {
  onClick: () => void;
  disabled?: boolean;
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
        bg-white/60 border border-ink/10
        transition-all duration-150
        ${disabled 
          ? "opacity-50 cursor-not-allowed" 
          : "hover:bg-blue hover:border-blue hover:text-cream-soft cursor-pointer"
        }
      `}
    >
      <svg 
        width="14" 
        height="14" 
        viewBox="0 0 14 14" 
        fill="none" 
        className="text-ink-muted"
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
    </button>
  );
}
