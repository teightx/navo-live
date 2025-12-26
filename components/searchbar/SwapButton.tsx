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
        flex-shrink-0 w-10 h-10 rounded-full
        flex items-center justify-center
        bg-cream/80 border border-ink/10
        transition-all duration-150
        ${disabled 
          ? "opacity-50 cursor-not-allowed" 
          : "hover:bg-blue hover:border-blue hover:text-cream-soft cursor-pointer"
        }
      `}
    >
      <svg 
        width="18" 
        height="18" 
        viewBox="0 0 18 18" 
        fill="none" 
        className="text-ink-soft"
      >
        <path 
          d="M4.5 6.75L2.25 9L4.5 11.25" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M13.5 6.75L15.75 9L13.5 11.25" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M2.25 9H11.25" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round"
        />
        <path 
          d="M15.75 9H6.75" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
