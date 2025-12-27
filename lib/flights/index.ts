/**
 * Flights module - Utilities for flight processing
 */

export {
  addDecisionLabels,
  getHumanMessage,
  getHumanMessageDeterministic,
  type FlightLabel,
  type PriceContext,
  type FlightWithLabels,
  type DecisionLabelsResult,
} from "./decisionLabels";

export {
  normalizeFlightForCard,
  normalizeFlightsForCards,
  formatStopsCount,
  formatDurationFromMinutes,
  type NormalizedItinerary,
  type NormalizedFlightCardView,
  type ItineraryDirection,
  type FlightWarning,
} from "./normalizedItinerary";

