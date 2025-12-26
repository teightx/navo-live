import { Wordmark } from "@/components/brand";

export function Footer() {
  return (
    <footer className="mt-auto py-12 px-6">
      <div className="mx-auto max-w-5xl flex items-center justify-between text-sm text-ink-muted">
        <Wordmark className="text-ink-muted text-base" />
        <span>preços mudam. a gente acompanha.</span>
      </div>
    </footer>
  );
}

