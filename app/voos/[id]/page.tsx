import { FlightDetailContent } from "./FlightDetailContent";

// Rota dinâmica renderizada em runtime (serverless)
// O ID é obtido via useParams() no FlightDetailContent

export default function FlightDetailPage() {
  return <FlightDetailContent />;
}
