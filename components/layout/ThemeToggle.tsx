"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

function SunIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 1V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 15V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M1 9H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15 9H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3.34 3.34L4.76 4.76" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13.24 13.24L14.66 14.66" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3.34 14.66L4.76 13.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13.24 4.76L14.66 3.34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M15.5 10.5C14.5 12.5 12.5 14 10 14C6.5 14 4 11.5 4 8C4 5.5 5.5 3.5 7.5 2.5C6.5 4 6.5 6.5 8 8C9.5 9.5 12 9.5 13.5 8.5C14.5 9 15.5 9.5 15.5 10.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="w-9 h-9 flex items-center justify-center rounded-lg text-ink-muted"
        aria-label="Alternar tema"
      >
        <div className="w-[18px] h-[18px]" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-9 h-9 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-cream-dark/50 transition-colors"
      aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

