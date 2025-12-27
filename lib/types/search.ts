/**
 * Search Types (Re-export)
 *
 * This file re-exports types from the canonical source for backwards compatibility.
 * New code should import directly from "@/lib/search/types"
 *
 * @deprecated Import from "@/lib/search/types" instead
 */

export type {
  Airport,
  TripType,
  CabinClass,
  Pax,
  SearchState,
} from "@/lib/search/types";

export { defaultSearchState } from "@/lib/search/types";
