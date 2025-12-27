"use client";

import { useMemo } from "react";
import type { FlightResult } from "@/lib/search/types";
import { useI18n } from "@/lib/i18n";
import { parseDurationToMinutes } from "@/lib/utils/bestOffer";

interface FlightDecisionHeaderProps {
  flight: FlightResult;
  priceContext?: "below_average" | "average" | "above_average" | null;
}

// ============================================================================
// Heuristics
// ============================================================================

function isGoodBalance(flight: FlightResult): boolean {
  const isDirect = flight.stops === "direto" || flight.stops === "direct";
  const duration = parseDurationToMinutes(flight.duration);
  
  // Voo direto ou curto = bom equilíbrio
  if (isDirect) return true;
  if (duration < 10 * 60) return true;
  
  return false;
}

function isQuickTrip(flight: FlightResult): boolean {
  const duration = parseDurationToMinutes(flight.duration);
  return duration < 6 * 60;
}

function isLongTrip(flight: FlightResult): boolean {
  const duration = parseDurationToMinutes(flight.duration);
  return duration > 15 * 60;
}

// ============================================================================
// Component
// ============================================================================

export function FlightDecisionHeader({ flight, priceContext }: FlightDecisionHeaderProps) {
  const { locale } = useI18n();

  const message = useMemo((): string => {
    const isBelowAverage = priceContext === "below_average";
    const isAboveAverage = priceContext === "above_average";
    const isGood = isGoodBalance(flight);
    const isQuick = isQuickTrip(flight);
    const isLong = isLongTrip(flight);
    const isDirect = flight.stops === "direto" || flight.stops === "direct";

    // Mensagens em português
    if (locale === "pt") {
      if (isBelowAverage && isDirect) {
        return "preço abaixo do normal e voo direto. difícil achar melhor.";
      }
      if (isBelowAverage && isQuick) {
        return "preço bom e viagem curta. bom começo.";
      }
      if (isBelowAverage) {
        return "esse preço está abaixo do normal pra essa rota.";
      }
      if (isAboveAverage && isLong) {
        return "preço alto e viagem longa. talvez valha esperar.";
      }
      if (isAboveAverage) {
        return "preço mais alto que o normal. considere outras opções.";
      }
      if (isGood && isDirect) {
        return "voo direto e bom equilíbrio entre preço e tempo.";
      }
      if (isGood) {
        return "esse é um bom equilíbrio pra economizar sem virar maratona.";
      }
      if (isLong) {
        return "viagem longa. se prioriza conforto, talvez não seja ideal.";
      }
      return "preço dentro do esperado pra essa rota.";
    }

    // Mensagens em inglês
    if (isBelowAverage && isDirect) {
      return "below average price and direct flight. hard to beat.";
    }
    if (isBelowAverage && isQuick) {
      return "good price and short trip. solid start.";
    }
    if (isBelowAverage) {
      return "this price is below normal for this route.";
    }
    if (isAboveAverage && isLong) {
      return "high price and long journey. maybe wait for a better deal.";
    }
    if (isAboveAverage) {
      return "price is higher than usual. consider other options.";
    }
    if (isGood && isDirect) {
      return "direct flight and good balance between price and time.";
    }
    if (isGood) {
      return "this is a good balance to save without the marathon.";
    }
    if (isLong) {
      return "long journey. if comfort is priority, maybe not ideal.";
    }
    return "price within expected range for this route.";
  }, [flight, priceContext, locale]);

  return (
    <div 
      className="p-4 rounded-xl mb-4 text-sm text-ink-soft italic"
      style={{ background: "var(--cream-dark)", opacity: 0.8 }}
    >
      {message}
    </div>
  );
}

