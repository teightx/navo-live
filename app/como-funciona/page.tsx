"use client";

import { Header, Footer } from "@/components/layout";
import { BackgroundWaves } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

// ============================================================================
// Ícones SVG consistentes
// ============================================================================

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
      <path d="M21 21L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function CompareIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="7" cy="6" r="2" fill="currentColor"/>
      <circle cx="17" cy="12" r="2" fill="currentColor"/>
      <circle cx="12" cy="18" r="2" fill="currentColor"/>
    </svg>
  );
}

function BalanceIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 3V21M5 7L19 7M5 17L19 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M5 7L3 12H7L5 7Z" fill="currentColor"/>
      <path d="M19 7L17 12H21L19 7Z" fill="currentColor"/>
    </svg>
  );
}

function RedirectIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M7 17L17 7M17 7H10M17 7V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

// ============================================================================
// Componentes
// ============================================================================

interface StepCardProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

function StepCard({ number, title, description, icon }: StepCardProps) {
  return (
    <div 
      className="rounded-2xl p-6 transition-all duration-200 hover:translate-y-[-2px]"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
      }}
    >
      <div className="flex items-start gap-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ 
            background: "var(--blue)", 
            color: "var(--cream-soft)",
          }}
        >
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span 
              className="text-xs font-bold px-2 py-0.5 rounded"
              style={{ 
                background: "var(--cream-dark)", 
                color: "var(--ink-muted)",
              }}
            >
              {number}
            </span>
            <h2 className="text-lg font-medium text-ink lowercase">
              {title}
            </h2>
          </div>
          <p className="text-sm text-ink-muted leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function NotDoItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div 
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "var(--accent)", opacity: 0.15 }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-accent">
          <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <span className="text-sm text-ink">{text}</span>
    </div>
  );
}

// ============================================================================
// Page
// ============================================================================

export default function ComoFuncionaPage() {
  const { locale } = useI18n();

  const content = {
    pt: {
      title: "como funciona",
      subtitle: "entenda como o navo te ajuda a encontrar passagens",
      steps: [
        {
          title: "busque seu voo",
          description: "escolha origem, destino e datas. simples assim.",
        },
        {
          title: "encontramos opções",
          description: "buscamos preços em tempo real de companhias e parceiros.",
        },
        {
          title: "você compara",
          description: "mostramos o melhor equilíbrio entre preço, duração e escalas.",
        },
        {
          title: "você compra no parceiro",
          description: "redirecionamos você para o site oficial ou OTA para finalizar a compra.",
        },
      ],
      notDoTitle: "o que não fazemos",
      notDo: [
        "não vendemos passagens",
        "não cobramos taxas",
        "você compra sempre no site do parceiro",
      ],
    },
    en: {
      title: "how it works",
      subtitle: "understand how navo helps you find flights",
      steps: [
        {
          title: "search your flight",
          description: "choose origin, destination and dates. simple as that.",
        },
        {
          title: "we find options",
          description: "we search real-time prices from airlines and partners.",
        },
        {
          title: "you compare",
          description: "we show the best balance between price, duration and stops.",
        },
        {
          title: "you buy from the partner",
          description: "we redirect you to the official site or OTA to complete the purchase.",
        },
      ],
      notDoTitle: "what we don't do",
      notDo: [
        "we don't sell tickets",
        "we don't charge fees",
        "you always buy from the partner site",
      ],
    },
  };

  const t = content[locale as "pt" | "en"] || content.pt;
  const icons = [
    <SearchIcon key="search" />,
    <CompareIcon key="compare" />,
    <BalanceIcon key="balance" />,
    <RedirectIcon key="redirect" />,
  ];

  return (
    <>
      <BackgroundWaves />
      <Header />

      <main className="min-h-screen flex flex-col">
        <section className="flex-1 px-4 sm:px-6 pt-28 pb-16">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl sm:text-4xl font-medium text-ink mb-3 lowercase">
                {t.title}
              </h1>
              <p className="text-ink-muted text-base sm:text-lg">
                {t.subtitle}
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-4 mb-12">
              {t.steps.map((step, index) => (
                <StepCard
                  key={index}
                  number={index + 1}
                  title={step.title}
                  description={step.description}
                  icon={icons[index]}
                />
              ))}
            </div>

            {/* O que não fazemos */}
            <div 
              className="rounded-2xl p-6"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
              }}
            >
              <h3 className="text-sm font-medium text-ink-muted uppercase tracking-wider mb-4">
                {t.notDoTitle}
              </h3>
              <div className="space-y-3">
                {t.notDo.map((item, index) => (
                  <NotDoItem key={index} text={item} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
