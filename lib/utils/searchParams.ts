import type { SearchState, TripType, CabinClass } from "@/lib/types/search";
import { defaultSearchState } from "@/lib/types/search";
import { getAirportByCode } from "@/lib/airports";

// Type guard for ReadonlyURLSearchParams
function isReadonlyURLSearchParams(
  value: unknown
): value is Readonly<URLSearchParams> {
  return (
    typeof value === "object" &&
    value !== null &&
    "get" in value &&
    typeof (value as { get: unknown }).get === "function"
  );
}

type SearchParamsLike = 
  | URLSearchParams 
  | Readonly<URLSearchParams>
  | { [key: string]: string | string[] | undefined }
  | null;

/**
 * Parse URL search params into SearchState
 * Handles missing/invalid params gracefully with defaults
 */
export function parseSearchParams(
  searchParams: SearchParamsLike
): Partial<SearchState> {
  if (!searchParams) return {};

  // Helper to safely get string param
  const get = (key: string): string | null => {
    if (searchParams instanceof URLSearchParams || isReadonlyURLSearchParams(searchParams)) {
      return searchParams.get(key);
    }
    if (typeof searchParams === "object" && searchParams !== null) {
      const value = (searchParams as Record<string, string | string[] | undefined>)[key];
      return typeof value === "string" ? value : Array.isArray(value) ? value[0] : null;
    }
    return null;
  };

  const fromCode = get("from");
  const toCode = get("to");
  const depart = get("depart");
  const returnDate = get("return");
  const tripType = get("tripType") as TripType | null;
  const adults = get("adults");
  const children = get("children");
  const infants = get("infants");
  const cabin = get("cabin") as CabinClass | null;

  const state: Partial<SearchState> = {};

  // Trip type
  if (tripType === "roundtrip" || tripType === "oneway") {
    state.tripType = tripType;
  }

  // Airports
  if (fromCode) {
    const airport = getAirportByCode(fromCode);
    if (airport) {
      state.from = airport;
    }
  }

  if (toCode) {
    const airport = getAirportByCode(toCode);
    if (airport) {
      state.to = airport;
    }
  }

  // Dates - validate format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (depart && dateRegex.test(depart)) {
    state.departDate = depart;
  }

  if (returnDate && dateRegex.test(returnDate)) {
    state.returnDate = returnDate;
  }

  // Pax - validate numbers
  const parsedAdults = adults ? parseInt(adults, 10) : null;
  const parsedChildren = children ? parseInt(children, 10) : null;
  const parsedInfants = infants ? parseInt(infants, 10) : null;

  if (parsedAdults !== null && !isNaN(parsedAdults) && parsedAdults > 0) {
    state.pax = {
      adults: parsedAdults,
      children: parsedChildren !== null && !isNaN(parsedChildren) && parsedChildren >= 0 ? parsedChildren : 0,
      infants: parsedInfants !== null && !isNaN(parsedInfants) && parsedInfants >= 0 ? parsedInfants : 0,
    };
  }

  // Cabin class
  if (cabin && ["economy", "premium_economy", "business", "first"].includes(cabin)) {
    state.cabinClass = cabin;
  }

  return state;
}

/**
 * Normalize SearchState with defaults and validations
 * - Ensures returnDate is null for oneway trips
 * - Validates date format
 * - Applies defaults for missing fields
 */
export function normalizeSearchState(state: Partial<SearchState>): SearchState {
  const normalized: SearchState = {
    ...defaultSearchState,
    ...state,
    pax: {
      ...defaultSearchState.pax,
      ...(state.pax || {}),
    },
  };

  // Oneway trips should not have returnDate
  if (normalized.tripType === "oneway") {
    normalized.returnDate = null;
  }

  // Validate date format if present
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (normalized.departDate && !dateRegex.test(normalized.departDate)) {
    normalized.departDate = null;
  }
  if (normalized.returnDate && !dateRegex.test(normalized.returnDate)) {
    normalized.returnDate = null;
  }

  // Ensure pax numbers are valid
  if (normalized.pax.adults < 1) {
    normalized.pax.adults = 1;
  }
  if (normalized.pax.children < 0) {
    normalized.pax.children = 0;
  }
  if (normalized.pax.infants < 0) {
    normalized.pax.infants = 0;
  }

  return normalized;
}

/**
 * Serialize SearchState to URL query string
 * Only includes non-default values and omits returnDate for oneway trips
 */
export function serializeSearchState(state: SearchState): string {
  const params = new URLSearchParams();

  // Required fields
  if (state.from) {
    params.set("from", state.from.code);
  }
  if (state.to) {
    params.set("to", state.to.code);
  }
  if (state.departDate) {
    params.set("depart", state.departDate);
  }

  // Trip type (only if not default)
  if (state.tripType !== defaultSearchState.tripType) {
    params.set("tripType", state.tripType);
  }

  // Return date (only for roundtrip and if present)
  if (state.tripType === "roundtrip" && state.returnDate) {
    params.set("return", state.returnDate);
  }

  // Pax (only if not defaults)
  if (state.pax.adults !== defaultSearchState.pax.adults) {
    params.set("adults", String(state.pax.adults));
  }
  if (state.pax.children !== defaultSearchState.pax.children) {
    params.set("children", String(state.pax.children));
  }
  if (state.pax.infants !== defaultSearchState.pax.infants) {
    params.set("infants", String(state.pax.infants));
  }

  // Cabin (only if not default)
  if (state.cabinClass !== defaultSearchState.cabinClass) {
    params.set("cabin", state.cabinClass);
  }

  return params.toString();
}

