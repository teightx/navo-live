import type { NextConfig } from "next";

// ============================================================================
// Environment Detection
// ============================================================================

const isProduction = process.env.NODE_ENV === "production";

// ============================================================================
// Security Headers Configuration
// ============================================================================

/**
 * Content Security Policy
 * Permissive enough to allow Google Analytics while maintaining security
 */
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://www.google-analytics.com https://*.googletagmanager.com;
  font-src 'self' data:;
  connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com;
  frame-ancestors 'none';
  form-action 'self';
  base-uri 'self';
  object-src 'none';
`.replace(/\s{2,}/g, " ").trim();

/**
 * Build security headers based on environment
 * HSTS is only applied in production to avoid breaking local development
 */
function buildSecurityHeaders(): Array<{ key: string; value: string }> {
  const headers: Array<{ key: string; value: string }> = [
    // Prevent MIME type sniffing
    {
      key: "X-Content-Type-Options",
      value: "nosniff",
    },
    // Control referrer information
    {
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin",
    },
    // Prevent clickjacking
    {
      key: "X-Frame-Options",
      value: "DENY",
    },
    // Restrict browser features
    {
      key: "Permissions-Policy",
      value: "geolocation=(), microphone=(), camera=()",
    },
    // Content Security Policy
    {
      key: "Content-Security-Policy",
      value: ContentSecurityPolicy,
    },
  ];

  // Only add HSTS in production (requires HTTPS)
  if (isProduction) {
    headers.unshift({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    });
  }

  return headers;
}

const securityHeaders = buildSecurityHeaders();

// ============================================================================
// Next.js Configuration
// ============================================================================

const nextConfig: NextConfig = {
  // Apply security headers to all routes
  async headers() {
    return [
      {
        // Apply to all page routes
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // Apply to all API routes
        source: "/api/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
