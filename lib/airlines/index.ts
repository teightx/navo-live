/**
 * Airlines Library
 *
 * Exports airline logos and info utilities
 */

// Legacy exports (SVG-based, kept for compatibility)
export {
  getAirlineInfo,
  getAirlineLogo,
  getAirlineColor,
  getAirlineName,
  hasAirlineLogo,
  AIRLINES,
  type AirlineInfo,
} from "./airlineLogos";

// New PNG registry exports
export {
  getAirlineFromRegistry,
  getAirlineAsset,
  getAirlineColorFromRegistry,
  getAirlineNameFromRegistry,
  hasAirlineAsset,
  getMissingAirlineAssets,
  getReadyAirlineAssets,
  logMissingAirlineAssets,
  AIRLINE_REGISTRY,
  type AirlineRegistryItem,
} from "./registry";

