/**
 * Nearest Airport Detection
 *
 * Maps user geolocation to the nearest major Brazilian airport.
 * Uses Haversine formula for distance calculation.
 */

// ============================================================================
// Types
// ============================================================================

export interface AirportLocation {
  code: string;
  city: string;
  lat: number;
  lon: number;
}

export interface GeoPosition {
  lat: number;
  lon: number;
}

// ============================================================================
// Airport Data
// ============================================================================

/**
 * Major Brazilian airports with coordinates
 */
const BRAZILIAN_AIRPORTS: AirportLocation[] = [
  // São Paulo
  { code: "GRU", city: "são paulo", lat: -23.4356, lon: -46.4731 },
  { code: "CGH", city: "são paulo", lat: -23.6261, lon: -46.6564 },
  { code: "VCP", city: "campinas", lat: -23.0074, lon: -47.1345 },
  
  // Rio de Janeiro
  { code: "GIG", city: "rio de janeiro", lat: -22.8090, lon: -43.2506 },
  { code: "SDU", city: "rio de janeiro", lat: -22.9105, lon: -43.1631 },
  
  // Sul
  { code: "POA", city: "porto alegre", lat: -29.9944, lon: -51.1714 },
  { code: "CWB", city: "curitiba", lat: -25.5285, lon: -49.1758 },
  { code: "FLN", city: "florianópolis", lat: -27.6703, lon: -48.5525 },
  
  // Centro-Oeste
  { code: "BSB", city: "brasília", lat: -15.8711, lon: -47.9186 },
  { code: "CGR", city: "campo grande", lat: -20.4686, lon: -54.6725 },
  { code: "CGB", city: "cuiabá", lat: -15.6529, lon: -56.1167 },
  { code: "GYN", city: "goiânia", lat: -16.6320, lon: -49.2206 },
  
  // Nordeste
  { code: "SSA", city: "salvador", lat: -12.9086, lon: -38.3225 },
  { code: "REC", city: "recife", lat: -8.1264, lon: -34.9236 },
  { code: "FOR", city: "fortaleza", lat: -3.7761, lon: -38.5325 },
  { code: "NAT", city: "natal", lat: -5.9111, lon: -35.2478 },
  { code: "MCZ", city: "maceió", lat: -9.5108, lon: -35.7917 },
  { code: "SLZ", city: "são luís", lat: -2.5853, lon: -44.2341 },
  { code: "THE", city: "teresina", lat: -5.0600, lon: -42.8236 },
  { code: "JPA", city: "joão pessoa", lat: -7.1453, lon: -34.9486 },
  { code: "AJU", city: "aracaju", lat: -10.9842, lon: -37.0703 },
  
  // Norte
  { code: "MAO", city: "manaus", lat: -3.0386, lon: -60.0497 },
  { code: "BEL", city: "belém", lat: -1.3792, lon: -48.4764 },
  
  // Sudeste
  { code: "CNF", city: "belo horizonte", lat: -19.6244, lon: -43.9719 },
  { code: "VIX", city: "vitória", lat: -20.2581, lon: -40.2864 },
];

// ============================================================================
// Functions
// ============================================================================

/**
 * Calculate distance between two points using Haversine formula
 * @returns Distance in kilometers
 */
function haversineDistance(pos1: GeoPosition, pos2: GeoPosition): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(pos2.lat - pos1.lat);
  const dLon = toRad(pos2.lon - pos1.lon);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(pos1.lat)) *
      Math.cos(toRad(pos2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Find the nearest airport to a given position
 */
export function findNearestAirport(position: GeoPosition): AirportLocation {
  let nearest = BRAZILIAN_AIRPORTS[0];
  let minDistance = Infinity;

  for (const airport of BRAZILIAN_AIRPORTS) {
    const distance = haversineDistance(position, {
      lat: airport.lat,
      lon: airport.lon,
    });

    if (distance < minDistance) {
      minDistance = distance;
      nearest = airport;
    }
  }

  return nearest;
}

/**
 * Get airport by code
 */
export function getAirportLocation(code: string): AirportLocation | null {
  return BRAZILIAN_AIRPORTS.find((a) => a.code === code.toUpperCase()) || null;
}

/**
 * Get all available airports (for UI selection)
 */
export function getAllAirports(): AirportLocation[] {
  return [...BRAZILIAN_AIRPORTS].sort((a, b) => a.city.localeCompare(b.city));
}

