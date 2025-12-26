"use client";

import { useEffect, useState } from "react";

/**
 * BackgroundWaves - Fundo animado com parallax
 * 
 * Bug anterior: A animação translateY movia o SVG para cima, expondo
 * uma "linha reta" na parte inferior onde o fundo terminava abruptamente.
 * 
 * Solução: 
 * 1. Usar height: 200% para garantir cobertura total mesmo com movimento
 * 2. Posicionar bottom: -50% para que o SVG sempre cubra a viewport
 * 3. Usar clip-path no container pai para cortar qualquer overflow
 * 4. Duas camadas com velocidades diferentes criam profundidade
 */
export function BackgroundWaves() {
  const [scrollY, setScrollY] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    function handleChange(e: MediaQueryListEvent) {
      setPrefersReducedMotion(e.matches);
    }

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    function handleScroll() {
      setScrollY(window.scrollY);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prefersReducedMotion]);

  const parallaxSlow = prefersReducedMotion ? 0 : scrollY * 0.05;
  const parallaxFast = prefersReducedMotion ? 0 : scrollY * 0.1;

  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ clipPath: "inset(0)" }}
      aria-hidden="true"
    >
      {/* Fundo base sólido */}
      <div className="absolute inset-0 bg-cream" />
      
      {/* Camada traseira - mais lenta, mais translúcida */}
      <div
        className="absolute inset-x-0"
        style={{
          height: "200%",
          bottom: "-60%",
          backgroundImage: "url('/navo-live/backgrounds/waves.svg')",
          backgroundSize: "110% auto",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center bottom",
          opacity: 0.35,
          transform: `translateY(${-parallaxSlow}px)`,
          animation: prefersReducedMotion ? "none" : "wavesBack 20s ease-in-out infinite",
        }}
      />

      {/* Camada frontal - mais rápida, mais opaca */}
      <div
        className="absolute inset-x-0"
        style={{
          height: "180%",
          bottom: "-40%",
          backgroundImage: "url('/navo-live/backgrounds/waves.svg')",
          backgroundSize: "100% auto",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center bottom",
          opacity: 0.6,
          transform: `translateY(${-parallaxFast}px)`,
          animation: prefersReducedMotion ? "none" : "wavesFront 14s ease-in-out infinite",
        }}
      />
    </div>
  );
}
