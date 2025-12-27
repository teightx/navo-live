/**
 * IP Address Utilities
 *
 * Functions for extracting and hashing client IP addresses.
 * Used for rate limiting without storing raw IP addresses.
 */

import "server-only";

// ============================================================================
// IP Extraction
// ============================================================================

/**
 * Extract client IP address from request headers
 *
 * Checks common proxy headers in order of preference:
 * 1. x-forwarded-for (standard proxy header, first IP)
 * 2. x-real-ip (nginx default)
 * 3. Falls back to null if no IP found
 *
 * @param request - The incoming request object
 * @returns Client IP address or null if not found
 */
export function getClientIp(request: Request): string | null {
  // Try x-forwarded-for (comma-separated list, first is original client)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp && isValidIp(firstIp)) {
      return firstIp;
    }
  }

  // Try x-real-ip
  const realIp = request.headers.get("x-real-ip");
  if (realIp && isValidIp(realIp)) {
    return realIp;
  }

  return null;
}

/**
 * Basic IP address validation
 */
function isValidIp(ip: string): boolean {
  // IPv4: basic pattern check
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Pattern.test(ip)) {
    return true;
  }

  // IPv6: contains colons
  if (ip.includes(":")) {
    return true;
  }

  return false;
}

// ============================================================================
// IP Hashing
// ============================================================================

/**
 * Hash an IP address for privacy-preserving rate limiting
 *
 * Uses SHA-256 with optional salt from environment.
 * Never logs or stores raw IP addresses.
 *
 * @param ip - The IP address to hash
 * @returns Hex-encoded SHA-256 hash
 */
export async function hashIp(ip: string): Promise<string> {
  const salt = process.env.RATE_LIMIT_SALT || "navo-rate-limit";
  const data = `${ip}:${salt}`;

  // Use Web Crypto API (available in Edge Runtime)
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);

  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return hashHex;
}

// ============================================================================
// Rate Limit Key Builders
// ============================================================================

/**
 * Build rate limit key for search endpoint
 *
 * @param request - The incoming request
 * @returns Rate limit key in format "search:{hashedIp}" or "search:unknown"
 */
export async function buildRateLimitKeyForSearch(request: Request): Promise<string> {
  const ip = getClientIp(request);

  if (!ip) {
    // Fallback for requests without IP (should be rare)
    return "search:unknown";
  }

  const hashedIp = await hashIp(ip);

  // Use first 16 chars of hash for shorter keys
  return `search:${hashedIp.slice(0, 16)}`;
}

/**
 * Build rate limit key for flight detail endpoint
 *
 * @param request - The incoming request
 * @returns Rate limit key in format "detail:{hashedIp}" or "detail:unknown"
 */
export async function buildRateLimitKeyForDetail(request: Request): Promise<string> {
  const ip = getClientIp(request);

  if (!ip) {
    return "detail:unknown";
  }

  const hashedIp = await hashIp(ip);
  return `detail:${hashedIp.slice(0, 16)}`;
}

