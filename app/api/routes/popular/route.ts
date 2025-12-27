/**
 * GET /api/routes/popular
 *
 * Returns popular routes with real price data from the price history system.
 *
 * Query params:
 * - limit: number (default: 6, max: 12)
 *
 * Response:
 * {
 *   routes: PopularRouteCard[],
 *   meta: { fetchedAt, minSamplesRequired },
 *   requestId: string
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { createRequestLogger } from "@/lib/logging/logger";
import { getPopularRoutesForApi } from "@/lib/routes/popular";

/**
 * Generate unique request ID for tracing
 */
function generateRequestId(): string {
  return `pop_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  const logger = createRequestLogger(requestId);

  try {
    // Parse query params
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = Math.min(Math.max(parseInt(limitParam || "6", 10) || 6, 1), 12);

    logger.info("POPULAR_ROUTES_REQUEST", { limit });

    const data = await getPopularRoutesForApi(limit);

    const durationMs = Date.now() - startTime;

    logger.info("POPULAR_ROUTES_SUCCESS", {
      routeCount: data.routes.length,
      withPrice: data.routes.filter((r) => r.price !== undefined).length,
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
          "Cache-Control": "public, max-age=300, s-maxage=600", // Cache for 5-10 minutes
        },
      }
    );
  } catch (error) {
    const durationMs = Date.now() - startTime;

    logger.error("POPULAR_ROUTES_ERROR", {
      message: error instanceof Error ? error.message : "Unknown error",
      durationMs,
    });

    return NextResponse.json(
      {
        error: "Failed to fetch popular routes",
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

