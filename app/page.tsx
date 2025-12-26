/**
 * Home Page - Hero + Search Only
 * 
 * Por design, esta página NÃO renderiza resultados de busca.
 * Ao buscar, o usuário é redirecionado para /resultados com query params.
 * Isso mantém a separação de responsabilidades: home = busca, /resultados = resultados.
 */
"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Header, Footer } from "@/components/layout";
import { BackgroundWaves } from "@/components/ui";
import { SearchBar } from "@/components/searchbar";
import { useI18n } from "@/lib/i18n";
import { parseSearchParams, normalizeSearchState } from "@/lib/utils/searchParams";

function HomeContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  
  // Parse URL params and normalize
  const urlState = parseSearchParams(searchParams);
  const initialState = Object.keys(urlState).length > 0 
    ? normalizeSearchState(urlState)
    : undefined;

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

          <SearchBar mode="default" initialState={initialState} />
        </section>

        <Footer />
      </main>
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
