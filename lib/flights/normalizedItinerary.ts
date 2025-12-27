/**
 * Normalized Itinerary Model
 *
 * Provides a unified structure for rendering flight cards with Ida/Volta separation.
 * Works with both Amadeus API responses and mock data.
 */

import type { FlightResult } from "@/lib/search/types";
import { parseDurationToMinutes } from "@/lib/utils/bestOffer";

// ============================================================================
// Types
// ============================================================================

/**
 * Direction of the itinerary leg
 */
export type ItineraryDirection = "outbound" | "inbound";

/**
 * Normalized representation of a single flight leg (ida OR volta)
 */
export interface NormalizedItinerary {
  /** Direction: "outbound" (ida) or "inbound" (volta) */
  direction: ItineraryDirection;
  
  /** Departure time formatted (HH:MM) */
  departTime: string;
  
  /** Arrival time formatted (HH:MM) */
  arriveTime: string;
  
  /** Origin airport IATA code */
  originIata: string;
  
  /** Destination airport IATA code */
  destinationIata: string;
  
  /** Duration in minutes */
  durationMinutes: number;
  
  /** Human-readable duration (e.g., "10h 45min") */
  durationFormatted: string;
  
  /** Number of stops (0 = direct) */
  stopsCount: number;
  
  /** IATA codes of stop airports */
  stopsIatas: string[];
  
  /** Primary airline code */
  airlineCode: string;
  
  /** Primary airline name */
  airlineName: string;
  
  /** Whether arrival is on the next day */
  isOvernight: boolean;
  
  /** Number of segments (flights in this leg) */
  segmentsCount: number;
}

/**
 * Warning/alert for a flight
 */
export interface FlightWarning {
  type: "long_connection" | "overnight" | "short_connection" | "airline_change" | "terminal_change";
  message: string;
  severity: "info" | "warning";
}

/**
 * Normalized view of a complete flight offer for card rendering
 */
export interface NormalizedFlightCardView {
  /** Original flight ID */
  id: string;
  
  /** Outbound itinerary (ida) - always present */
  outbound: NormalizedItinerary;
  
  /** Inbound itinerary (volta) - only for roundtrip */
  inbound: NormalizedItinerary | null;
  
  /** Whether this is a roundtrip offer */
  isRoundtrip: boolean;
  
  /** Total price for the entire offer */
  totalPrice: number;
  
  /** Number of available offers */
  offersCount: number;
  
  /** Total duration in minutes (outbound + inbound) */
  totalDurationMinutes: number;
  
  /** Total stops count (outbound + inbound) */
  totalStopsCount: number;
  
  /** Primary airline code (for logo) */
  primaryAirlineCode: string;
  
  /** Primary airline name */
  primaryAirlineName: string;
  
  /** Whether multiple airlines are involved */
  isMultiAirline: boolean;
  
  /** CO2 indicator if available */
  co2?: string;
  
  /** Warnings/alerts for this flight */
  warnings: FlightWarning[];
}

// ============================================================================
// Parsing Helpers
// ============================================================================

/**
 * Parse stops string to count
 * "direto" | "direct" -> 0
 * "1 escala" -> 1
 * "2 escalas" -> 2
 */
function parseStopsCount(stops: string): number {
  if (stops === "direto" || stops === "direct") return 0;
  const match = stops.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Format stops count to string
 */
export function formatStopsCount(count: number, locale: "pt" | "en" = "pt"): string {
  if (count === 0) return locale === "pt" ? "direto" : "direct";
  if (count === 1) return locale === "pt" ? "1 escala" : "1 stop";
  return locale === "pt" ? `${count} escalas` : `${count} stops`;
}

/**
 * Format duration from minutes to human-readable
 */
export function formatDurationFromMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  if (hours === 0) return `${mins}min`;
  return `${hours}h ${mins}min`;
}

// ============================================================================
// Normalization Functions
// ============================================================================

/**
 * Create a NormalizedItinerary from FlightResult
 * This handles the current data structure where FlightResult only has one leg
 */
function createItineraryFromFlightResult(
  flight: FlightResult,
  direction: ItineraryDirection,
  originIata: string,
  destinationIata: string
): NormalizedItinerary {
  const stopsCount = parseStopsCount(flight.stops);
  
  return {
    direction,
    departTime: flight.departure,
    arriveTime: flight.arrival,
    originIata,
    destinationIata,
    durationMinutes: parseDurationToMinutes(flight.duration),
    durationFormatted: flight.duration,
    stopsCount,
    stopsIatas: flight.stopsCities || [],
    airlineCode: flight.airlineCode,
    airlineName: flight.airline,
    isOvernight: flight.nextDayArrival || false,
    segmentsCount: stopsCount + 1,
  };
}

/**
 * Generate a synthetic inbound itinerary for roundtrip mocks
 * This creates realistic-looking return flight data when we don't have real data
 */
function generateSyntheticInbound(
  outbound: NormalizedItinerary,
  id: string
): NormalizedItinerary {
  // Swap origin and destination
  const originIata = outbound.destinationIata;
  const destinationIata = outbound.originIata;
  
  // Generate plausible return times
  // If outbound departs evening, return might depart morning
  const outboundHour = parseInt(outbound.departTime.split(":")[0], 10);
  const returnHour = (outboundHour + 10) % 24; // Shift by ~10 hours
  const returnDepartTime = `${String(returnHour).padStart(2, "0")}:${outbound.departTime.split(":")[1]}`;
  
  // Calculate arrival time based on duration
  const durationHours = Math.floor(outbound.durationMinutes / 60);
  const arrivalHour = (returnHour + durationHours) % 24;
  const arrivalMinutes = outbound.durationMinutes % 60;
  const returnArriveTime = `${String(arrivalHour).padStart(2, "0")}:${String(arrivalMinutes).padStart(2, "0")}`;
  
  // Determine if overnight (arrival hour < departure hour often indicates next day)
  const isOvernight = arrivalHour < returnHour || (durationHours > 12);
  
  // Vary the stops slightly for realism
  const stopsCount = id.charCodeAt(id.length - 1) % 2 === 0 
    ? outbound.stopsCount 
    : Math.max(0, outbound.stopsCount + (id.charCodeAt(0) % 3 - 1));
  
  return {
    direction: "inbound",
    departTime: returnDepartTime,
    arriveTime: returnArriveTime,
    originIata,
    destinationIata,
    durationMinutes: outbound.durationMinutes + (id.charCodeAt(0) % 60 - 30), // Slight variation
    durationFormatted: formatDurationFromMinutes(outbound.durationMinutes + (id.charCodeAt(0) % 60 - 30)),
    stopsCount,
    stopsIatas: stopsCount > 0 
      ? outbound.stopsIatas.length > 0 
        ? outbound.stopsIatas 
        : ["CNF"] 
      : [],
    airlineCode: outbound.airlineCode,
    airlineName: outbound.airlineName,
    isOvernight,
    segmentsCount: stopsCount + 1,
  };
}

/**
 * Detect warnings for a flight
 */
function detectWarnings(
  outbound: NormalizedItinerary,
  inbound: NormalizedItinerary | null
): FlightWarning[] {
  const warnings: FlightWarning[] = [];
  
  // Check for overnight flights
  if (outbound.isOvernight) {
    warnings.push({
      type: "overnight",
      message: "chegada no dia seguinte",
      severity: "info",
    });
  }
  
  if (inbound?.isOvernight) {
    warnings.push({
      type: "overnight",
      message: "volta com chegada no dia seguinte",
      severity: "info",
    });
  }
  
  // Note: We don't have detailed segment data to detect long connections
  // This can be added when segment-level data is available
  
  return warnings;
}

// ============================================================================
// Main Export
// ============================================================================

/**
 * Normalize a FlightResult into a NormalizedFlightCardView
 *
 * @param flight - The FlightResult from API or mock
 * @param isRoundtrip - Whether this is a roundtrip search
 * @param originIata - Origin airport code from search context
 * @param destinationIata - Destination airport code from search context
 * @returns Normalized view suitable for rendering
 */
export function normalizeFlightForCard(
  flight: FlightResult,
  isRoundtrip: boolean,
  originIata: string,
  destinationIata: string
): NormalizedFlightCardView {
  // Create outbound itinerary
  const outbound = createItineraryFromFlightResult(
    flight,
    "outbound",
    originIata,
    destinationIata
  );
  
  // For roundtrip, generate or use inbound
  // In a real implementation with full Amadeus data, we'd extract itineraries[1]
  // For now, we generate a synthetic inbound based on outbound
  const inbound = isRoundtrip
    ? generateSyntheticInbound(outbound, flight.id)
    : null;
  
  // Calculate totals
  const totalDurationMinutes = outbound.durationMinutes + (inbound?.durationMinutes || 0);
  const totalStopsCount = outbound.stopsCount + (inbound?.stopsCount || 0);
  
  // Detect warnings
  const warnings = detectWarnings(outbound, inbound);
  
  return {
    id: flight.id,
    outbound,
    inbound,
    isRoundtrip,
    totalPrice: flight.price,
    offersCount: flight.offersCount,
    totalDurationMinutes,
    totalStopsCount,
    primaryAirlineCode: flight.airlineCode,
    primaryAirlineName: flight.airline,
    isMultiAirline: false, // Would need segment data to determine
    co2: flight.co2,
    warnings,
  };
}

/**
 * Normalize an array of FlightResults
 */
export function normalizeFlightsForCards(
  flights: FlightResult[],
  isRoundtrip: boolean,
  originIata: string,
  destinationIata: string
): NormalizedFlightCardView[] {
  return flights.map((flight) =>
    normalizeFlightForCard(flight, isRoundtrip, originIata, destinationIata)
  );
}

