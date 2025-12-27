/**
 * Partner Click Tracking Endpoint
 *
 * POST /api/track/partner-click
 *
 * Logs partner click events for analytics and auditing.
 * Uses structured logging with automatic redaction.
 */

import { NextRequest, NextResponse } from "next/server";
import { logInfo, createRequestLogger } from "@/lib/logging/logger";
import { randomUUID } from "crypto";

// ============================================================================
// Types
// ============================================================================

interface PartnerClickBody {
  /** Partner slug */
  partner: string;
  /** Flight ID */
  flightId: string;
  /** Route info */
  route: {
    from: string;
    to: string;
  };
  /** Timestamp (ISO string) */
  ts: string;
  /** Original request ID from flight fetch (optional) */
  requestId?: string;
  /** Search session ID (optional) */
  sid?: string;
}

// ============================================================================
// Validation
// ============================================================================

function validateBody(body: unknown): body is PartnerClickBody {
  if (!body || typeof body !== "object") return false;

  const b = body as Record<string, unknown>;

  if (typeof b.partner !== "string" || !b.partner) return false;
  if (typeof b.flightId !== "string" || !b.flightId) return false;
  if (typeof b.ts !== "string" || !b.ts) return false;

  if (!b.route || typeof b.route !== "object") return false;
  const route = b.route as Record<string, unknown>;
  if (typeof route.from !== "string" || !route.from) return false;
  if (typeof route.to !== "string" || !route.to) return false;

  // Optional fields
  if (b.requestId !== undefined && typeof b.requestId !== "string") return false;
  if (b.sid !== undefined && typeof b.sid !== "string") return false;

  return true;
}

// ============================================================================
// Handler
// ============================================================================

export async function POST(request: NextRequest) {
  // Generate request ID for this tracking call
  const trackingRequestId = randomUUID();
  const log = createRequestLogger(trackingRequestId);

  try {
    const body = await request.json();

    if (!validateBody(body)) {
      log.warn("PARTNER_CLICK_INVALID", {
        reason: "Invalid request body",
      });

      return NextResponse.json(
        { error: "Invalid request body" },
        {
          status: 400,
          headers: { "X-Request-Id": trackingRequestId },
        }
      );
    }

    // Build route key for logging
    const routeKey = `${body.route.from}-${body.route.to}`;

    // Log the partner click event
    log.info("PARTNER_CLICK", {
      partner: body.partner,
      flightId: body.flightId,
      routeKey,
      sid: body.sid || null,
      originalRequestId: body.requestId || null,
      clientTs: body.ts,
    });

    // Return success with request ID
    return NextResponse.json(
      { success: true },
      {
        status: 200,
        headers: { "X-Request-Id": trackingRequestId },
      }
    );
  } catch (error) {
    log.error("PARTNER_CLICK_ERROR", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: { "X-Request-Id": trackingRequestId },
      }
    );
  }
}

// Only allow POST
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

