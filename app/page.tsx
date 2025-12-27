/**
 * Home Page - Hero + Search Only
 * 
 * Por design, esta página NÃO renderiza resultados de busca.
 * Ao buscar, o usuário é redirecionado para /resultados com query params.
 * Isso mantém a separação de responsabilidades: home = busca, /resultados = resultados.
 * 
 * Layout da Home:
 * - Hero (zona de busca): centralizado, ocupa 100vh
 * - Feriados + Footer: segunda "cena" com snap automático
 * 
 * Magnet Scroll: Se o usuário scrollar um pouco, automaticamente pula para feriados.
 * Animação suave com easing customizado para 60fps.
 */
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import { Header, Footer } from "@/components/layout";
import { SearchModal } from "@/components/ui";
import { SearchBar } from "@/components/searchbar";
import { OpportunitiesSection } from "@/components/opportunities/OpportunitiesSection";
import { HomeWaveTransition } from "@/components/home";
import { useI18n } from "@/lib/i18n";
import { parseSearchParams, normalizeSearchState, serializeSearchState } from "@/lib/utils/searchParams";
import type { SearchState } from "@/lib/types/search";

/**
 * Smooth scroll com easing customizado para animação fluida
 * Usa requestAnimationFrame para 60fps consistente
 */
function smoothScrollTo(
  element: HTMLElement,
  targetY: number,
  duration: number = 800
): Promise<void> {
  return new Promise((resolve) => {
    const startY = element.scrollTop;
    const distance = targetY - startY;
    const startTime = performance.now();

    // Easing: ease-out-quart - começa rápido, desacelera suavemente
    function easeOutQuart(t: number): number {
      return 1 - Math.pow(1 - t, 4);
    }

    function animateScroll(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      
      element.scrollTop = startY + distance * easedProgress;

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(animateScroll);
  });
}

function HomeContent() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Refs para magnet scroll
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const feriadosRef = useRef<HTMLElement>(null);
  const isSnapping = useRef(false);
  const lastScrollTime = useRef(0);
  
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

  // Magnet Scroll: detecta scroll pequeno e "pula" para a seção correta
  const handleScroll = useCallback(async () => {
    const container = containerRef.current;
    const hero = heroRef.current;
    const feriados = feriadosRef.current;
    
    if (!container || !hero || !feriados || isSnapping.current) return;
    
    const now = Date.now();
    // Debounce para não processar durante animação
    if (now - lastScrollTime.current < 100) return;
    lastScrollTime.current = now;
    
    const scrollTop = container.scrollTop;
    const heroHeight = hero.offsetHeight;
    const threshold = 60; // Threshold menor para trigger mais sensível
    
    // Se está no "meio do caminho" entre hero e feriados
    if (scrollTop > threshold && scrollTop < heroHeight - threshold) {
      isSnapping.current = true;
      
      // Decide para onde ir baseado na direção/posição
      const targetTop = scrollTop > heroHeight / 3 ? heroHeight : 0;
      
      // Animação suave customizada - 900ms para ser mais fluida
      await smoothScrollTo(container, targetTop, 900);
      
      // Pequeno delay antes de liberar para evitar retriggering
      setTimeout(() => {
        isSnapping.current = false;
      }, 100);
    }
    // Se está quase todo no feriados mas não chegou, completa
    else if (scrollTop >= heroHeight - threshold && scrollTop < heroHeight) {
      isSnapping.current = true;
      await smoothScrollTo(container, heroHeight, 600);
      setTimeout(() => {
        isSnapping.current = false;
      }, 100);
    }
    // Se está quase voltando ao hero, completa a volta
    else if (scrollTop > 0 && scrollTop <= threshold) {
      isSnapping.current = true;
      await smoothScrollTo(container, 0, 600);
      setTimeout(() => {
        isSnapping.current = false;
      }, 100);
    }
  }, []);

  // Adiciona listener de scroll no container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    let scrollEndTimer: NodeJS.Timeout;
    
    const onScroll = () => {
      // Só processa quando o scroll parar (debounce mais suave)
      clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(handleScroll, 120);
    };
    
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      clearTimeout(scrollEndTimer);
    };
  }, [handleScroll]);

  return (
    <>
      {/* Header transparente/glass na Home */}
      <Header variant="home" />

      {/* Container principal com scroll customizado */}
      <main 
        ref={containerRef}
        className="h-screen overflow-y-auto overflow-x-hidden"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {/* ============================================================
            HERO: Formulário de busca centralizado
            - Altura exata da viewport (100vh)
            - Ondas na parte inferior
            - scroll-snap-align: start
            ============================================================ */}
        <section 
          ref={heroRef}
          className="relative h-screen flex flex-col"
          style={{ 
            background: "var(--cream)",
            scrollSnapAlign: "start",
            scrollSnapStop: "always",
          }}
        >
          {/* Conteúdo do Hero - centralizado verticalmente, compensando header e ondas */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center mx-auto max-w-5xl w-full px-4 sm:px-6 pt-20 pb-[120px] sm:pb-[140px] md:pb-[160px]">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium text-ink mb-4 tracking-tight">
                {t.home.headline}
              </h1>
              <p className="text-ink-soft text-base sm:text-lg">
                {t.home.subheadline}
              </p>
            </div>

            <div className="w-full max-w-4xl mx-auto">
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
          </div>

          {/* Ondas encostadas na parte inferior do hero - posição absoluta */}
          <div className="absolute bottom-0 left-0 right-0 z-0">
            <HomeWaveTransition />
          </div>
        </section>

        {/* ============================================================
            FERIADOS + FOOTER: Segunda "cena"
            - scroll-snap-align: start (encaixa automaticamente)
            - Mais espaço do header (pt-20/24)
            ============================================================ */}
        <section 
          ref={feriadosRef}
          className="min-h-screen"
          style={{ 
            background: solidBg,
            transition: "background-color 0.3s ease",
            scrollSnapAlign: "start",
            scrollSnapStop: "always",
          }}
        >
          <div className="pt-20 md:pt-24">
            <OpportunitiesSection variant="home" />
          </div>
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
