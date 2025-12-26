import { Header, Footer } from "@/components/layout";
import { BackgroundWaves, SearchForm } from "@/components/ui";

export default function Home() {
  return (
    <>
      <BackgroundWaves />
      <Header />

      <main className="min-h-screen flex flex-col">
        <section className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-16">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium text-ink mb-4 tracking-tight">
              para onde você quer ir?
            </h1>
            <p className="text-ink-soft text-base sm:text-lg">
              preços mudam. a gente acompanha.
            </p>
          </div>

          <SearchForm />
        </section>

        <Footer />
      </main>
    </>
  );
}
