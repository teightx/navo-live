/**
 * Mock data para Cost of Living (Custo de Vida)
 * 
 * Em produção, isso viria de uma API externa como Numbeo ou Teleport
 */

export interface CostOfLiving {
  destination: string;
  destinationCode: string;
  mealPrice: number; // BRL
  hotelDaily: number; // BRL
  lastUpdated: string; // ISO date
  source: string;
}

/**
 * Dados mock de custo de vida por destino
 * Valores em BRL, baseados em médias reais aproximadas
 */
const COST_OF_LIVING_DATA: Record<string, Omit<CostOfLiving, "destinationCode">> = {
  LIS: {
    destination: "Lisboa",
    mealPrice: 85,
    hotelDaily: 320,
    lastUpdated: new Date().toISOString(),
    source: "numbeo",
  },
  MAD: {
    destination: "Madrid",
    mealPrice: 95,
    hotelDaily: 380,
    lastUpdated: new Date().toISOString(),
    source: "numbeo",
  },
  CDG: {
    destination: "Paris",
    mealPrice: 120,
    hotelDaily: 450,
    lastUpdated: new Date().toISOString(),
    source: "numbeo",
  },
  LHR: {
    destination: "Londres",
    mealPrice: 110,
    hotelDaily: 520,
    lastUpdated: new Date().toISOString(),
    source: "numbeo",
  },
  MIA: {
    destination: "Miami",
    mealPrice: 100,
    hotelDaily: 480,
    lastUpdated: new Date().toISOString(),
    source: "numbeo",
  },
  REC: {
    destination: "Recife",
    mealPrice: 45,
    hotelDaily: 180,
    lastUpdated: new Date().toISOString(),
    source: "numbeo",
  },
  GRU: {
    destination: "São Paulo",
    mealPrice: 55,
    hotelDaily: 250,
    lastUpdated: new Date().toISOString(),
    source: "numbeo",
  },
};

/**
 * Obtém dados de custo de vida para um destino
 */
export function getCostOfLiving(destinationCode: string): CostOfLiving | null {
  const data = COST_OF_LIVING_DATA[destinationCode.toUpperCase()];
  
  if (!data) {
    // Fallback: valores médios genéricos
    return {
      destination: destinationCode,
      destinationCode: destinationCode.toUpperCase(),
      mealPrice: 75,
      hotelDaily: 300,
      lastUpdated: new Date().toISOString(),
      source: "estimativa",
    };
  }

  return {
    ...data,
    destinationCode: destinationCode.toUpperCase(),
  };
}

