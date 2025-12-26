"use client";

import { Header, Footer } from "@/components/layout";
import { BackgroundWaves } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

export default function TermosPage() {
  const { t, locale } = useI18n();

  return (
    <>
      <BackgroundWaves />
      <Header />

      <main className="min-h-screen flex flex-col">
        <section className="flex-1 px-4 sm:px-6 pt-28 pb-16">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-medium text-ink mb-8 lowercase">
              {t.pages.terms.title}
            </h1>

            <div
              className="rounded-2xl p-6 sm:p-8 prose prose-sm max-w-none"
              style={{
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
              }}
            >
              {locale === "pt" ? (
                <>
                  <h2 className="text-lg font-medium text-ink mb-3">1. Uso do Serviço</h2>
                  <p className="text-ink-soft mb-4">
                    O navo é um serviço de comparação de preços de passagens aéreas. 
                    Não vendemos passagens diretamente, apenas redirecionamos para os sites parceiros.
                  </p>

                  <h2 className="text-lg font-medium text-ink mb-3">2. Preços</h2>
                  <p className="text-ink-soft mb-4">
                    Os preços exibidos são estimativas e podem variar. 
                    O valor final deve ser confirmado no site do parceiro antes da compra.
                  </p>

                  <h2 className="text-lg font-medium text-ink mb-3">3. Responsabilidade</h2>
                  <p className="text-ink-soft mb-4">
                    O navo não se responsabiliza por transações realizadas em sites de terceiros. 
                    Toda compra é feita diretamente com a companhia aérea ou agência escolhida.
                  </p>

                  <h2 className="text-lg font-medium text-ink mb-3">4. Atualizações</h2>
                  <p className="text-ink-soft">
                    Estes termos podem ser atualizados periodicamente. 
                    Recomendamos verificar esta página regularmente.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-medium text-ink mb-3">1. Service Usage</h2>
                  <p className="text-ink-soft mb-4">
                    navo is a flight price comparison service. 
                    We do not sell tickets directly, we only redirect to partner sites.
                  </p>

                  <h2 className="text-lg font-medium text-ink mb-3">2. Prices</h2>
                  <p className="text-ink-soft mb-4">
                    Displayed prices are estimates and may vary. 
                    The final price should be confirmed on the partner site before purchase.
                  </p>

                  <h2 className="text-lg font-medium text-ink mb-3">3. Liability</h2>
                  <p className="text-ink-soft mb-4">
                    navo is not responsible for transactions made on third-party sites. 
                    All purchases are made directly with the chosen airline or agency.
                  </p>

                  <h2 className="text-lg font-medium text-ink mb-3">4. Updates</h2>
                  <p className="text-ink-soft">
                    These terms may be updated periodically. 
                    We recommend checking this page regularly.
                  </p>
                </>
              )}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}

