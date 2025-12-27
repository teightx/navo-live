"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useI18n } from "@/lib/i18n";
import { useEffect, useState } from "react";

interface FooterProps {
  /**
   * Variant controls styling:
   * - "home": Used on homepage - no wave transition (already has WaveTransition above)
   * - "default": Used on other pages - includes wave transition
   */
  variant?: "home" | "default";
}

export function Footer({ variant = "default" }: FooterProps) {
  const { t } = useI18n();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  
  // Cor do footer igual à última onda (sage/verde)
  const footerBg = isDark 
    ? "rgb(35, 42, 32)" 
    : "rgb(215, 223, 205)";
  
  // Cor da onda de transição
  const waveColor = isDark 
    ? "rgb(35, 42, 32)" 
    : "rgb(215, 223, 205)";
  
  const textColor = isDark ? "rgba(232, 232, 232, 0.7)" : "rgba(58, 58, 58, 0.65)";
  const brandColor = isDark ? "rgb(181, 201, 163)" : "rgb(122, 155, 106)";
  const linkHoverColor = isDark ? "rgb(127, 166, 179)" : "rgb(79, 115, 134)";

  const isHome = variant === "home";

  return (
    <footer 
      className="relative z-10 transition-colors duration-300"
      style={{
        background: isHome ? "transparent" : footerBg,
      }}
    >
      {/* Onda SVG animada como transição - apenas para páginas não-home */}
      {!isHome && (
        <div 
          className="absolute left-0 right-0 pointer-events-none overflow-hidden"
          style={{
            bottom: "100%",
            height: "80px",
          }}
        >
          {/* SVG duplicado para animação contínua (200% de largura) */}
          <div 
            className="absolute bottom-0 h-full animate-footer-wave"
            style={{ 
              width: "200%",
              willChange: "transform",
            }}
          >
            <svg 
              viewBox="0 0 2880 80" 
              preserveAspectRatio="none"
              className="h-full w-full"
            >
              {/* Path único contínuo - começa e termina na mesma altura (40) para loop perfeito */}
              <path 
                d={`
                  M0 40 
                  C 180 20, 360 60, 540 35 
                  C 720 10, 900 55, 1080 30 
                  C 1260 5, 1440 50, 1440 40
                  C 1620 20, 1800 60, 1980 35 
                  C 2160 10, 2340 55, 2520 30 
                  C 2700 5, 2880 50, 2880 40
                  L 2880 80 L 0 80 Z
                `}
                fill={waveColor}
                className="transition-colors duration-300"
              />
            </svg>
          </div>
        </div>
      )}
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm" style={{ color: textColor }}>
            <span className="font-medium" style={{ color: brandColor }}>navo</span>
            <span className="hidden sm:inline">·</span>
            <span className="text-center sm:text-left">{t.footer.disclaimer}</span>
          </div>

          <nav className="flex items-center gap-6">
            <Link
              href="/termos"
              className="text-sm transition-colors lowercase hover:opacity-100"
              style={{ 
                color: textColor,
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = linkHoverColor}
              onMouseLeave={(e) => e.currentTarget.style.color = textColor}
            >
              {t.footer.terms}
            </Link>
            <Link
              href="/privacidade"
              className="text-sm transition-colors lowercase hover:opacity-100"
              style={{ 
                color: textColor,
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = linkHoverColor}
              onMouseLeave={(e) => e.currentTarget.style.color = textColor}
            >
              {t.footer.privacy}
            </Link>
            <a
              href="mailto:contato@navo.live"
              className="text-sm transition-colors lowercase hover:opacity-100"
              style={{ 
                color: textColor,
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = linkHoverColor}
              onMouseLeave={(e) => e.currentTarget.style.color = textColor}
            >
              {t.footer.contact}
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
