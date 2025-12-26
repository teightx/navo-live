/**
 * Amadeus API Types
 *
 * TypeScript definitions for Amadeus Self-Service API responses
 * Based on: https://developers.amadeus.com/self-service/category/flights/api-doc/flight-offers-search
 */

// ============================================================================
// OAuth2 Authentication
// ============================================================================

export interface AmadeusTokenResponse {
  type: string;
  username: string;
  application_name: string;
  client_id: string;
  token_type: string;
  access_token: string;
  expires_in: number;
  state: string;
  scope: string;
}

export interface AmadeusToken {
  accessToken: string;
  expiresAt: number; // Unix timestamp
}

// ============================================================================
// Flight Offers Search - Request
// ============================================================================

export interface FlightSearchRequest {
  currencyCode?: string;
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string; // YYYY-MM-DD
  returnDate?: string; // YYYY-MM-DD (for round-trip)
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: AmadeusTravelClass;
  nonStop?: boolean;
  maxPrice?: number;
  max?: number; // Max number of results
}

export type AmadeusTravelClass = "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";

// ============================================================================
// Flight Offers Search - Response
// ============================================================================

export interface AmadeusFlightOffersResponse {
  meta: {
    count: number;
    links?: {
      self: string;
    };
  };
  data: AmadeusFlightOffer[];
  dictionaries?: AmadeusDictionaries;
}

export interface AmadeusFlightOffer {
  type: string;
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  lastTicketingDateTime?: string;
  numberOfBookableSeats: number;
  itineraries: AmadeusItinerary[];
  price: AmadeusPrice;
  pricingOptions: {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  };
  validatingAirlineCodes: string[];
  travelerPricings: AmadeusTravelerPricing[];
}

export interface AmadeusItinerary {
  duration: string; // ISO 8601 duration (e.g., "PT10H45M")
  segments: AmadeusSegment[];
}

export interface AmadeusSegment {
  departure: AmadeusFlightEndpoint;
  arrival: AmadeusFlightEndpoint;
  carrierCode: string;
  number: string;
  aircraft: {
    code: string;
  };
  operating?: {
    carrierCode: string;
  };
  duration: string;
  id: string;
  numberOfStops: number;
  blacklistedInEU: boolean;
  co2Emissions?: AmadeusCO2Emission[];
}

export interface AmadeusFlightEndpoint {
  iataCode: string;
  terminal?: string;
  at: string; // ISO 8601 datetime
}

export interface AmadeusPrice {
  currency: string;
  total: string;
  base: string;
  fees?: AmadeusFee[];
  grandTotal: string;
}

export interface AmadeusFee {
  amount: string;
  type: string;
}

export interface AmadeusTravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: string;
  price: {
    currency: string;
    total: string;
    base: string;
  };
  fareDetailsBySegment: AmadeusFareDetails[];
}

export interface AmadeusFareDetails {
  segmentId: string;
  cabin: string;
  fareBasis: string;
  class: string;
  includedCheckedBags?: {
    weight?: number;
    weightUnit?: string;
    quantity?: number;
  };
}

export interface AmadeusCO2Emission {
  weight: number;
  weightUnit: string;
  cabin: string;
}

export interface AmadeusDictionaries {
  locations?: Record<string, AmadeusLocation>;
  aircraft?: Record<string, string>;
  currencies?: Record<string, string>;
  carriers?: Record<string, string>;
}

export interface AmadeusLocation {
  cityCode: string;
  countryCode: string;
}

// ============================================================================
// Error Response
// ============================================================================

export interface AmadeusErrorResponse {
  errors: AmadeusError[];
}

export interface AmadeusError {
  status: number;
  code: number;
  title: string;
  detail?: string;
  source?: {
    parameter?: string;
    pointer?: string;
  };
}

// ============================================================================
// Config
// ============================================================================

export interface AmadeusConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
}

