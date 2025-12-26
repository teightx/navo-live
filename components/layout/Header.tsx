"use client";

import Link from "next/link";
import { useState } from "react";
import { LogoMark, Wordmark } from "@/components/brand";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { useI18n } from "@/lib/i18n";

function MenuIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 6H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 10H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3 14H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Header() {
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cream/80 dark:bg-cream/90 backdrop-blur-sm border-b border-cream-dark/20">
      <nav className="mx-auto max-w-5xl px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark className="w-7 h-7" />
          <Wordmark className="text-xl" />
        </Link>

        {/* Desktop navigation */}
        <div className="hidden sm:flex items-center gap-1">
          <Link
            href="/alertas"
            className="px-3 py-2 text-sm text-ink-soft hover:text-blue transition-colors lowercase rounded-lg hover:bg-cream-dark/30"
          >
            {t.header.alerts}
          </Link>
          <Link
            href="/como-funciona"
            className="px-3 py-2 text-sm text-ink-soft hover:text-blue transition-colors lowercase rounded-lg hover:bg-cream-dark/30"
          >
            {t.header.howItWorks}
          </Link>
          
          <div className="w-px h-5 bg-cream-dark/50 mx-2" />
          
          <LanguageToggle />
          <ThemeToggle />
        </div>

        {/* Mobile menu button */}
        <div className="flex sm:hidden items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-cream-dark/50 transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-cream/95 dark:bg-cream/98 backdrop-blur-md border-b border-cream-dark/20">
          <div className="px-4 py-3 space-y-1">
            <Link
              href="/alertas"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm text-ink-soft hover:text-blue transition-colors lowercase rounded-lg hover:bg-cream-dark/30"
            >
              {t.header.alerts}
            </Link>
            <Link
              href="/como-funciona"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm text-ink-soft hover:text-blue transition-colors lowercase rounded-lg hover:bg-cream-dark/30"
            >
              {t.header.howItWorks}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
