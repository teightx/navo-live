"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";

interface PriceAlertCTAProps {
  route: string; // ex: "São Paulo → Miami"
  onSubscribe?: (email?: string) => void;
}

function BellIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path 
        d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9ZM13.73 21a2 2 0 0 1-3.46 0" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PriceAlertCTA({ route, onSubscribe }: PriceAlertCTAProps) {
  const { locale } = useI18n();
  const [isHovered, setIsHovered] = useState(false);

  const text = {
    pt: {
      title: "acompanhar preços",
      subtitle: "a gente te avisa se baixar.",
      cta: "ativar alerta",
      comingSoon: "em breve",
    },
    en: {
      title: "track prices",
      subtitle: "we'll notify you if it drops.",
      cta: "enable alert",
      comingSoon: "coming soon",
    },
  };

  const t = text[locale as "pt" | "en"] || text.pt;

  return (
    <div 
      className="relative overflow-hidden rounded-xl border p-4 mb-6 transition-all duration-200"
      style={{
        background: "var(--card-bg)",
        borderColor: isHovered ? "var(--blue)" : "var(--card-border)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Ícone e texto */}
        <div className="flex items-center gap-3">
          <div 
            className="flex items-center justify-center w-10 h-10 rounded-full transition-colors"
            style={{ 
              background: isHovered ? "var(--blue)" : "var(--cream-dark)",
              color: isHovered ? "var(--cream-soft)" : "var(--ink-muted)",
            }}
          >
            <BellIcon />
          </div>
          <div>
            <div className="text-sm font-medium text-ink">
              {t.title}
            </div>
            <div className="text-xs text-ink-muted">
              {t.subtitle}
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => onSubscribe?.()}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: "var(--blue)",
            color: "var(--cream-soft)",
          }}
        >
          {t.cta}
        </button>
      </div>

      {/* Tag "em breve" se não houver onSubscribe */}
      {!onSubscribe && (
        <div 
          className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-medium"
          style={{
            background: "var(--cream-dark)",
            color: "var(--ink-muted)",
          }}
        >
          {t.comingSoon}
        </div>
      )}
    </div>
  );
}

