"use client";

import { useEffect, useRef } from "react";

export function BackgroundWaves() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const offset = scrollY * 0.2;
        container.style.transform = `translate3d(0, -${offset}px, 0)`;
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
      ref={containerRef}
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none will-change-transform"
      aria-hidden="true"
    >
      {/* Fundo base */}
      <div className="absolute inset-0 bg-cream" />
      
      {/* Ondas SVG */}
      <div
        className="absolute inset-0 bg-bottom bg-no-repeat bg-cover"
        style={{
          backgroundImage: "url('/navo-live/backgrounds/waves.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
        }}
      />
    </div>
  );
}
