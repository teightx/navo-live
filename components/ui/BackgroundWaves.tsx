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
      <svg
        className="absolute bottom-0 left-0 w-full h-auto min-h-[60vh]"
        viewBox="0 0 1440 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMax slice"
      >
        <path
          d="M0 200C200 180 400 250 600 220C800 190 1000 280 1200 240C1400 200 1440 250 1440 250V600H0V200Z"
          className="fill-cream-dark/50"
        />
        <path
          d="M0 350C240 320 480 400 720 360C960 320 1200 420 1440 380V600H0V350Z"
          className="fill-blue-muted/[0.12]"
        />
        <path
          d="M0 480C180 450 360 520 540 490C720 460 900 540 1080 510C1260 480 1440 530 1440 530V600H0V480Z"
          className="fill-sage-soft/10"
        />
      </svg>
    </div>
  );
}

