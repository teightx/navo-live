"use client";

import { useMemo } from "react";
import type { FlightResult } from "@/lib/search/types";
import { useI18n } from "@/lib/i18n";
import { parseDurationToMinutes } from "@/lib/utils/bestOffer";

// ============================================================================
// Types
// ============================================================================

export type WarningType = "long_connection" | "night_flight" | "next_day" | "short_duration" | "long_duration";

interface Warning {
  type: WarningType;
  message: string;
  severity: "info" | "warning";
}

interface FlightWarningsProps {
  flight: FlightResult;
  className?: string;
}

// ============================================================================
// Heuristics
// ============================================================================

function isNightFlight(departure: string): boolean {
  const [hours] = departure.split(":").map(Number);
  return hours >= 22 || hours < 6;
}

function isLongDuration(duration: string): boolean {
  const minutes = parseDurationToMinutes(duration);
  return minutes > 18 * 60; // > 18 horas
}

function isShortDuration(duration: string): boolean {
  const minutes = parseDurationToMinutes(duration);
  return minutes < 2 * 60; // < 2 horas
}

// ============================================================================
// Component
// ============================================================================

export function FlightWarnings({ flight, className = "" }: FlightWarningsProps) {
  const { locale } = useI18n();

  const text = {
    pt: {
      longConnection: "conexão longa",
      longConnectionDesc: "dá tempo de respirar, mas cansa.",
      nightFlight: "voo noturno",
      nightFlightDesc: "partida na madrugada. bom pra economizar dia.",
      nextDay: "chegada no dia seguinte",
      nextDayDesc: "normal pra voos longos. só lembrar na programação.",
      longDuration: "viagem longa",
      longDurationDesc: "mais de 18h de viagem. prepare-se.",
      shortDuration: "voo curto",
      shortDurationDesc: "rapidinho.",
      goodConnection: "conexão dentro do padrão",
      goodDuration: "tempo total ok para essa rota",
    },
    en: {
      longConnection: "long connection",
      longConnectionDesc: "time to breathe, but tiring.",
      nightFlight: "night flight",
      nightFlightDesc: "departing at night. saves a day.",
      nextDay: "next day arrival",
      nextDayDesc: "normal for long flights. just plan accordingly.",
      longDuration: "long journey",
      longDurationDesc: "over 18h travel. prepare yourself.",
      shortDuration: "short flight",
      shortDurationDesc: "quick one.",
      goodConnection: "connection within standard",
      goodDuration: "total time ok for this route",
    },
  };

  const t = text[locale as "pt" | "en"] || text.pt;

  const warnings = useMemo((): Warning[] => {
    const result: Warning[] = [];

    // Voo noturno
    if (isNightFlight(flight.departure)) {
      result.push({
        type: "night_flight",
        message: `${t.nightFlight} — ${t.nightFlightDesc}`,
        severity: "info",
      });
    }

    // Chegada +1
    if (flight.nextDayArrival) {
      result.push({
        type: "next_day",
        message: `${t.nextDay} — ${t.nextDayDesc}`,
        severity: "info",
      });
    }

    // Duração longa
    if (isLongDuration(flight.duration)) {
      result.push({
        type: "long_duration",
        message: `${t.longDuration} — ${t.longDurationDesc}`,
        severity: "warning",
      });
    }

    return result;
  }, [flight, t]);

  // Mensagens positivas (quando não há alertas negativos)
  const positives = useMemo((): string[] => {
    const result: string[] = [];

    const isDirect = flight.stops === "direto" || flight.stops === "direct";
    
    if (isDirect) {
      result.push(locale === "pt" ? "voo direto. sem escalas, sem dor de cabeça." : "direct flight. no stops, no hassle.");
    }

    if (!isLongDuration(flight.duration) && !isShortDuration(flight.duration)) {
      result.push(t.goodDuration);
    }

    return result;
  }, [flight, t, locale]);

  if (warnings.length === 0 && positives.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Alertas (warnings) */}
      {warnings.map((warning) => (
        <div
          key={warning.type}
          className="flex items-start gap-2 p-3 rounded-lg text-sm"
          style={{
            background: warning.severity === "warning" 
              ? "rgba(224, 122, 63, 0.1)" 
              : "rgba(79, 115, 134, 0.1)",
          }}
        >
          <span className="flex-shrink-0 mt-0.5">
            {warning.severity === "warning" ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--accent)" }}>
                <path d="M8 5V8M8 11H8.01M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--blue)" }}>
                <path d="M8 5V8M8 11H8.01M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
          </span>
          <span className="text-ink-muted">{warning.message}</span>
        </div>
      ))}

      {/* Pontos positivos */}
      {positives.map((positive, i) => (
        <div
          key={i}
          className="flex items-start gap-2 p-3 rounded-lg text-sm"
          style={{ background: "rgba(107, 138, 90, 0.1)" }}
        >
          <span className="flex-shrink-0 mt-0.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--sage)" }}>
              <path d="M4 8L6.5 10.5L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span className="text-ink-muted">{positive}</span>
        </div>
      ))}
    </div>
  );
}

