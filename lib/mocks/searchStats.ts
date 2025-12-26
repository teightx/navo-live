/**
 * Mock data para Search Stats (Prova Social)
 * 
 * Em produção, isso viria de um contador em tempo real
 * baseado em buscas reais dos últimos 24h
 */

export interface SearchStats {
  destination: string;
  destinationCode: string;
  searchCount: number; // últimas 24h
  lastUpdated: string; // ISO date
}

/**
 * Gera contagem mock de buscas baseada no destino
 * Simula variação realista (50-500 pessoas)
 */
export function getSearchStats(destinationCode: string): SearchStats {
  // Hash simples para gerar número estável por destino
  const hash = destinationCode
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Número entre 50 e 500, baseado no hash
  const baseCount = 50 + (hash % 450);
  
  // Adiciona variação aleatória pequena (±20%)
  const variation = (Math.random() - 0.5) * 0.4;
  const searchCount = Math.round(baseCount * (1 + variation));

  return {
    destination: destinationCode,
    destinationCode: destinationCode.toUpperCase(),
    searchCount,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Atualiza contagem simulando crescimento ao longo do tempo
 * (para efeito de "tempo real")
 */
export function getUpdatedSearchStats(
  destinationCode: string,
  baseCount?: number
): SearchStats {
  const stats = baseCount 
    ? { destination: destinationCode, destinationCode: destinationCode.toUpperCase(), searchCount: baseCount, lastUpdated: new Date().toISOString() }
    : getSearchStats(destinationCode);
  
  // Simula pequeno aumento ao longo do dia (±5%)
  const hourOfDay = new Date().getHours();
  const timeMultiplier = 1 + (hourOfDay / 24) * 0.05;
  
  return {
    ...stats,
    searchCount: Math.round(stats.searchCount * timeMultiplier),
  };
}

