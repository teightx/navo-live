"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { pt, type Messages } from "./messages/pt";
import { en } from "./messages/en";

export type Locale = "pt" | "en";

const messages: Record<Locale, Messages> = { pt, en };

interface I18nContextValue {
  locale: Locale;
  t: Messages;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "navo-locale";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("pt");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && (stored === "pt" || stored === "en")) {
      setLocaleState(stored);
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    document.documentElement.lang = newLocale === "pt" ? "pt-BR" : "en-US";
  }, []);

  const value: I18nContextValue = {
    locale,
    t: messages[locale],
    setLocale,
  };

  if (!mounted) {
    return (
      <I18nContext.Provider value={{ locale: "pt", t: pt, setLocale }}>
        {children}
      </I18nContext.Provider>
    );
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}

