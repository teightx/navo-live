/**
 * Componente para renderizar logos de parceiros
 * Altura máxima fixa para manter alinhamento vertical
 */

import type { ReactElement } from "react";

interface PartnerLogoProps {
  partnerId: string;
  className?: string;
}

export function PartnerLogo({ partnerId, className = "" }: PartnerLogoProps) {
  const logoSize = 40; // Altura máxima fixa
  
  // Logos como SVG inline para manter qualidade e controle
  const logos: Record<string, ReactElement> = {
    decolar: (
      <svg width={logoSize} height={logoSize} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="8" fill="#FF6B35"/>
        <path d="M30 35L50 55L70 35" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="50" cy="65" r="8" fill="white"/>
      </svg>
    ),
    maxmilhas: (
      <svg width={logoSize} height={logoSize} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="8" fill="#00A859"/>
        <path d="M25 50L45 70L75 30" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    google: (
      <svg width={logoSize} height={logoSize} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="8" fill="#4285F4"/>
        <path d="M30 50L50 30L70 50L50 70Z" fill="white"/>
      </svg>
    ),
    kayak: (
      <svg width={logoSize} height={logoSize} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="8" fill="#005580"/>
        <path d="M25 50L50 25L75 50L50 75Z" fill="white"/>
      </svg>
    ),
    skyscanner: (
      <svg width={logoSize} height={logoSize} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="8" fill="#0770E3"/>
        <circle cx="50" cy="50" r="20" fill="white"/>
        <path d="M35 50L50 35L65 50L50 65Z" fill="#0770E3"/>
      </svg>
    ),
  };

  const logo = logos[partnerId.toLowerCase()];
  
  if (!logo) {
    // Fallback: inicial do parceiro em círculo
    return (
      <div
        className={`flex items-center justify-center rounded-lg font-semibold ${className}`}
        style={{
          width: logoSize,
          height: logoSize,
          background: "var(--cream-dark)",
          color: "var(--ink-soft)",
        }}
      >
        {partnerId.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={`flex-shrink-0 ${className}`} style={{ width: logoSize, height: logoSize }}>
      {logo}
    </div>
  );
}

