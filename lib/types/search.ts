import type { Airport } from "@/lib/mocks/airports";

export type TripType = "roundtrip" | "oneway";

export type CabinClass = "economy" | "premium_economy" | "business" | "first";

export interface Pax {
  adults: number;
  children: number;
  infants: number;
}

export interface SearchState {
  tripType: TripType;
  from: Airport | null;
  to: Airport | null;
  departDate: string | null;
  returnDate: string | null;
  pax: Pax;
  cabinClass: CabinClass;
}

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

