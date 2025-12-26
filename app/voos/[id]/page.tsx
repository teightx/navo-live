import { FlightDetailContent } from "./FlightDetailContent";
import { getAllFlightIds } from "@/lib/mocks/results";

/**
 * generateStaticParams para export estático
 * 
 * Abordagens possíveis:
 * 
 * 1. IDs mockados (implementada):
 *    - Prós: Simples, funciona com output: export
 *    - Contras: Limitado aos IDs pré-definidos
 *    
 * 2. Query string (alternativa):
 *    - Usar /voos?id=xxx em vez de /voos/[id]
 *    - Prós: Não precisa de generateStaticParams
 *    - Contras: URLs menos elegantes, pior SEO
 * 
 * Escolhida opção 1 por manter URLs limpas e semânticas.
 */
export function generateStaticParams() {
  return getAllFlightIds().map((id) => ({ id }));
}

export default function FlightDetailPage() {
  return <FlightDetailContent />;
}
