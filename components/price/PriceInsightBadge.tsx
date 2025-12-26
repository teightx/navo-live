"use client";

import { formatPrice } from "@/lib/mocks/flights";
import type { PriceInsight } from "@/lib/mocks/priceInsight";

interface PriceInsightBadgeProps {
  insight: PriceInsight;
  className?: string;
}

export function PriceInsightBadge({ insight, className = "" }: PriceInsightBadgeProps) {
  if (insight.priceDifference <= 0) return null; // Não exibe se não estiver abaixo da média

  const isLowest = insight.isLowestRecent;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${className}`}
      style={{
        background: isLowest ? "var(--sage)" : "var(--cream-dark)",
        borderColor: isLowest ? "var(--sage)" : "var(--card-border)",
        color: isLowest ? "var(--cream-soft)" : "var(--blue)",
      }}
    >
      {isLowest ? (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 1L7.5 4.5L11 6L7.5 7.5L6 11L4.5 7.5L1 6L4.5 4.5L6 1Z"
              fill="currentColor"
            />
          </svg>
          <span>menor preço recente</span>
        </>
      ) : (
        <span>R$ {formatPrice(insight.priceDifference).replace("R$", "").trim()} abaixo da média</span>
      )}
    </div>
  );
}

