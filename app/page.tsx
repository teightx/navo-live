/**
 * Home Page - Hero + Search Only
 * 
 * Por design, esta página NÃO renderiza resultados de busca.
 * Ao buscar, o usuário é redirecionado para /resultados com query params.
 * Isso mantém a separação de responsabilidades: home = busca, /resultados = resultados.
 * 
 * Layout da Home:
 * - Hero (zona de busca): centralizado, ocupa 100vh
 * - Feriados + Footer: segunda "cena"
 */
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Header, Footer } from "@/components/layout";
import { SearchModal } from "@/components/ui";
import { SearchBar } from "@/components/searchbar";
import { OpportunitiesSection } from "@/components/opportunities/OpportunitiesSection";
import { HomeWaveTransition, HomeFAQ } from "@/components/home";
import { useI18n } from "@/lib/i18n";
import { parseSearchParams, normalizeSearchState, serializeSearchState } from "@/lib/utils/searchParams";
import type { SearchState } from "@/lib/types/search";

function HomeContent() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  
  // Paleta premium - cores sólidas da zona de exploração (feriados + footer)
  const solidBg = isDark 
    ? "#0B0F17"    // Ink slate escuro premium
    : "#F4F1EB";   // Warm stone claro premium
  
  // Parse URL params and normalize
  const urlState = parseSearchParams(searchParams);
  const initialState = Object.keys(urlState).length > 0 
    ? normalizeSearchState(urlState)
    : undefined;

  const [showEditModal, setShowEditModal] = useState(false);
  const hasSearchParams = initialState !== undefined;

  function handleSearch(state: SearchState) {
    const normalizedState = normalizeSearchState(state);
    const queryString = serializeSearchState(normalizedState);
    router.push(`/resultados?${queryString}`);
  }

  return (
    <>
      {/* Header transparente/glass na Home */}
      <Header variant="home" />

      {/* Container principal com scroll normal */}
      <main className="h-screen overflow-y-auto overflow-x-hidden">
        {/* ============================================================
            HERO: Formulário de busca centralizado
            - Altura exata da viewport (100vh)
            - Ondas na parte inferior
            ============================================================ */}
        <section 
          className="relative h-screen flex flex-col"
          style={{ 
            background: "var(--cream)",
          }}
        >
          {/* Conteúdo do Hero - centralizado verticalmente, compensando header e ondas */}
          {/* Mobile: mais espaço vertical, alinhamento à esquerda. Desktop: centralizado */}
          <div className="relative z-10 flex-1 flex flex-col items-start sm:items-center justify-center mx-auto max-w-5xl w-full px-5 sm:px-6 pt-24 sm:pt-16 pb-[100px] sm:pb-[120px] md:pb-[140px]">
            {/* Título e subtítulo */}
            {/* Mobile: alinhado à esquerda com mais respiração. Desktop: centralizado */}
            <div className="text-left sm:text-center mb-8 sm:mb-6">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-medium text-ink mb-4 sm:mb-3 tracking-tight">
                {t.home.headline}
              </h1>
              <p className="text-ink-soft text-sm sm:text-lg max-w-xl sm:mx-auto">
                {t.home.subheadline}
              </p>
            </div>

            {/* Bloco de proposta de valor - 3 bullets - DESKTOP: antes do search */}
            {/* Desktop: horizontal centralizado acima do search */}
            <div className="hidden sm:flex flex-row items-center justify-center gap-6 mb-6 text-sm text-ink-muted">
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-sage flex-shrink-0" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{t.home.valueProp1}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-sage flex-shrink-0" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{t.home.valueProp2}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-sage flex-shrink-0" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{t.home.valueProp3}</span>
              </div>
            </div>

            {/* Formulário de busca */}
            <div className="w-full max-w-4xl sm:mx-auto">
              {hasSearchParams && (
                <div className="mb-4 text-left sm:text-center">
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

            {/* Bloco de proposta de valor - 3 bullets - MOBILE: depois do search */}
            {/* Mobile: vertical alinhado à esquerda como lista abaixo do search */}
            <div className="flex sm:hidden flex-col items-start gap-3 mt-6 text-xs text-ink-muted">
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-sage flex-shrink-0" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{t.home.valueProp1}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-sage flex-shrink-0" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{t.home.valueProp2}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-sage flex-shrink-0" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{t.home.valueProp3}</span>
              </div>
            </div>

            {/* Micro-bloco de confiança */}
            {/* Mobile: menor e mais discreto. Desktop: normal */}
            <div className="mt-6 sm:mt-6 flex flex-wrap items-center justify-start sm:justify-center gap-3 sm:gap-6 text-[9px] sm:text-xs text-ink-muted/60 sm:text-ink-muted/70">
              <span>{t.home.trustRedirect}</span>
              <span className="hidden sm:block w-px h-3 bg-ink-muted/30" />
              <span>{t.home.trustBuy}</span>
              <span className="hidden sm:block w-px h-3 bg-ink-muted/30" />
              <span>{t.home.trustNoFees}</span>
            </div>
          </div>

          {/* Ondas encostadas na parte inferior do hero - posição absoluta */}
          <div className="absolute bottom-0 left-0 right-0 z-0">
            <HomeWaveTransition />
          </div>
        </section>

        {/* ============================================================
            FERIADOS + FOOTER: Segunda "cena"
            - Mais espaço do header (pt-20/24)
            ============================================================ */}
        <section 
          className="min-h-screen"
          style={{ 
            background: solidBg,
            transition: "background-color 0.3s ease",
          }}
        >
          <div className="pt-12 md:pt-16">
            <OpportunitiesSection variant="home" />
          </div>
          
          {/* FAQ Section */}
          <HomeFAQ />
          
          <Footer variant="home" />
        </section>
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
