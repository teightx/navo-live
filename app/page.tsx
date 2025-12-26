"use client";

import { Header, Footer } from "@/components/layout";
import { BackgroundWaves } from "@/components/ui";
import { SearchBar } from "@/components/searchbar";
import { useI18n } from "@/lib/i18n";

export default function Home() {
  const { t } = useI18n();

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

          <SearchBar />
        </section>

        <Footer />
      </main>
    </>
  );
}
