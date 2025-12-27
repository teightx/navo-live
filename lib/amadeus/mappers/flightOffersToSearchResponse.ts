/**
 * Amadeus Flight Offers Mapper
 *
 * Maps Amadeus Flight Offers Search response to the app's canonical SearchResponse format
 */

import type {
  AmadeusFlightOffersResponse,
  AmadeusFlightOffer,
  AmadeusSegment,
  AmadeusDictionaries,
} from "../types";
import type { FlightResult, SearchResponse } from "@/lib/search/types";

// ============================================================================
// Constants
// ============================================================================

/** Airline code to name mapping */
const AIRLINE_NAMES: Record<string, string> = {
  LA: "latam",
  JJ: "latam",
  TP: "tap",
  AD: "azul",
  IB: "iberia",
  AF: "air france",
  G3: "gol",
  LH: "lufthansa",
  UA: "united",
  AA: "american",
  DL: "delta",
  BA: "british airways",
  KL: "klm",
  LX: "swiss",
  AZ: "ita airways",
  EK: "emirates",
  QR: "qatar",
  TK: "turkish",
  AC: "air canada",
  AV: "avianca",
  CM: "copa",
  ET: "ethiopian",
  SU: "aeroflot",
  LO: "lot polish",
  SK: "sas",
  FI: "icelandair",
  TG: "thai",
  SQ: "singapore",
  CX: "cathay pacific",
  NH: "ana",
  JL: "japan airlines",
  KE: "korean air",
  OZ: "asiana",
  QF: "qantas",
  NZ: "air new zealand",
  AR: "aerolineas argentinas",
  AM: "aeromexico",
};

// ============================================================================
// Duration Helpers
// ============================================================================

/**
 * Parse ISO 8601 duration to total minutes
 *
 * @example parseIsoDurationToMinutes("PT10H45M") => 645
 * @example parseIsoDurationToMinutes("PT2H30M") => 150
 * @example parseIsoDurationToMinutes("PT45M") => 45
 */
export function parseIsoDurationToMinutes(isoDuration: string): number {
  if (!isoDuration) return 0;

  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);

  return hours * 60 + minutes;
}

/**
 * Format minutes to human-readable duration
 *
 * @example formatDuration(645) => "10h 45min"
 * @example formatDuration(150) => "2h 30min"
 * @example formatDuration(45) => "45min"
 */
export function formatDuration(totalMinutes: number): string {
  if (totalMinutes <= 0) return "0min";

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;

  return `${hours}h ${minutes}min`;
}

/**
 * Parse ISO duration directly to formatted string
 *
 * @example parseIsoDuration("PT10H45M") => "10h 45min"
 */
export function parseIsoDuration(isoDuration: string): string {
  return formatDuration(parseIsoDurationToMinutes(isoDuration));
}

// ============================================================================
// Time Helpers
// ============================================================================

/**
 * Extract HH:MM time from ISO datetime
 *
 * @example formatTime("2025-03-15T22:30:00") => "22:30"
 */
function formatTime(isoDatetime: string): string {
  if (!isoDatetime) return "";

  try {
    const date = new Date(isoDatetime);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    // Fallback: extract from string
    const match = isoDatetime.match(/T(\d{2}):(\d{2})/);
    return match ? `${match[1]}:${match[2]}` : "";
  }
}

/**
 * Check if arrival is on the next day compared to departure
 */
function isNextDayArrival(departureAt: string, arrivalAt: string): boolean {
  if (!departureAt || !arrivalAt) return false;

  try {
    const depDate = new Date(departureAt).toDateString();
    const arrDate = new Date(arrivalAt).toDateString();
    return depDate !== arrDate;
  } catch {
    return false;
  }
}

// ============================================================================
// Airline Helpers
// ============================================================================

/**
 * Get airline name from carrier code
 * Falls back to lowercase code if name not in dictionary
 */
function getAirlineName(
  carrierCode: string,
  dictionaries?: AmadeusDictionaries
): string {
  // Check our predefined mapping first
  if (AIRLINE_NAMES[carrierCode]) {
    return AIRLINE_NAMES[carrierCode];
  }

  // Check Amadeus dictionaries
  if (dictionaries?.carriers?.[carrierCode]) {
    return dictionaries.carriers[carrierCode].toLowerCase();
  }

  // Fallback to code in lowercase
  return carrierCode.toLowerCase();
}

// ============================================================================
// Stops Helpers
// ============================================================================

/**
 * Get stops description and layover cities
 */
function getStopsInfo(
  segments: AmadeusSegment[],
  dictionaries?: AmadeusDictionaries
): { stops: string; stopsCities: string[] } {
  const numStops = segments.length - 1;

  if (numStops === 0) {
    return { stops: "direto", stopsCities: [] };
  }

  // Get intermediate cities (all segments except the last one)
  const stopsCities = segments.slice(0, -1).map((segment) => {
    const iataCode = segment.arrival.iataCode;

    // Try to get city name from dictionaries
    const location = dictionaries?.locations?.[iataCode];
    if (location?.cityCode) {
      return location.cityCode;
    }

    // Fallback to IATA code
    return iataCode;
  });

  const stopsText = numStops === 1 ? "1 escala" : `${numStops} escalas`;

  return { stops: stopsText, stopsCities };
}

// ============================================================================
// Offer Mapping
// ============================================================================

/**
 * Check if offer has all required fields
 */
function isValidOffer(offer: AmadeusFlightOffer): boolean {
  if (!offer.id) return false;
  if (!offer.price?.grandTotal) return false;
  if (!offer.itineraries?.length) return false;

  const firstItinerary = offer.itineraries[0];
  if (!firstItinerary.segments?.length) return false;

  const firstSegment = firstItinerary.segments[0];
  const lastSegment = firstItinerary.segments[firstItinerary.segments.length - 1];

  if (!firstSegment?.departure?.at) return false;
  if (!lastSegment?.arrival?.at) return false;
  if (!firstSegment?.carrierCode) return false;

  return true;
}

/**
 * Map a single Amadeus offer to FlightResult
 */
function mapOfferToFlightResult(
  offer: AmadeusFlightOffer,
  dictionaries?: AmadeusDictionaries
): FlightResult | null {
  // Validate offer has required fields
  if (!isValidOffer(offer)) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Mapper] Skipping invalid offer:", offer.id);
    }
    return null;
  }

  const firstItinerary = offer.itineraries[0];
  const segments = firstItinerary.segments;
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];

  // Get primary carrier
  const carrierCode = offer.validatingAirlineCodes?.[0] || firstSegment.carrierCode;

  // Get stops info
  const { stops, stopsCities } = getStopsInfo(segments, dictionaries);

  // Parse price (string to number)
  const price = parseFloat(offer.price.grandTotal);
  if (isNaN(price)) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Mapper] Invalid price for offer:", offer.id);
    }
    return null;
  }

  // Build FlightResult
  return {
    id: `amadeus-${offer.id}`,
    airline: getAirlineName(carrierCode, dictionaries),
    airlineCode: carrierCode,
    departure: formatTime(firstSegment.departure.at),
    arrival: formatTime(lastSegment.arrival.at),
    duration: parseIsoDuration(firstItinerary.duration),
    stops,
    stopsCities: stopsCities.length > 0 ? stopsCities : undefined,
    price: Math.round(price), // Round to integer
    offersCount: offer.numberOfBookableSeats || 1,
    nextDayArrival: isNextDayArrival(firstSegment.departure.at, lastSegment.arrival.at),
    // CO2 not included in basic mapping (requires additional calculation)
  };
}

// ============================================================================
// Main Mapper
// ============================================================================

/**
 * Request params for context in mapping
 */
export interface MapperRequestParams {
  from: string;
  to: string;
  depart: string;
  return?: string;
  adults: number;
  currency: string;
}

/**
 * Map Amadeus Flight Offers response to SearchResponse
 *
 * @param amadeusPayload - Raw Amadeus API response
 * @param requestParams - Original request parameters for context
 * @returns Normalized SearchResponse
 */
export function mapFlightOffersToSearchResponse(
  amadeusPayload: AmadeusFlightOffersResponse,
  requestParams: MapperRequestParams
): { flights: FlightResult[]; skipped: number } {
  const flights: FlightResult[] = [];
  let skipped = 0;

  // Map each offer
  for (const offer of amadeusPayload.data || []) {
    const mapped = mapOfferToFlightResult(offer, amadeusPayload.dictionaries);

    if (mapped) {
      flights.push(mapped);
    } else {
      skipped++;
    }
  }

  // Sort by price (lowest first)
  flights.sort((a, b) => a.price - b.price);

  if (skipped > 0 && process.env.NODE_ENV === "development") {
    console.log(`[Mapper] Skipped ${skipped} invalid offers`);
  }

  return { flights, skipped };
}

/**
 * Create full SearchResponse with metadata
 */
export function createSearchResponse(
  flights: FlightResult[],
  meta: {
    durationMs: number;
    cached: boolean;
    requestId?: string;
    skipped?: number;
  }
): SearchResponse {
  return {
    flights,
    source: "amadeus",
    meta: {
      count: flights.length,
      durationMs: meta.durationMs,
      cached: meta.cached,
      ...(meta.skipped && meta.skipped > 0 && {
        warning: `${meta.skipped} offers skipped due to invalid data`,
      }),
    },
  };
}

