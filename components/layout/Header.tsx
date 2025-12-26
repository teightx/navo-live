import Link from "next/link";
import { LogoMark, Wordmark } from "@/components/brand";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-sm">
      <nav className="mx-auto max-w-5xl px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark className="w-7 h-7" />
          <Wordmark className="text-xl" />
        </Link>

        <div className="flex items-center gap-8">
          <Link
            href="/sobre"
            className="text-sm text-ink-soft hover:text-ink transition-colors"
          >
            sobre
          </Link>
          <Link
            href="/alertas"
            className="text-sm text-ink-soft hover:text-ink transition-colors"
          >
            alertas
          </Link>
        </div>
      </nav>
    </header>
  );
}

