"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function BackgroundWaves() {
  const [scrollY, setScrollY] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
  
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Fundo base */}
      <div className="absolute inset-0 bg-cream transition-colors duration-200" />
      
      {/* Camada traseira */}
      <div
        className="absolute inset-0 transition-opacity duration-200"
        style={{
          backgroundImage: "url('/backgrounds/waves.svg')",
          backgroundSize: "120% 80%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center 100%",
          opacity: isDark ? 0.15 : 0.35,
          transform: `translateY(${parallaxSlow}px) scale(1.1)`,
          animation: prefersReducedMotion ? "none" : "wavesBack 20s ease-in-out infinite",
          filter: isDark ? "invert(0.8) hue-rotate(180deg)" : "none",
        }}
      />

      {/* Camada frontal */}
      <div
        className="absolute inset-0 transition-opacity duration-200"
        style={{
          backgroundImage: "url('/backgrounds/waves.svg')",
          backgroundSize: "100% 70%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center 100%",
          opacity: isDark ? 0.25 : 0.55,
          transform: `translateY(${parallaxFast}px)`,
          animation: prefersReducedMotion ? "none" : "wavesFront 14s ease-in-out infinite",
          filter: isDark ? "invert(0.8) hue-rotate(180deg)" : "none",
        }}
      />
    </div>
  );
}
