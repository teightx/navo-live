"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-cream-dark/30 bg-cream-dark/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <span className="font-medium text-ink">navo</span>
            <span className="hidden sm:inline">·</span>
            <span className="text-center sm:text-left">{t.footer.disclaimer}</span>
          </div>

          <nav className="flex items-center gap-6">
            <Link
              href="/termos"
              className="text-sm text-ink-muted hover:text-blue transition-colors lowercase"
            >
              {t.footer.terms}
            </Link>
            <Link
              href="/privacidade"
              className="text-sm text-ink-muted hover:text-blue transition-colors lowercase"
            >
              {t.footer.privacy}
            </Link>
            <a
              href="mailto:contato@navo.live"
              className="text-sm text-ink-muted hover:text-blue transition-colors lowercase"
            >
              {t.footer.contact}
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
