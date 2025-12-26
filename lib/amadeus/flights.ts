/**
 * Amadeus Flight Offers Search
 *
 * Implements flight search using Amadeus API and maps results to internal types
 * Server-only module - do not import in client components
 */

import "server-only";
import { amadeusRequest } from "./client";
import type {
  AmadeusFlightOffer,
  AmadeusFlightOffersResponse,
  AmadeusTravelClass,
  FlightSearchRequest,
} from "./types";
import type { CabinClass, SearchState } from "@/lib/types/search";
import type { FlightResult } from "@/lib/mocks/flights";

// ============================================================================
// Mapping Helpers
// ============================================================================

/**
 * Map internal cabin class to Amadeus travel class
 */
function mapCabinClass(cabinClass: CabinClass): AmadeusTravelClass {
  const mapping: Record<CabinClass, AmadeusTravelClass> = {
    economy: "ECONOMY",
    premium_economy: "PREMIUM_ECONOMY",
    business: "BUSINESS",
    first: "FIRST",
  };
  return mapping[cabinClass];
}

/**
 * Parse ISO 8601 duration to human-readable format
 * Example: "PT10H45M" -> "10h 45min"
 */
function parseDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return isoDuration;

  const hours = match[1] ? `${match[1]}h` : "";
  const minutes = match[2] ? ` ${match[2]}min` : "";

  return (hours + minutes).trim() || "0min";
}

/**
 * Format time from ISO datetime
 * Example: "2024-01-15T22:30:00" -> "22:30"
 */
function formatTime(isoDatetime: string): string {
  const date = new Date(isoDatetime);
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Check if arrival is next day compared to departure
 */
function isNextDayArrival(departureAt: string, arrivalAt: string): boolean {
  const depDate = new Date(departureAt).toDateString();
  const arrDate = new Date(arrivalAt).toDateString();
  return depDate !== arrDate;
}

/**
 * Get airline name from carrier code
 * Falls back to code if name not known
 */
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
};

function getAirlineName(carrierCode: string): string {
  return AIRLINE_NAMES[carrierCode] || carrierCode.toLowerCase();
}

/**
 * Get stops description and cities
 */
function getStopsInfo(
  offer: AmadeusFlightOffer,
  dictionaries?: AmadeusFlightOffersResponse["dictionaries"]
): { stops: string; stopsCities: string[] } {
  const firstItinerary = offer.itineraries[0];
  if (!firstItinerary) {
    return { stops: "direto", stopsCities: [] };
  }

  const segments = firstItinerary.segments;
  const numStops = segments.length - 1;

  if (numStops === 0) {
    return { stops: "direto", stopsCities: [] };
  }

  // Get intermediate cities
  const stopsCities = segments.slice(0, -1).map((segment) => {
    const iataCode = segment.arrival.iataCode;
    const location = dictionaries?.locations?.[iataCode];
    return location?.cityCode || iataCode;
  });

  const stopsText = numStops === 1 ? "1 escala" : `${numStops} escalas`;

  return { stops: stopsText, stopsCities };
}

/**
 * Calculate CO2 emission indicator
 */
function getCO2Indicator(offer: AmadeusFlightOffer): string | undefined {
  const segments = offer.itineraries[0]?.segments || [];

  // Sum CO2 emissions from all segments
  let totalCO2 = 0;
  let hasEmissions = false;

  for (const segment of segments) {
    if (segment.co2Emissions?.[0]) {
      totalCO2 += segment.co2Emissions[0].weight;
      hasEmissions = true;
    }
  }

  if (!hasEmissions) return undefined;

  // Compare with average (rough estimate: 100kg per segment)
  const avgCO2 = segments.length * 100;
  const diff = ((totalCO2 - avgCO2) / avgCO2) * 100;

  if (Math.abs(diff) < 5) return undefined;

  return diff < 0 ? `${Math.round(diff)}% CO₂` : `+${Math.round(diff)}% CO₂`;
}

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Map Amadeus flight offer to internal FlightResult type
 */
function mapOfferToFlightResult(
  offer: AmadeusFlightOffer,
  dictionaries?: AmadeusFlightOffersResponse["dictionaries"]
): FlightResult {
  const firstItinerary = offer.itineraries[0];
  const firstSegment = firstItinerary?.segments[0];
  const lastSegment = firstItinerary?.segments[firstItinerary.segments.length - 1];

  if (!firstItinerary || !firstSegment || !lastSegment) {
    throw new Error("Invalid offer structure: missing itinerary or segments");
  }

  const carrierCode = offer.validatingAirlineCodes[0] || firstSegment.carrierCode;
  const { stops, stopsCities } = getStopsInfo(offer, dictionaries);

  return {
    id: `amadeus-${offer.id}`,
    airline: getAirlineName(carrierCode),
    airlineCode: carrierCode,
    departure: formatTime(firstSegment.departure.at),
    arrival: formatTime(lastSegment.arrival.at),
    duration: parseDuration(firstItinerary.duration),
    stops,
    stopsCities: stopsCities.length > 0 ? stopsCities : undefined,
    price: Math.round(parseFloat(offer.price.grandTotal)),
    offersCount: offer.numberOfBookableSeats,
    co2: getCO2Indicator(offer),
    nextDayArrival: isNextDayArrival(firstSegment.departure.at, lastSegment.arrival.at),
  };
}

/**
 * Build search request from SearchState
 */
function buildSearchRequest(searchState: SearchState): FlightSearchRequest {
  if (!searchState.from || !searchState.to || !searchState.departDate) {
    throw new Error("Invalid search state: missing required fields");
  }

  const request: FlightSearchRequest = {
    currencyCode: "BRL",
    originLocationCode: searchState.from.code,
    destinationLocationCode: searchState.to.code,
    departureDate: searchState.departDate,
    adults: searchState.pax.adults,
    travelClass: mapCabinClass(searchState.cabinClass),
    max: 50, // Limit results
  };

  // Add optional fields
  if (searchState.returnDate && searchState.tripType === "roundtrip") {
    request.returnDate = searchState.returnDate;
  }

  if (searchState.pax.children > 0) {
    request.children = searchState.pax.children;
  }

  if (searchState.pax.infants > 0) {
    request.infants = searchState.pax.infants;
  }

  return request;
}

/**
 * Search flights using Amadeus API
 *
 * @param searchState - Internal search state
 * @returns Array of flight results mapped to internal format
 */
export async function searchFlightsAmadeus(searchState: SearchState): Promise<FlightResult[]> {
  const request = buildSearchRequest(searchState);

  console.log("[Amadeus Flights] Searching:", {
    origin: request.originLocationCode,
    destination: request.destinationLocationCode,
    departureDate: request.departureDate,
    returnDate: request.returnDate,
    adults: request.adults,
    travelClass: request.travelClass,
  });

  const response = await amadeusRequest<AmadeusFlightOffersResponse>(
    "/v2/shopping/flight-offers",
    {
      method: "GET",
      params: {
        currencyCode: request.currencyCode,
        originLocationCode: request.originLocationCode,
        destinationLocationCode: request.destinationLocationCode,
        departureDate: request.departureDate,
        returnDate: request.returnDate,
        adults: request.adults,
        children: request.children,
        infants: request.infants,
        travelClass: request.travelClass,
        nonStop: request.nonStop,
        maxPrice: request.maxPrice,
        max: request.max,
      },
    }
  );

  console.log("[Amadeus Flights] Found", response.data.length, "offers");

  // Map all offers to internal format
  const flights = response.data.map((offer) => mapOfferToFlightResult(offer, response.dictionaries));

  // Sort by price (lowest first)
  flights.sort((a, b) => a.price - b.price);

  return flights;
}

