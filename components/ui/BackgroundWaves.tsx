"use client";

export function BackgroundWaves() {
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Fundo base */}
      <div className="absolute inset-0 bg-cream" />
      
      {/* Ondas com animação contínua */}
      <div
        className="absolute inset-x-0 bottom-0 animate-waves"
        style={{
          height: "120%",
          backgroundImage: "url('/navo-live/backgrounds/waves.svg')",
          backgroundSize: "100% auto",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center bottom",
        }}
      />
    </div>
  );
}
