"use client";

import type { NormalizedItinerary } from "@/lib/flights";
import { useI18n } from "@/lib/i18n";
import { AirlineLogo } from "./AirlineLogo";

interface ItineraryLineProps {
  /** The itinerary to render */
  itinerary: NormalizedItinerary;
  /** Whether to show the direction label (Ida/Volta) */
  showDirectionLabel?: boolean;
  /** Compact mode for smaller cards */
  compact?: boolean;
}

/**
 * Renders a single flight leg (Ida or Volta) with timeline visualization
 */
export function ItineraryLine({
  itinerary,
  showDirectionLabel = true,
  compact = false,
}: ItineraryLineProps) {
  const { locale } = useI18n();
  const isDirect = itinerary.stopsCount === 0;

  // Direction label
  const directionLabel = itinerary.direction === "outbound"
    ? (locale === "pt" ? "ida" : "outbound")
    : (locale === "pt" ? "volta" : "return");

  // Stops text
  const stopsText = isDirect
    ? (locale === "pt" ? "direto" : "direct")
    : itinerary.stopsCount === 1
      ? (locale === "pt" ? "1 escala" : "1 stop")
      : (locale === "pt" ? `${itinerary.stopsCount} escalas` : `${itinerary.stopsCount} stops`);

  return (
    <div className={`flex items-center gap-3 ${compact ? "py-1.5" : "py-2"}`}>
      {/* Direction label */}
      {showDirectionLabel && (
        <div 
          className="flex-shrink-0 text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded"
          style={{ 
            background: "var(--cream-dark)", 
            color: "var(--ink-muted)",
            minWidth: "40px",
            textAlign: "center",
          }}
        >
          {directionLabel}
        </div>
      )}

      {/* Times and timeline */}
      <div className="flex-1 flex items-center gap-3">
        {/* Departure time */}
        <div className={`flex-shrink-0 ${compact ? "text-base" : "text-lg"} font-semibold text-ink tabular-nums`}>
          {itinerary.departTime}
        </div>

        {/* Timeline with route */}
        <div className="flex-1 flex flex-col items-center min-w-0">
          {/* Duration */}
          <div className="text-[10px] text-ink-muted mb-0.5">
            {itinerary.durationFormatted}
          </div>
          
          {/* Visual timeline - sóbrio e informativo */}
          <div className="w-full relative h-[2px]">
            <div 
              className="absolute inset-0 rounded-full"
              style={{ background: "var(--ink-muted)", opacity: 0.25 }}
            />
            
            {/* Origin dot - discreto */}
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full z-10"
              style={{ background: "var(--ink-muted)", opacity: 0.6 }}
            />
            
            {/* Stop dots */}
            {!isDirect && (
              <div 
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full z-10" 
                style={{ background: "var(--ink-muted)", opacity: 0.5 }}
              />
            )}
            
            {/* Destination dot */}
            <div 
              className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full z-10"
              style={{ background: "var(--ink-muted)", opacity: 0.6 }}
            />
          </div>
          
          {/* Stops info */}
          <div className="text-[10px] text-ink-muted mt-0.5 truncate max-w-full">
            <span className={isDirect ? "text-sage" : ""}>
              {stopsText}
            </span>
            {itinerary.stopsIatas.length > 0 && (
              <span className="text-ink-muted/70"> ({itinerary.stopsIatas.join(", ")})</span>
            )}
          </div>
        </div>

        {/* Arrival time */}
        <div className={`flex-shrink-0 ${compact ? "text-base" : "text-lg"} font-semibold text-ink tabular-nums`}>
          {itinerary.arriveTime}
          {itinerary.isOvernight && (
            <sup className="text-[9px] text-ink-muted ml-0.5 font-normal">+1</sup>
          )}
        </div>
      </div>

      {/* Route codes (compact) */}
      <div className="hidden sm:flex flex-shrink-0 text-[10px] text-ink-muted gap-1">
        <span>{itinerary.originIata}</span>
        <span>→</span>
        <span>{itinerary.destinationIata}</span>
      </div>
    </div>
  );
}

/**
 * Compact inline version showing just essential info
 */
export function ItineraryLineCompact({
  itinerary,
}: {
  itinerary: NormalizedItinerary;
}) {
  const { locale } = useI18n();
  const isDirect = itinerary.stopsCount === 0;
  
  const stopsText = isDirect
    ? (locale === "pt" ? "direto" : "direct")
    : `${itinerary.stopsCount} ${locale === "pt" ? "esc" : "st"}`;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-medium text-ink">{itinerary.departTime}</span>
      <span className="text-ink-muted">→</span>
      <span className="font-medium text-ink">
        {itinerary.arriveTime}
        {itinerary.isOvernight && <sup className="text-[9px] text-ink-muted ml-0.5">+1</sup>}
      </span>
      <span className="text-ink-muted text-xs">
        {itinerary.durationFormatted} · {stopsText}
      </span>
    </div>
  );
}

