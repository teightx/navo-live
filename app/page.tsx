/**
 * Home Page - Hero + Search Only
 * 
 * Por design, esta página NÃO renderiza resultados de busca.
 * Ao buscar, o usuário é redirecionado para /resultados com query params.
 * Isso mantém a separação de responsabilidades: home = busca, /resultados = resultados.
 */
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { Header, Footer } from "@/components/layout";
import { BackgroundWaves, SearchModal } from "@/components/ui";
import { SearchBar } from "@/components/searchbar";
import { OpportunitiesSection } from "@/components/opportunities/OpportunitiesSection";
import { useI18n } from "@/lib/i18n";
import { parseSearchParams, normalizeSearchState, serializeSearchState } from "@/lib/utils/searchParams";
import type { SearchState } from "@/lib/types/search";

function HomeContent() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Parse URL params and normalize
  const urlState = parseSearchParams(searchParams);
  const initialState = Object.keys(urlState).length > 0 
    ? normalizeSearchState(urlState)
    : undefined;

  const [showEditModal, setShowEditModal] = useState(false);
  const hasSearchParams = initialState !== undefined;

  function handleSearch(state: SearchState) {
    // Normalize and serialize to URL
    const normalizedState = normalizeSearchState(state);
    const queryString = serializeSearchState(normalizedState);
    router.push(`/resultados?${queryString}`);
  }

  return (
    <>
      <BackgroundWaves />
      <Header />

      <main className="min-h-screen flex flex-col">
        <section className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-16">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium text-ink mb-4 tracking-tight">
              {t.home.headline}
            </h1>
            <p className="text-ink-soft text-base sm:text-lg">
              {t.home.subheadline}
            </p>
          </div>

          <div className="w-full max-w-4xl">
            {/* Botão editar (só aparece se houver busca na URL) */}
            {hasSearchParams && (
              <div className="mb-4 text-center">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="text-sm text-blue hover:text-blue-soft transition-colors lowercase"
                >
                  {t.results.edit}
                </button>
              </div>
            )}

            <SearchBar mode="default" initialState={initialState} />
          </div>
        </section>

        {/* Oportunidades agora */}
        <OpportunitiesSection />

        <Footer />
      </main>

      {/* Modal de edição */}
      {hasSearchParams && (
        <SearchModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          initialState={initialState}
          onSearch={handleSearch}
        />
      )}
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cream)" }}>
        <div className="text-ink-muted">carregando...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
