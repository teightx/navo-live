"use client";

import { Header, Footer } from "@/components/layout";
import { BackgroundWaves } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

export default function PrivacidadePage() {
  const { t, locale } = useI18n();

  return (
    <>
      <BackgroundWaves />
      <Header />

      <main className="min-h-screen flex flex-col">
        <section className="flex-1 px-4 sm:px-6 pt-28 pb-16">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-medium text-ink mb-8 lowercase">
              {t.pages.privacy.title}
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
                  <h2 className="text-lg font-medium text-ink mb-3">Dados Coletados</h2>
                  <p className="text-ink-soft mb-4">
                    Coletamos apenas dados necessários para o funcionamento do serviço: 
                    preferências de busca, idioma e tema. Não vendemos dados pessoais.
                  </p>

                  <h2 className="text-lg font-medium text-ink mb-3">Cookies</h2>
                  <p className="text-ink-soft mb-4">
                    Utilizamos cookies essenciais para funcionamento do site e 
                    armazenamento de preferências (idioma, tema).
                  </p>

                  <h2 className="text-lg font-medium text-ink mb-3">Terceiros</h2>
                  <p className="text-ink-soft mb-4">
                    Ao clicar em ofertas, você será redirecionado para sites de parceiros 
                    que possuem suas próprias políticas de privacidade.
                  </p>

                  <h2 className="text-lg font-medium text-ink mb-3">Contato</h2>
                  <p className="text-ink-soft">
                    Para dúvidas sobre privacidade, entre em contato: contato@navo.live
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-medium text-ink mb-3">Data Collected</h2>
                  <p className="text-ink-soft mb-4">
                    We only collect data necessary for the service: 
                    search preferences, language and theme. We do not sell personal data.
                  </p>

                  <h2 className="text-lg font-medium text-ink mb-3">Cookies</h2>
                  <p className="text-ink-soft mb-4">
                    We use essential cookies for site functionality and 
                    preference storage (language, theme).
                  </p>

                  <h2 className="text-lg font-medium text-ink mb-3">Third Parties</h2>
                  <p className="text-ink-soft mb-4">
                    When clicking on offers, you will be redirected to partner sites 
                    that have their own privacy policies.
                  </p>

                  <h2 className="text-lg font-medium text-ink mb-3">Contact</h2>
                  <p className="text-ink-soft">
                    For privacy questions, contact us: contato@navo.live
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

