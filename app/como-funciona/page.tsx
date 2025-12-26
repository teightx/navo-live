"use client";

import { Header, Footer } from "@/components/layout";
import { BackgroundWaves } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

const steps = [
  {
    icon: "🔍",
    titlePt: "busque seu voo",
    titleEn: "search your flight",
    descPt: "escolha origem, destino e datas. nosso sistema busca as melhores opções em tempo real.",
    descEn: "choose origin, destination and dates. our system searches the best options in real time.",
  },
  {
    icon: "📊",
    titlePt: "compare preços",
    titleEn: "compare prices",
    descPt: "mostramos preços de diferentes sites e companhias aéreas para você encontrar o melhor negócio.",
    descEn: "we show prices from different sites and airlines so you can find the best deal.",
  },
  {
    icon: "🔔",
    titlePt: "receba alertas",
    titleEn: "get alerts",
    descPt: "crie alertas e seja notificado quando o preço cair. nunca mais perca uma promoção.",
    descEn: "create alerts and get notified when the price drops. never miss a deal again.",
  },
  {
    icon: "✈️",
    titlePt: "compre direto",
    titleEn: "buy directly",
    descPt: "redirecionamos você para o site do parceiro com o melhor preço. simples assim.",
    descEn: "we redirect you to the partner site with the best price. simple as that.",
  },
];

export default function ComoFuncionaPage() {
  const { t, locale } = useI18n();

  return (
    <>
      <BackgroundWaves />
      <Header />

      <main className="min-h-screen flex flex-col">
        <section className="flex-1 px-4 sm:px-6 pt-28 pb-16">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-medium text-ink mb-4 lowercase text-center">
              {t.pages.howItWorks.title}
            </h1>
            <p className="text-ink-soft text-center mb-12">
              {t.pages.howItWorks.description}
            </p>

            <div className="space-y-6">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="rounded-2xl p-6"
                  style={{
                    background: "rgba(255, 255, 255, 0.7)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(255, 255, 255, 0.5)",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-cream-dark/50 flex items-center justify-center text-2xl flex-shrink-0">
                      {step.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-blue bg-blue/10 px-2 py-0.5 rounded">
                          {index + 1}
                        </span>
                        <h2 className="text-lg font-medium text-ink lowercase">
                          {locale === "pt" ? step.titlePt : step.titleEn}
                        </h2>
                      </div>
                      <p className="text-ink-soft text-sm">
                        {locale === "pt" ? step.descPt : step.descEn}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}

