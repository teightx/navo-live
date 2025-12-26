"use client";

import { Header, Footer } from "@/components/layout";
import { BackgroundWaves } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

function BellIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="48" height="48" viewBox="0 0 48 48" fill="none">
      <path
        d="M24 6C17.373 6 12 11.373 12 18V26L8 32V34H40V32L36 26V18C36 11.373 30.627 6 24 6Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 34V36C20 38.209 21.791 40 24 40C26.209 40 28 38.209 28 36V34"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AlertasPage() {
  const { t } = useI18n();

  return (
    <>
      <BackgroundWaves />
      <Header />

      <main className="min-h-screen flex flex-col">
        <section className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-16">
          <div
            className="w-full max-w-lg rounded-2xl p-8 text-center"
            style={{
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            }}
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue/10 flex items-center justify-center text-blue">
              <BellIcon />
            </div>

            <h1 className="text-2xl font-medium text-ink mb-3 lowercase">
              {t.pages.alerts.title}
            </h1>

            <p className="text-ink-soft mb-6">
              {t.pages.alerts.description}
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              {t.pages.alerts.comingSoon}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}

