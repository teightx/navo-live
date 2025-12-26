"use client";

import { useI18n, type Locale } from "@/lib/i18n";

export function LanguageToggle() {
  const { locale, setLocale } = useI18n();

  const toggleLocale = () => {
    setLocale(locale === "pt" ? "en" : "pt");
  };

  return (
    <button
      onClick={toggleLocale}
      className="px-2.5 h-9 flex items-center justify-center rounded-lg text-sm font-medium text-ink-muted hover:text-ink hover:bg-cream-dark/50 transition-colors uppercase tracking-wide"
      aria-label={locale === "pt" ? "Change to English" : "Mudar para Português"}
    >
      {locale === "pt" ? "EN" : "PT"}
    </button>
  );
}

