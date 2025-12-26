import { Suspense } from "react";
import { FlightDetailContent } from "./FlightDetailContent";

// Rota dinâmica renderizada em runtime (serverless)
// O ID é obtido via useParams() no FlightDetailContent

function FlightDetailPageContent() {
  return <FlightDetailContent />;
}

export default function FlightDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream)" }}>
        <div className="text-ink-muted">carregando...</div>
      </div>
    }>
      <FlightDetailPageContent />
    </Suspense>
  );
}
