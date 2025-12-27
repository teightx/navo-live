/**
 * Canonical Search Types
 *
 * Single source of truth for all search-related types in navo.live
 * Both frontend components and API endpoints should use these types.
 */

// ============================================================================
// Airport Types
// ============================================================================

/**
 * Airport representation used throughout the app
 */
export interface Airport {
  /** IATA code (e.g., "GRU", "LIS") */
  code: string;
  /** City name in lowercase (e.g., "são paulo", "lisboa") */
  city: string;
  /** Country name in lowercase (e.g., "brasil", "portugal") */
  country: string;
  /** Full airport name in lowercase */
  name: string;
}

// ============================================================================
// Search Request Types
// ============================================================================

/** Trip type options */
export type TripType = "roundtrip" | "oneway";

/** Cabin class options (frontend format, lowercase) */
export type CabinClass = "economy" | "premium_economy" | "business" | "first";

/** Cabin class options (API format, uppercase for Amadeus) */
export type TravelClass = "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";

/** Passenger counts */
export interface Pax {
  adults: number;
  children: number;
  infants: number;
}

/**
 * SearchState - Frontend search form state
 *
 * Used by the UI components and stored in URL params
 */
export interface SearchState {
  tripType: TripType;
  from: Airport | null;
  to: Airport | null;
  /** Departure date in YYYY-MM-DD format */
  departDate: string | null;
  /** Return date in YYYY-MM-DD format (only for roundtrip) */
  returnDate: string | null;
  pax: Pax;
  cabinClass: CabinClass;
}

/**
 * Default search state for initialization
 */
export const defaultSearchState: SearchState = {
  tripType: "roundtrip",
  from: null,
  to: null,
  departDate: null,
  returnDate: null,
  pax: {
    adults: 1,
    children: 0,
    infants: 0,
  },
  cabinClass: "economy",
};

/**
 * SearchRequest - API request parameters
 *
 * Used when calling /api/flights/search
 */
export interface SearchRequest {
  /** Origin IATA code */
  from: string;
  /** Destination IATA code */
  to: string;
  /** Departure date (YYYY-MM-DD) */
  depart: string;
  /** Return date (YYYY-MM-DD), optional for one-way */
  return?: string;
  /** Number of adult passengers (1-9) */
  adults?: number;
  /** Cabin class */
  cabin?: TravelClass;
  /** Non-stop flights only */
  nonStop?: boolean;
  /** Maximum results (1-50) */
  max?: number;
  /** Currency code */
  currency?: string;
}

// ============================================================================
// Flight Result Types
// ============================================================================

/**
 * FlightResult - Normalized flight data for UI rendering
 *
 * This is the canonical format that components expect.
 * Both mock data and Amadeus responses are mapped to this format.
 */
export interface FlightResult {
  /** Unique identifier */
  id: string;

  /** Airline name in lowercase (e.g., "latam", "tap") */
  airline: string;

  /** IATA airline code (e.g., "LA", "TP") */
  airlineCode: string;

  /** Departure time (HH:MM format) */
  departure: string;

  /** Arrival time (HH:MM format) */
  arrival: string;

  /** Flight duration (e.g., "10h 45min") */
  duration: string;

  /** Stops description (e.g., "direto", "1 escala", "2 escalas") */
  stops: string;

  /** Layover cities (e.g., ["Lisboa", "Madrid"]) */
  stopsCities?: string[];

  /** Price in the requested currency (number, not formatted) */
  price: number;

  /** Number of available offers/seats */
  offersCount: number;

  /** CO2 emission indicator (e.g., "-12% CO₂", "+8% CO₂") */
  co2?: string;

  /** Whether arrival is on the next day */
  nextDayArrival?: boolean;
}

/**
 * FlightSegment - Individual flight segment
 *
 * Used for detailed itinerary display (future use)
 */
export interface FlightSegment {
  /** Segment identifier */
  id: string;

  /** Marketing carrier code */
  carrierCode: string;

  /** Flight number */
  flightNumber: string;

  /** Aircraft type (e.g., "Boeing 777") */
  aircraft?: string;

  /** Departure info */
  departure: {
    /** Airport IATA code */
    iataCode: string;
    /** Terminal (if available) */
    terminal?: string;
    /** ISO datetime */
    at: string;
  };

  /** Arrival info */
  arrival: {
    /** Airport IATA code */
    iataCode: string;
    /** Terminal (if available) */
    terminal?: string;
    /** ISO datetime */
    at: string;
  };

  /** Segment duration (ISO 8601, e.g., "PT10H45M") */
  duration: string;

  /** Cabin class for this segment */
  cabin?: string;
}

// ============================================================================
// Search Response Types
// ============================================================================

/**
 * SearchResponse - API response format
 *
 * What /api/flights/search returns after mapping
 */
export interface SearchResponse {
  /** List of flight results */
  flights: FlightResult[];

  /** Data source indicator */
  source: "amadeus" | "mock";

  /** Response metadata */
  meta: {
    /** Total number of results */
    count: number;
    /** Request duration in milliseconds */
    durationMs: number;
    /** Whether result came from cache */
    cached?: boolean;
    /** Warning message (e.g., fallback reason) */
    warning?: string;
  };
}

/**
 * SearchError - API error response format
 */
export interface SearchError {
  /** Error code (e.g., "VALIDATION_ERROR", "AMADEUS_DISABLED") */
  code: string;

  /** Human-readable error message */
  message: string;

  /** Validation errors (for 400 responses) */
  errors?: Array<{
    field: string;
    message: string;
  }>;

  /** Original error details (for debugging) */
  details?: unknown;

  /** Request ID for tracing */
  requestId?: string;
}

// ============================================================================
// Partner/Offer Types (for /voos/[id] page)
// ============================================================================

/**
 * Partner - Travel booking partner
 */
export interface Partner {
  /** Unique partner identifier */
  id: string;

  /** Display name */
  name: string;

  /** Logo identifier or URL */
  logo: string;
}

/**
 * PartnerOffer - Price from a specific partner
 */
export interface PartnerOffer {
  /** Partner info */
  partner: Partner;

  /** Price in BRL */
  price: number;

  /** Deep link URL (optional) */
  url?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Map frontend CabinClass to API TravelClass
 */
export function toTravelClass(cabinClass: CabinClass): TravelClass {
  const mapping: Record<CabinClass, TravelClass> = {
    economy: "ECONOMY",
    premium_economy: "PREMIUM_ECONOMY",
    business: "BUSINESS",
    first: "FIRST",
  };
  return mapping[cabinClass];
}

/**
 * Map API TravelClass to frontend CabinClass
 */
export function toCabinClass(travelClass: TravelClass): CabinClass {
  const mapping: Record<TravelClass, CabinClass> = {
    ECONOMY: "economy",
    PREMIUM_ECONOMY: "premium_economy",
    BUSINESS: "business",
    FIRST: "first",
  };
  return mapping[travelClass];
}

