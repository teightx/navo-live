import type { CabinClass } from "@/lib/types/search";

export const cabinClassLabels: Record<CabinClass, string> = {
  economy: "econômica",
  premium_economy: "econômica premium",
  business: "executiva",
  first: "primeira classe",
};

export const cabinClasses: CabinClass[] = [
  "economy",
  "premium_economy",
  "business",
  "first",
];

export const paxLimits = {
  adults: { min: 1, max: 9 },
  children: { min: 0, max: 8 },
  infants: { min: 0, max: 9 }, // max será limitado pelo número de adultos
  total: 9,
};

export const tripTypeLabels = {
  roundtrip: "ida e volta",
  oneway: "só ida",
};

