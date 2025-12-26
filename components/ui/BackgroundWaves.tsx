"use client";

import { useEffect, useState } from "react";

/**
 * BackgroundWaves - Fundo animado com parallax
 * 
 * Correção mobile: As ondas precisam cobrir toda a viewport,
 * não apenas a parte inferior. Usamos backgroundSize em vh
 * para garantir que as ondas sejam visíveis em qualquer tela.
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

  const parallaxSlow = prefersReducedMotion ? 0 : scrollY * 0.03;
  const parallaxFast = prefersReducedMotion ? 0 : scrollY * 0.06;

  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Fundo base sólido */}
      <div className="absolute inset-0 bg-cream" />
      
      {/* Camada traseira - cobre toda viewport */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/backgrounds/waves.svg')",
          backgroundSize: "120% 80%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center 100%",
          opacity: 0.35,
          transform: `translateY(${parallaxSlow}px) scale(1.1)`,
          animation: prefersReducedMotion ? "none" : "wavesBack 20s ease-in-out infinite",
        }}
      />

      {/* Camada frontal - mais visível */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/backgrounds/waves.svg')",
          backgroundSize: "100% 70%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center 100%",
          opacity: 0.55,
          transform: `translateY(${parallaxFast}px)`,
          animation: prefersReducedMotion ? "none" : "wavesFront 14s ease-in-out infinite",
        }}
      />
    </div>
  );
}
