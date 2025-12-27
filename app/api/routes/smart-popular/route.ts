/**
 * GET /api/routes/smart-popular
 *
 * Returns smart holiday-based route suggestions with real price data.
 *
 * Query params:
 * - from: Origin IATA code (default: GRU)
 *
 * Response:
 * {
 *   routes: SmartRouteCard[],
 *   origin: { code, city },
 *   holidays: [{ key, name, startDate, endDate }],
 *   meta: { fetchedAt, minSamplesRequired },
 *   requestId: string
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { createRequestLogger } from "@/lib/logging/logger";
import { getSmartPopularRoutes } from "@/lib/routes/smartPopular";
import { protectApiRoute, addSecurityHeaders } from "@/lib/api/protection";

/**
 * Generate unique request ID for tracing
 */
function generateRequestId(): string {
  return `smart_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  // Check API protection (origin validation + rate limiting)
  const protectionError = await protectApiRoute(request, {
    endpoint: "smart-popular",
    rateLimit: "public",
  });
  if (protectionError) {
    return protectionError;
  }

  const requestId = generateRequestId();
  const startTime = Date.now();
  const logger = createRequestLogger(requestId);

  try {
    // Parse query params
    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get("from");
    const origin = fromParam?.toUpperCase() || "GRU";

    logger.info("SMART_POPULAR_REQUEST", { origin });

    const data = await getSmartPopularRoutes(origin);

    const durationMs = Date.now() - startTime;

    logger.info("SMART_POPULAR_SUCCESS", {
      origin: data.origin.code,
      routeCount: data.routes.length,
      withPrice: data.routes.filter((r) => r.price !== undefined).length,
      holidayCount: data.holidays.length,
      durationMs,
    });

    return NextResponse.json(
      {
        ...data,
        requestId,
      },
      {
        status: 200,
        headers: {
          "X-Request-Id": requestId,
          // Short cache - data changes based on price history
          "Cache-Control": "public, max-age=300, s-maxage=300",
        },
      }
    );
  } catch (error) {
    const durationMs = Date.now() - startTime;

    logger.error("SMART_POPULAR_ERROR", {
      message: error instanceof Error ? error.message : "Unknown error",
      durationMs,
    });

    return NextResponse.json(
      {
        error: "Failed to fetch smart popular routes",
        requestId,
      },
      {
        status: 500,
        headers: {
          "X-Request-Id": requestId,
        },
      }
    );
  }
}

