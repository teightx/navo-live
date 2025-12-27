/**
 * API Protection Utilities
 *
 * Provides protection against unauthorized API access:
 * - Origin validation (same-origin requests only)
 * - Rate limiting
 * - Request validation
 */

import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getMemoryRateLimiter } from "@/lib/rate-limit/memoryRateLimiter";

// ============================================================================
// Configuration
// ============================================================================

/**
 * Allowed origins for API requests
 * In production, this should only include your domain
 */
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://navo.live",
  "https://www.navo.live",
  // Add preview deployment patterns for Vercel
];

/**
 * Rate limit configuration per endpoint type
 */
const RATE_LIMITS = {
  // Public routes - more lenient
  public: { limit: 60, windowSec: 60 }, // 60 requests per minute
  // Search routes - moderate
  search: { limit: 30, windowSec: 60 }, // 30 requests per minute
  // Sensitive routes - strict
  sensitive: { limit: 10, windowSec: 60 }, // 10 requests per minute
} as const;

// ============================================================================
// Types
// ============================================================================

export interface ProtectionResult {
  allowed: boolean;
  error?: {
    status: number;
    message: string;
    code: string;
  };
  clientIp: string;
}

type RateLimitType = keyof typeof RATE_LIMITS;

// ============================================================================
// Functions
// ============================================================================

/**
 * Get client IP from request headers
 */
function getClientIp(request: NextRequest): string {
  // Vercel/Cloudflare headers
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  // Real IP header
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback
  return "unknown";
}

/**
 * Validate request origin
 */
function isValidOrigin(request: NextRequest): boolean {
  // Skip origin check in development
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // Check origin header
  if (origin) {
    // Allow Vercel preview deployments
    if (origin.includes(".vercel.app")) {
      return true;
    }
    return ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed));
  }

  // Check referer as fallback
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = refererUrl.origin;
      // Allow Vercel preview deployments
      if (refererOrigin.includes(".vercel.app")) {
        return true;
      }
      return ALLOWED_ORIGINS.some((allowed) => refererOrigin.startsWith(allowed));
    } catch {
      return false;
    }
  }

  // No origin or referer - could be direct API call
  // Be strict in production
  return process.env.NODE_ENV !== "production";
}

/**
 * Check rate limit for a request
 */
async function checkRateLimit(
  clientIp: string,
  endpoint: string,
  type: RateLimitType = "public"
): Promise<{ allowed: boolean; remaining: number; resetSec: number }> {
  const rateLimiter = getMemoryRateLimiter();
  const config = RATE_LIMITS[type];
  const key = `api:${endpoint}:${clientIp}`;

  return rateLimiter.check(key, config.limit, config.windowSec);
}

/**
 * Protect an API route
 * Returns null if request is allowed, or a NextResponse if blocked
 */
export async function protectApiRoute(
  request: NextRequest,
  options: {
    endpoint: string;
    rateLimit?: RateLimitType;
  }
): Promise<NextResponse | null> {
  const clientIp = getClientIp(request);

  // 1. Validate origin
  if (!isValidOrigin(request)) {
    return NextResponse.json(
      {
        error: "Forbidden",
        message: "Invalid request origin",
        code: "INVALID_ORIGIN",
      },
      {
        status: 403,
        headers: {
          "X-Error-Code": "INVALID_ORIGIN",
        },
      }
    );
  }

  // 2. Check rate limit
  const rateResult = await checkRateLimit(
    clientIp,
    options.endpoint,
    options.rateLimit || "public"
  );

  if (!rateResult.allowed) {
    return NextResponse.json(
      {
        error: "Too Many Requests",
        message: `Rate limit exceeded. Try again in ${rateResult.resetSec} seconds.`,
        code: "RATE_LIMITED",
        retryAfter: rateResult.resetSec,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateResult.resetSec),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rateResult.resetSec),
        },
      }
    );
  }

  // Request allowed
  return null;
}

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent caching of API responses with sensitive data
  response.headers.set("Cache-Control", "private, no-store");
  
  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");
  
  return response;
}

