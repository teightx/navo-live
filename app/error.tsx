"use client";

/**
 * Segment Error Boundary
 *
 * Catches errors within route segments (pages, layouts).
 * Displays a user-friendly error UI with optional support code.
 *
 * IMPORTANT:
 * - Does NOT capture "expected" errors like RATE_LIMITED or FLIGHT_CONTEXT_MISSING
 *   (those have dedicated UI states in their components)
 * - Only for unexpected errors
 */

import { useEffect } from "react";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { BackgroundWaves } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

// ============================================================================
// Icons
// ============================================================================

function AlertTriangleIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function HomeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  );
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

// ============================================================================
// Error Boundary Component
// ============================================================================

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const { t } = useI18n();

  // Log error to console for debugging (production should use error tracking service)
  useEffect(() => {
    console.error("[ErrorBoundary]", error);
  }, [error]);

  // Extract requestId from error message if available
  // API errors often include requestId in the format: "... [requestId: abc123]"
  const requestIdMatch = error.message?.match(/\[requestId:\s*([^\]]+)\]/);
  const requestId = requestIdMatch?.[1] || error.digest;
  const shortCode = requestId?.slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <BackgroundWaves />

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 pt-20 relative z-10">
        <div className="w-full max-w-md text-center">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 mb-6 rounded-full bg-accent-soft/20 flex items-center justify-center">
            <AlertTriangleIcon className="w-8 h-8 text-accent" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-semibold text-ink mb-3 lowercase">
            {t.error.title}
          </h1>

          {/* Message */}
          <p className="text-ink-soft mb-6 lowercase">
            {t.error.message}
          </p>

          {/* Support Code */}
          <div className="mb-8 p-3 bg-cream-dark/30 rounded-lg">
            <p className="text-sm text-ink-muted lowercase font-mono">
              {shortCode
                ? t.error.supportCode.replace("{code}", shortCode)
                : t.error.noCode}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue text-cream rounded-full text-sm font-medium hover:bg-blue-dark transition-colors lowercase"
            >
              <HomeIcon className="w-4 h-4" />
              {t.error.goHome}
            </Link>

            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-cream-dark/50 text-ink rounded-full text-sm font-medium hover:bg-cream-dark transition-colors lowercase"
            >
              <SearchIcon className="w-4 h-4" />
              {t.error.newSearch}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

