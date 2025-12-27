"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

/**
 * HomeWaveTransition - Faixa de ondas animadas entre Hero e seção de feriados
 * 
 * Características:
 * - 3 camadas de ondas com cores harmoniosas (slate/ink no escuro, warm stone no claro)
 * - Animação horizontal parallax (cada camada com velocidade diferente)
 * - Altura otimizada para encostar no card de busca
 * - A última camada se funde com o fundo da seção abaixo
 * - Respeita prefers-reduced-motion
 */
export function HomeWaveTransition() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

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

  const isDark = mounted && resolvedTheme === "dark";

  // Paleta premium - Opção A (escuro ink/slate) e B (claro warm stone)
  const colors = isDark
    ? {
        // Escuro premium (ink/slate)
        wave1: "rgba(14, 20, 34, 0.6)",      // Camada traseira - mais transparente
        wave2: "rgba(12, 17, 28, 0.75)",     // Camada média
        wave3: "#0B0F17",                     // Camada frontal - cor sólida do fundo abaixo
      }
    : {
        // Claro premium (warm stone) - cores com mais contraste
        wave1: "#D4CFC6",                     // Camada traseira - tom mais escuro
        wave2: "#DDD8D0",                     // Camada média - tom intermediário
        wave3: "#F4F1EB",                     // Camada frontal - cor sólida do fundo abaixo
      };

  return (
    <div 
      className="relative w-full overflow-hidden pointer-events-none select-none h-[180px] sm:h-[200px] md:h-[240px] lg:h-[280px]"
      aria-hidden="true"
    >
      {/* Camada 1 - Mais ao fundo, movimento lento */}
      <div 
        className={`absolute inset-0 ${prefersReducedMotion ? "" : "animate-wave-slow"}`}
        style={{ width: "200%" }}
      >
        <svg
          viewBox="0 0 2880 320"
          preserveAspectRatio="none"
          className="absolute bottom-0 w-full h-full"
        >
          <path
            d={`
              M0 140
              C 360 80, 720 180, 1080 120
              C 1440 60, 1800 160, 2160 100
              C 2520 40, 2700 120, 2880 90
              L 2880 320 L 0 320 Z
            `}
            fill={colors.wave1}
            className="transition-colors duration-500"
          />
          {/* Repetição para animação contínua */}
          <path
            d={`
              M2880 140
              C 3240 80, 3600 180, 3960 120
              C 4320 60, 4680 160, 5040 100
              C 5400 40, 5580 120, 5760 90
              L 5760 320 L 2880 320 Z
            `}
            fill={colors.wave1}
            className="transition-colors duration-500"
          />
        </svg>
      </div>

      {/* Camada 2 - Meio, movimento médio */}
      <div 
        className={`absolute inset-0 ${prefersReducedMotion ? "" : "animate-wave-medium"}`}
        style={{ width: "200%" }}
      >
        <svg
          viewBox="0 0 2880 320"
          preserveAspectRatio="none"
          className="absolute bottom-0 w-full h-full"
        >
          <path
            d={`
              M0 180
              C 240 130, 480 210, 720 160
              C 960 110, 1200 190, 1440 140
              C 1680 90, 1920 170, 2160 130
              C 2400 90, 2640 150, 2880 120
              L 2880 320 L 0 320 Z
            `}
            fill={colors.wave2}
            className="transition-colors duration-500"
          />
          <path
            d={`
              M2880 180
              C 3120 130, 3360 210, 3600 160
              C 3840 110, 4080 190, 4320 140
              C 4560 90, 4800 170, 5040 130
              C 5280 90, 5520 150, 5760 120
              L 5760 320 L 2880 320 Z
            `}
            fill={colors.wave2}
            className="transition-colors duration-500"
          />
        </svg>
      </div>

      {/* Camada 3 - Frontal, movimento rápido, cor sólida final */}
      <div 
        className={`absolute inset-0 ${prefersReducedMotion ? "" : "animate-wave-fast"}`}
        style={{ width: "200%" }}
      >
        <svg
          viewBox="0 0 2880 320"
          preserveAspectRatio="none"
          className="absolute bottom-0 w-full h-full"
        >
          <path
            d={`
              M0 220
              C 180 180, 360 250, 540 210
              C 720 170, 900 240, 1080 200
              C 1260 160, 1440 230, 1620 190
              C 1800 150, 1980 220, 2160 180
              C 2340 140, 2520 200, 2700 170
              C 2790 155, 2880 180, 2880 180
              L 2880 320 L 0 320 Z
            `}
            fill={colors.wave3}
            className="transition-colors duration-500"
          />
          <path
            d={`
              M2880 220
              C 3060 180, 3240 250, 3420 210
              C 3600 170, 3780 240, 3960 200
              C 4140 160, 4320 230, 4500 190
              C 4680 150, 4860 220, 5040 180
              C 5220 140, 5400 200, 5580 170
              C 5670 155, 5760 180, 5760 180
              L 5760 320 L 2880 320 Z
            `}
            fill={colors.wave3}
            className="transition-colors duration-500"
          />
        </svg>
      </div>
    </div>
  );
}

// Re-export para manter compatibilidade
export { HomeWaveTransition as HomeWaveBand };
