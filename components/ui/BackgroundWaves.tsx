"use client";

import { useEffect, useRef } from "react";

export function BackgroundWaves() {
  const wavesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const waves = wavesRef.current;
    if (!waves) return;

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        // Movimento muito sutil - 10% do scroll
        const offset = scrollY * 0.1;
        waves.style.transform = `translate3d(0, ${offset}px, 0)`;
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
    >
      {/* Fundo base - cobre tudo */}
      <div className="absolute inset-0 bg-cream" />
      
      {/* Ondas SVG - com parallax */}
      <div
        ref={wavesRef}
        className="absolute inset-x-0 bottom-0 will-change-transform"
        style={{
          height: "150%",
          backgroundImage: "url('/navo-live/backgrounds/waves.svg')",
          backgroundSize: "100% auto",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center bottom",
        }}
      />
    </div>
  );
}
