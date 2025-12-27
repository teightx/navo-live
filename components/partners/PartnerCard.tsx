"use client";

/**
 * Partner Card Component
 *
 * Displays a partner with logo, name, and CTA button.
 * Used in flight detail page for "where to buy" section.
 *
 * IMPORTANT: Does NOT show price per partner.
 * We only show the flight's base price once, outside this component.
 */

import { PartnerLogo } from "./PartnerLogo";
import { getPartner, type Partner } from "@/lib/partners";
import { buildOutboundUrl, type SearchContext } from "@/lib/partners/outbound";
import { trackPartnerClickEvent } from "@/lib/tracking/partnerClick";
import { useI18n } from "@/lib/i18n";
import type { FlightResult } from "@/lib/search/types";

// ============================================================================
// Types
// ============================================================================

interface PartnerCardProps {
  /** Partner slug */
  slug: string;
  /** Flight data (for outbound URL and tracking) */
  flight?: FlightResult;
  /** Search context for outbound URL */
  searchContext?: SearchContext;
  /** Search session ID (for tracking) */
  sid?: string;
  /** Original request ID from flight fetch (for tracking) */
  requestId?: string;
}

// ============================================================================
// Component
// ============================================================================

export function PartnerCard({
  slug,
  flight,
  searchContext,
  sid,
  requestId,
}: PartnerCardProps) {
  const { t } = useI18n();
  const partner = getPartner(slug);

  if (!partner) {
    return null;
  }

  const url = buildOutboundUrl(slug, flight, searchContext);

  const handleClick = () => {
    // Track the click (fire-and-forget)
    if (flight) {
      trackPartnerClickEvent({
        partner: slug,
        flightId: flight.id,
        route: {
          from: searchContext?.from || "???",
          to: searchContext?.to || "???",
        },
        sid,
        requestId,
      });
    }

    // Open in new tab (never blocked by tracking)
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="p-4 rounded-xl border transition-all hover:shadow-md hover:border-blue/30"
      style={{
        background: "var(--card-bg)",
        borderColor: "var(--card-border)",
      }}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Logo + Info */}
        <div className="flex items-center gap-3 min-w-0">
          <PartnerLogo slug={slug} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-ink truncate">
                {partner.name}
              </span>
              {partner.official && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide flex-shrink-0"
                  style={{
                    background: "var(--sage)",
                    color: "white",
                  }}
                >
                  {t.flightDetails.officialSite}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: CTA */}
        <button
          onClick={handleClick}
          className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 hover:opacity-90"
          style={{
            background: "var(--cream-dark)",
            color: "var(--ink)",
          }}
        >
          <span>{t.flightDetails.goToSite}</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M3 11L11 3M11 3H5M11 3V9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Partner List Component
// ============================================================================

interface PartnerListProps {
  /** Partner slugs to display */
  partners: string[];
  /** Flight data (for outbound URL and tracking) */
  flight?: FlightResult;
  /** Search context for outbound URL */
  searchContext?: SearchContext;
  /** Search session ID (for tracking) */
  sid?: string;
  /** Original request ID from flight fetch (for tracking) */
  requestId?: string;
}

export function PartnerList({
  partners,
  flight,
  searchContext,
  sid,
  requestId,
}: PartnerListProps) {
  return (
    <div className="space-y-3">
      {partners.map((slug) => (
        <PartnerCard
          key={slug}
          slug={slug}
          flight={flight}
          searchContext={searchContext}
          sid={sid}
          requestId={requestId}
        />
      ))}
    </div>
  );
}
