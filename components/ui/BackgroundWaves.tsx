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
  
  // Usa arquivo diferente para dark mode
  const wavesUrl = isDark ? "/backgrounds/waves-dark.svg" : "/backgrounds/waves.svg";

  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Fundo base - usa CSS variable */}
      <div 
        className="absolute inset-0 transition-colors duration-300"
        style={{ background: "var(--cream)" }}
      />
      
      {/* Camada traseira - posicionada apenas na parte inferior */}
      <div
        className="absolute transition-opacity duration-300"
        style={{
          left: "-10%",
          right: "-10%",
          bottom: "-50px",
          height: "70vh", // Apenas parte inferior da tela
          backgroundImage: `url('${wavesUrl}')`,
          backgroundSize: "120% 100%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center bottom",
          opacity: isDark ? 0.4 : 0.55,
          transform: `translateY(${parallaxSlow}px) scale(1.1)`,
          transformOrigin: "center bottom",
          animation: prefersReducedMotion ? "none" : "wavesBack 20s ease-in-out infinite",
        }}
      />

      {/* Camada frontal - posicionada apenas na parte inferior */}
      <div
        className="absolute transition-opacity duration-300"
        style={{
          left: "-5%",
          right: "-5%",
          bottom: "-30px",
          height: "60vh", // Apenas parte inferior da tela
          backgroundImage: `url('${wavesUrl}')`,
          backgroundSize: "110% 100%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center bottom",
          opacity: isDark ? 0.6 : 0.75,
          transform: `translateY(${parallaxFast}px)`,
          transformOrigin: "center bottom",
          animation: prefersReducedMotion ? "none" : "wavesFront 14s ease-in-out infinite",
        }}
      />
    </div>
  );
}
