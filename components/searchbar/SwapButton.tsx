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
        flex-shrink-0 w-9 h-9 rounded-full
        flex items-center justify-center
        border border-cream-dark bg-cream
        transition-colors duration-150
        ${disabled 
          ? "opacity-50 cursor-not-allowed" 
          : "hover:bg-blue-soft hover:border-blue-soft hover:text-cream-soft cursor-pointer"
        }
      `}
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 16 16" 
        fill="none" 
        className="text-ink-soft"
      >
        <path 
          d="M4 6L1 9L4 12" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M12 4L15 7L12 10" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M1 9H10" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round"
        />
        <path 
          d="M15 7H6" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

