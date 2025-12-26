/**
 * Tracking de cliques em parceiros
 * 
 * Integra com Google Analytics 4 e fornece fallback para desenvolvimento.
 * Tracking é assíncrono e não bloqueia redirects.
 */

export interface PartnerClickParams {
  flightId: string;
  partner: {
    id: string;
    name: string;
  };
  price: number;
  route: {
    from: string;
    to: string;
  };
  position: number; // Posição na lista (0 = primeiro)
  flightPrice?: number; // Preço do voo base
}

/**
 * Gera URL com parâmetros UTM e afiliado
 */
export function buildPartnerUrl(
  baseUrl: string,
  params: PartnerClickParams
): string {
  const url = new URL(baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`);
  
  // Parâmetros UTM
  url.searchParams.set("utm_source", "navo");
  url.searchParams.set("utm_medium", "metasearch");
  url.searchParams.set("utm_campaign", "flight_booking");
  url.searchParams.set("utm_content", `flight_${params.flightId}_partner_${params.partner.id}`);
  
  // Parâmetros de afiliado (ajustar conforme necessário)
  url.searchParams.set("ref", "navo");
  url.searchParams.set("affiliate_id", params.partner.id);
  
  // Parâmetros customizados para tracking interno
  url.searchParams.set("navo_flight_id", params.flightId);
  url.searchParams.set("navo_position", String(params.position));
  url.searchParams.set("navo_price", String(params.price));
  url.searchParams.set("navo_route", `${params.route.from}_${params.route.to}`);
  
  return url.toString();
}

/**
 * Dispara evento de clique no Google Analytics 4
 */
function trackGA4(params: PartnerClickParams): void {
  if (typeof window === "undefined") return;
  
  // Verifica se gtag está disponível
  const gtag = (window as any).gtag;
  if (!gtag) {
    console.warn("[Analytics] gtag não disponível. Verifique se GA4 está configurado.");
    return;
  }
  
  gtag("event", "partner_click", {
    event_category: "affiliate",
    event_label: params.partner.name,
    partner_id: params.partner.id,
    partner_name: params.partner.name,
    flight_id: params.flightId,
    price: params.price,
    position: params.position,
    route_from: params.route.from,
    route_to: params.route.to,
    value: params.price, // Valor monetário para conversão
    currency: "BRL",
  });
}

/**
 * Tracking principal - dispara evento e retorna URL com parâmetros
 * 
 * Uso:
 * const url = trackPartnerClick({ ... });
 * window.open(url, '_blank');
 */
export function trackPartnerClick(params: PartnerClickParams): string {
  // Dispara evento de forma assíncrona (não bloqueia)
  if (typeof window !== "undefined") {
    // Usa requestIdleCallback se disponível, senão setTimeout
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => {
        trackGA4(params);
        console.log("[Analytics] Partner click tracked:", params);
      }, { timeout: 100 });
    } else {
      setTimeout(() => {
        trackGA4(params);
        console.log("[Analytics] Partner click tracked:", params);
      }, 0);
    }
  } else {
    // Server-side: apenas log
    console.log("[Analytics] Partner click (SSR):", params);
  }
  
  // Retorna URL com parâmetros imediatamente
  return buildPartnerUrl(`https://${params.partner.id}.com`, params);
}

/**
 * Tracking simples para desenvolvimento (sem GA4)
 */
export function trackPartnerClickDev(params: PartnerClickParams): void {
  console.log("🔗 Partner Click:", {
    partner: params.partner.name,
    flight: params.flightId,
    price: params.price,
    route: `${params.route.from} → ${params.route.to}`,
    position: params.position,
  });
}

