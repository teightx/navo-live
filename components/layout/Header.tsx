"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
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

interface HeaderProps {
  /**
   * Variant controls header styling:
   * - "home": Transparent/glass header (used on homepage)
   * - "default": Solid header with backdrop blur
   */
  variant?: "home" | "default";
}

export function Header({ variant = "default" }: HeaderProps) {
  const { t } = useI18n();
  const { resolvedTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(true);

  // Mount state for theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  // Track scroll for home variant
  // Na Home, o scroll acontece dentro de um container <main>, não no window
  useEffect(() => {
    if (variant !== "home") return;

    // Procura o container de scroll da home (main com overflow-y-auto)
    const scrollContainer = document.querySelector("main.h-screen");
    
    function handleScroll() {
      if (scrollContainer) {
        setScrolled(scrollContainer.scrollTop > 50);
      } else {
        setScrolled(window.scrollY > 50);
      }
    }

    // Adiciona listener no container ou window
    const target = scrollContainer || window;
    target.addEventListener("scroll", handleScroll, { passive: true });
    
    // Checa estado inicial
    handleScroll();
    
    return () => target.removeEventListener("scroll", handleScroll);
  }, [variant]);

  // IntersectionObserver to detect if hero is visible (for home variant)
  useEffect(() => {
    if (variant !== "home" || typeof window === "undefined") return;

    // Find the hero section (first section in main)
    const heroSection = document.querySelector("main > section:first-child");
    if (!heroSection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Hero is visible if at least 30% is showing
          setIsHeroVisible(entry.isIntersecting && entry.intersectionRatio > 0.3);
        });
      },
      {
        threshold: [0, 0.1, 0.3, 0.5, 1],
        rootMargin: "-60px 0px 0px 0px", // Account for header height
      }
    );

    observer.observe(heroSection);
    return () => observer.disconnect();
  }, [variant]);

  // Header classes based on variant
  const isHome = variant === "home";
  
  // Home variant styling - respects dark/light theme
  let headerClasses: string;
  
  if (isHome) {
    if (!scrolled) {
      // No topo: completamente transparente
      headerClasses = "fixed top-0 left-0 right-0 z-50 bg-transparent transition-all duration-300";
    } else if (isHeroVisible) {
      // Scrolled mas ainda no hero: glass sutil que combina com hero
      headerClasses = isDark
        ? "fixed top-0 left-0 right-0 z-50 bg-[#1a1a1f]/60 backdrop-blur-md border-b border-white/5 transition-all duration-300"
        : "fixed top-0 left-0 right-0 z-50 bg-[#fcf2ed]/70 backdrop-blur-md border-b border-black/5 transition-all duration-300";
    } else {
      // Fora do hero (seção de feriados): glass que combina com fundo sólido
      headerClasses = isDark
        ? "fixed top-0 left-0 right-0 z-50 bg-[#0B0F17]/80 backdrop-blur-md border-b border-white/5 transition-all duration-300"
        : "fixed top-0 left-0 right-0 z-50 bg-[#F4F1EB]/80 backdrop-blur-md border-b border-black/5 transition-all duration-300";
    }
  } else {
    // Outras páginas: header sólido padrão
    headerClasses = "fixed top-0 left-0 right-0 z-50 bg-cream/80 dark:bg-cream/90 backdrop-blur-sm border-b border-cream-dark/20";
  }

  const mobileMenuClasses = isHome
    ? isDark
      ? "sm:hidden bg-[#0B0F17]/95 backdrop-blur-md border-b border-white/10"
      : "sm:hidden bg-[#F4F1EB]/95 backdrop-blur-md border-b border-black/10"
    : "sm:hidden bg-cream/95 dark:bg-cream/98 backdrop-blur-md border-b border-cream-dark/20";

  return (
    <header className={headerClasses}>
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
        <div className={mobileMenuClasses}>
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
