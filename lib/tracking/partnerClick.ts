/**
 * Partner Click Tracking - Client Side
 *
 * Tracks partner clicks via POST to /api/track/partner-click
 * Uses sendBeacon when available for reliable tracking.
 * Never blocks the user from navigating to the partner site.
 */

// ============================================================================
// Types
// ============================================================================

export interface PartnerClickData {
  /** Partner slug */
  partner: string;
  /** Flight ID */
  flightId: string;
  /** Route info */
  route: {
    from: string;
    to: string;
  };
  /** Original request ID from flight fetch (optional) */
  requestId?: string;
  /** Search session ID (optional) */
  sid?: string;
}

// ============================================================================
// Tracking Function
// ============================================================================

/**
 * Track a partner click event
 *
 * Uses navigator.sendBeacon when available (fire-and-forget).
 * Falls back to fetch with keepalive.
 * Never throws - tracking failures are logged but don't affect UX.
 *
 * @param data - Click data to track
 */
export function trackPartnerClickEvent(data: PartnerClickData): void {
  if (typeof window === "undefined") {
    // SSR - skip
    return;
  }

  const payload: Record<string, unknown> = {
    partner: data.partner,
    flightId: data.flightId,
    route: data.route,
    ts: new Date().toISOString(),
  };

  // Add optional fields
  if (data.requestId) payload.requestId = data.requestId;
  if (data.sid) payload.sid = data.sid;

  const body = JSON.stringify(payload);
  const endpoint = "/api/track/partner-click";

  try {
    // Prefer sendBeacon - it's designed for this use case
    // It's reliable even when the page is unloading
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      const sent = navigator.sendBeacon(endpoint, blob);

      if (!sent) {
        // sendBeacon failed (queue full), try fetch
        fallbackFetch(endpoint, body);
      }

      return;
    }

    // Fallback to fetch with keepalive
    fallbackFetch(endpoint, body);
  } catch (error) {
    // Never let tracking errors affect UX
    console.warn("[tracking] Partner click tracking failed:", error);
  }
}

/**
 * Fallback fetch with keepalive
 */
function fallbackFetch(endpoint: string, body: string): void {
  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch((error) => {
    // Silent fail - tracking should never block UX
    console.warn("[tracking] Fetch fallback failed:", error);
  });
}

