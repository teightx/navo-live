"use client";

/**
 * Global Error Boundary
 *
 * Catches errors that occur outside of route segments,
 * including errors in the root layout.
 *
 * IMPORTANT:
 * - This is a fallback for catastrophic errors
 * - Cannot use providers/layouts (they may have caused the error)
 * - Must include <html> and <body> tags
 * - Keep UI minimal and safe
 */

import { useEffect } from "react";

// ============================================================================
// Static Styles (no external dependencies)
// ============================================================================

const styles = {
  html: {
    minHeight: "100vh",
  } as React.CSSProperties,
  body: {
    margin: 0,
    padding: 0,
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    backgroundColor: "#FDFBF7",
    color: "#2D2D2D",
  } as React.CSSProperties,
  container: {
    textAlign: "center" as const,
    padding: "2rem",
    maxWidth: "400px",
  } as React.CSSProperties,
  iconWrapper: {
    width: "64px",
    height: "64px",
    margin: "0 auto 1.5rem",
    borderRadius: "50%",
    backgroundColor: "rgba(233, 154, 106, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as React.CSSProperties,
  icon: {
    width: "32px",
    height: "32px",
    color: "#D97C3C",
  } as React.CSSProperties,
  title: {
    fontSize: "1.5rem",
    fontWeight: 600,
    marginBottom: "0.75rem",
    textTransform: "lowercase" as const,
  } as React.CSSProperties,
  message: {
    color: "#5C5C5C",
    marginBottom: "1.5rem",
    textTransform: "lowercase" as const,
    lineHeight: 1.5,
  } as React.CSSProperties,
  codeBox: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: "8px",
    padding: "0.75rem",
    marginBottom: "2rem",
    fontFamily: "monospace",
    fontSize: "0.875rem",
    color: "#7A7A7A",
    textTransform: "lowercase" as const,
  } as React.CSSProperties,
  buttonGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
  } as React.CSSProperties,
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.625rem 1.25rem",
    backgroundColor: "#4F7386",
    color: "#FDFBF7",
    borderRadius: "9999px",
    fontSize: "0.875rem",
    fontWeight: 500,
    border: "none",
    cursor: "pointer",
    textDecoration: "none",
    textTransform: "lowercase" as const,
  } as React.CSSProperties,
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.625rem 1.25rem",
    backgroundColor: "rgba(0, 0, 0, 0.08)",
    color: "#2D2D2D",
    borderRadius: "9999px",
    fontSize: "0.875rem",
    fontWeight: 500,
    border: "none",
    cursor: "pointer",
    textTransform: "lowercase" as const,
  } as React.CSSProperties,
  brand: {
    marginTop: "3rem",
    fontSize: "0.875rem",
    color: "#7A9B6A",
    fontWeight: 500,
  } as React.CSSProperties,
};

// ============================================================================
// Inline SVG Icon (no imports)
// ============================================================================

function AlertIcon() {
  return (
    <svg
      style={styles.icon}
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

// ============================================================================
// Global Error Component
// ============================================================================

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  // Log error for debugging
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  // Extract support code
  const requestIdMatch = error.message?.match(/\[requestId:\s*([^\]]+)\]/);
  const requestId = requestIdMatch?.[1] || error.digest;
  const shortCode = requestId?.slice(0, 8);

  // Static text (i18n not available in global error)
  const text = {
    title: "ops, algo deu errado",
    message: "houve um problema ao carregar a página. tente novamente.",
    supportCode: `código de suporte: ${shortCode || "—"}`,
    goHome: "voltar para home",
    tryAgain: "tentar novamente",
  };

  return (
    <html lang="pt-BR" style={styles.html}>
      <body style={styles.body}>
        <div style={styles.container}>
          {/* Icon */}
          <div style={styles.iconWrapper}>
            <AlertIcon />
          </div>

          {/* Title */}
          <h1 style={styles.title}>{text.title}</h1>

          {/* Message */}
          <p style={styles.message}>{text.message}</p>

          {/* Support Code */}
          <div style={styles.codeBox}>{text.supportCode}</div>

          {/* Actions */}
          <div style={styles.buttonGroup}>
            <a href="/" style={styles.primaryButton}>
              {text.goHome}
            </a>

            <button onClick={reset} style={styles.secondaryButton}>
              {text.tryAgain}
            </button>
          </div>

          {/* Brand */}
          <div style={styles.brand}>navo</div>
        </div>
      </body>
    </html>
  );
}

