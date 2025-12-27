# Inventário de Arquivos - navo.live

**Versão:** 1.0  
**Data:** 2025-01-XX  
**Mantido por:** Tech Lead

---

Este documento lista todos os arquivos do projeto, seus exports principais e observações sobre server-only vs client.

---

## app/

### app/layout.tsx
- **Tipo:** Server Component (default)
- **Export:** `default function RootLayout`
- **Server-only:** ✅ Sim (metadata, providers)
- **Descrição:** Layout raiz, define metadata, providers (theme + i18n), portal root

### app/page.tsx
- **Tipo:** Client Component (`"use client"`)
- **Export:** `default function Home`
- **Server-only:** ❌ Não
- **Descrição:** Home page, hero + SearchBar, não renderiza resultados

### app/resultados/page.tsx
- **Tipo:** Client Component (`"use client"`)
- **Export:** `default function ResultadosPage`
- **Server-only:** ❌ Não
- **Descrição:** Página de resultados, lista de voos, filtros, busca salva

### app/voos/[id]/page.tsx
- **Tipo:** Server Component (wrapper)
- **Export:** `default function FlightDetailPage`
- **Server-only:** ✅ Sim (wrapper)
- **Descrição:** Wrapper com Suspense para FlightDetailContent

### app/voos/[id]/FlightDetailContent.tsx
- **Tipo:** Client Component (`"use client"`)
- **Export:** `export function FlightDetailContent`
- **Server-only:** ❌ Não
- **Descrição:** Conteúdo da página de detalhes do voo, busca voo por ID

### app/como-funciona/page.tsx
- **Tipo:** Server Component (default)
- **Export:** `default function ComoFuncionaPage`
- **Server-only:** ✅ Sim
- **Descrição:** Página estática "como funciona"

### app/alertas/page.tsx
- **Tipo:** Server Component (default)
- **Export:** `default function AlertasPage`
- **Server-only:** ✅ Sim
- **Descrição:** Página placeholder "alertas - em breve"

### app/privacidade/page.tsx
- **Tipo:** Server Component (default)
- **Export:** `default function PrivacidadePage`
- **Server-only:** ✅ Sim
- **Descrição:** Página de política de privacidade

### app/termos/page.tsx
- **Tipo:** Server Component (default)
- **Export:** `default function TermosPage`
- **Server-only:** ✅ Sim
- **Descrição:** Página de termos de uso

### app/globals.css
- **Tipo:** CSS
- **Export:** N/A
- **Server-only:** N/A
- **Descrição:** Estilos globais, variáveis CSS (light/dark), animações

### app/api/flights/search/route.ts
- **Tipo:** Route Handler (server-only)
- **Export:** `export async function GET`, `export async function OPTIONS`
- **Server-only:** ✅ Sim (importa "server-only")
- **Descrição:** API route para busca de voos, validação, cache, integração Amadeus

### app/api/flights/[id]/route.ts
- **Tipo:** Route Handler (server-only)
- **Export:** `export async function GET`
- **Server-only:** ✅ Sim
- **Descrição:** API route para buscar voo por ID, cache + re-fetch fallback

---

## components/

### components/analytics/GoogleAnalytics.tsx
- **Tipo:** Client Component (`"use client"`)
- **Export:** `export function GoogleAnalytics`
- **Server-only:** ❌ Não
- **Descrição:** Componente Google Analytics 4

### components/brand/LogoMark.tsx
- **Tipo:** Client Component (SVG)
- **Export:** `export function LogoMark`
- **Server-only:** ❌ Não
- **Descrição:** Logo mark SVG da marca navo

### components/brand/Wordmark.tsx
- **Tipo:** Client Component (SVG)
- **Export:** `export function Wordmark`
- **Server-only:** ❌ Não
- **Descrição:** Wordmark SVG da marca navo

### components/brand/index.ts
- **Tipo:** Barrel export
- **Export:** `LogoMark`, `Wordmark`
- **Server-only:** N/A
- **Descrição:** Re-exports de componentes de marca

### components/flights/AirlineLogo.tsx
- **Tipo:** Client Component
- **Export:** `export function AirlineLogo`
- **Server-only:** ❌ Não
- **Descrição:** Logo de companhia aérea (SVG ou fallback)

### components/flights/FlightCard.tsx
- **Tipo:** Client Component (`"use client"`)
- **Export:** `export function FlightCard`
- **Server-only:** ❌ Não
- **Descrição:** Card de voo na lista de resultados

### components/flights/index.ts
- **Tipo:** Barrel export
- **Export:** `FlightCard`, `AirlineLogo`
- **Server-only:** N/A
- **Descrição:** Re-exports de componentes de voos

### components/layout/Header.tsx
- **Tipo:** Client Component (`"use client"`)
- **Export:** `export function Header`
- **Server-only:** ❌ Não
- **Descrição:** Header com logo, links, toggles

### components/layout/Footer.tsx
- **Tipo:** Server Component (default)
- **Export:** `export function Footer`
- **Server-only:** ✅ Sim
- **Descrição:** Footer com links e disclaimer

### components/layout/LanguageToggle.tsx
- **Tipo:** Client Component (`"use client"`)
- **Export:** `export function LanguageToggle`
- **Server-only:** ❌ Não
- **Descrição:** Toggle de idioma (pt/en)

### components/layout/ThemeToggle.tsx
- **Tipo:** Client Component (`"use client"`)
- **Export:** `export function ThemeToggle`
- **Server-only:** ❌ Não
- **Descrição:** Toggle de tema (light/dark/system)

### components/layout/index.ts
- **Tipo:** Barrel export
- **Export:** `Header`, `Footer`
- **Server-only:** N/A
- **Descrição:** Re-exports de componentes de layout

### components/opportunities/OpportunitiesSection.tsx
- **Tipo:** Client Component (`"use client"`)
- **Export:** `export function OpportunitiesSection`
- **Server-only:** ❌ Não
- **Descrição:** Seção de oportunidades (placeholder)

### components/partners/PartnerLogo.tsx
- **Tipo:** Client Component
- **Export:** `export function PartnerLogo`
- **Server-only:** ❌ Não
- **Descrição:** Logo de parceiro (placeholder)

### components/price/PriceInsightBadge.tsx
- **Tipo:** Client Component
- **Export:** `export function PriceInsightBadge`
- **Server-only:** ❌ Não
- **Descrição:** Badge de insight de preço (barato/caro)

### components/results/ResultsFilters.tsx
- **Tipo:** Client Component (`"use client"`)
- **Export:** `export function ResultsFilters`, `export function ResultsFiltersStandalone`, `export type FilterType`
- **Server-only:** ❌ Não
- **Descrição:** Filtros de ordenação (melhor/preço/duração)

### components/results/index.ts
- **Tipo:** Barrel export
- **Export:** `ResultsFilters`, `ResultsFiltersStandalone`, `FilterType`
- **Server-only:** N/A
- **Descrição:** Re-exports de componentes de resultados

### components/search/AirportList.tsx
- **Tipo:** Client Component
- **Export:** `export function AirportList`
- **Server-only:** ❌ Não
- **Descrição:** Lista de aeroportos (não usado atualmente)

### components/search/AutocompleteField.tsx
- **Tipo:** Client Component
- **Export:** `export function AutocompleteField`
- **Server-only:** ❌ Não
- **Descrição:** Campo de autocomplete (não usado atualmente)

### components/search/Calendar.tsx
- **Tipo:** Client Component
- **Export:** `export function Calendar`
- **Server-only:** ❌ Não
- **Descrição:** Calendário (não usado atualmente)

### components/search/DateField.tsx
- **Tipo:** Client Component
- **Export:** `export function DateField`
- **Server-only:** ❌ Não
- **Descrição:** Campo de data (não usado atualmente, usar searchbar/DateField)

### components/search/Field.tsx
- **Tipo:** Client Component
- **Export:** `export function Field`
- **Server-only:** ❌ Não
- **Descrição:** Campo genérico (não usado atualmente)

### components/search/SearchForm.tsx
- **Tipo:** Client Component
- **Export:** `export function SearchForm`
- **Server-only:** ❌ Não
- **Descrição:** Formulário de busca (não usado atualmente, usar SearchBar)

### components/search/index.ts
- **Tipo:** Barrel export
- **Export:** Vazio (não usado)
- **Server-only:** N/A
- **Descrição:** Re-exports (vazio)

### components/searchbar/AirportField.tsx
- **Tipo:** Client Component (`"use client"`)
- **Export:** `export function AirportField`
- **Server-only:** ❌ Não
- **Descrição:** Campo de aeroporto com autocomplete

### components/searchbar/AirportPopover.tsx
- **Tipo:** Client Component (`"use client"`)
- **Export:** `export function AirportPopover`
- **Server-only:** ❌ Não
- **Descrição:** Popover de seleção de aeroporto

### components/searchbar/CalendarPopover.tsx
- **Tipo:** Client Component (`"use client"`)
- **Export:** `export function CalendarPopover`
- **Server-only:** ❌ Não
- **Descrição:** Popover de calendário para seleção de datas

### components/searchbar/DateField.tsx
- **Tipo:** Client Component (`"use client"`)
- **Export:** `export function DateField`
- **Server-only:** ❌ Não
- **Descrição:** Campo de data com popover de calendário

### components/searchbar/DatePopover.tsx
- **Tipo:** Client Component
- **Export:** `export function DatePopover`
- **Server-only:** ❌ Não
- **Descrição:** Popover de data (não usado, usar CalendarPopover)

### components/searchbar/PaxClassPopover.tsx
- **Tipo:** Client Component (`"use client"`)
- **Export:** `export function PaxClassPopover`
- **Server-only:** ❌ Não
- **Descrição:** Popover de passageiros e classe

### components/searchbar/Popover.tsx
- **Tipo:** Client Component (`"use client"`)
- **Export:** `export function Popover`
- **Server-only:** ❌ Não
- **Descrição:** Componente base de popover (Floating UI)

### components/searchbar/SearchBar.tsx
- **Tipo:** Client Component (`"use client"`)
- **Export:** `export function SearchBar`
- **Server-only:** ❌ Não
- **Descrição:** Componente principal de busca (formulário completo)

### components/searchbar/Segment.tsx
- **Tipo:** Client Component
- **Export:** `export function Segment`
- **Server-only:** ❌ Não
- **Descrição:** Segmento de voo (não usado atualmente)

### components/searchbar/SwapButton.tsx
- **Tipo:** Client Component
- **Export:** `export function SwapButton`
- **Server-only:** ❌ Não
- **Descrição:** Botão para inverter origem/destino

### components/searchbar/TripTypePopover.tsx
- **Tipo:** Client Component
- **Export:** `export function TripTypePopover`
- **Server-only:** ❌ Não
- **Descrição:** Popover de tipo de viagem (não usado, usar select)

### components/searchbar/TripTypeSelect.tsx
- **Tipo:** Client Component
- **Export:** `export function TripTypeSelect`
- **Server-only:** ❌ Não
- **Descrição:** Select de tipo de viagem (não usado, usar select nativo)

### components/searchbar/index.ts
- **Tipo:** Barrel export
- **Export:** `SearchBar`, `Segment`, `Popover`, `SwapButton`, `TripTypeSelect`, `AirportField`, `DateField`, `CalendarPopover`, `PaxClassPopover`
- **Server-only:** N/A
- **Descrição:** Re-exports de componentes de busca

### components/ui/BackgroundWaves.tsx
- **Tipo:** Client Component (`"use client"`)
- **Export:** `export function BackgroundWaves`
- **Server-only:** ❌ Não
- **Descrição:** Componente visual de ondas animadas (background)

### components/ui/FloatingPopover.tsx
- **Tipo:** Client Component
- **Export:** `export function FloatingPopover`
- **Server-only:** ❌ Não
- **Descrição:** Wrapper de Floating UI (não usado atualmente)

### components/ui/Portal.tsx
- **Tipo:** Client Component
- **Export:** `export function Portal`
- **Server-only:** ❌ Não
- **Descrição:** Portal para renderizar em `#overlay-root` (não usado, usar React Portal)

### components/ui/SearchForm.tsx
- **Tipo:** Client Component
- **Export:** `export function SearchForm`
- **Server-only:** ❌ Não
- **Descrição:** Formulário de busca (não usado, usar SearchBar)

### components/ui/SearchModal.tsx
- **Tipo:** Client Component (`"use client"`)
- **Export:** `export function SearchModal`
- **Server-only:** ❌ Não
- **Descrição:** Modal de edição de busca

### components/ui/index.ts
- **Tipo:** Barrel export
- **Export:** `BackgroundWaves`, `SearchForm`, `SearchModal`
- **Server-only:** N/A
- **Descrição:** Re-exports de componentes de UI

---

## lib/

### lib/airlines/airlineLogos.ts
- **Tipo:** Server/Client (utilities)
- **Export:** `getAirlineInfo`, `getAirlineLogo`, `getAirlineColor`, `getAirlineName`, `hasAirlineLogo`, `AIRLINES`, `type AirlineInfo`
- **Server-only:** ❌ Não
- **Descrição:** Utilitários para logos e informações de companhias aéreas

### lib/airlines/index.ts
- **Tipo:** Barrel export
- **Export:** Re-exports de `airlineLogos.ts`
- **Server-only:** N/A
- **Descrição:** Re-exports de utilitários de companhias aéreas

### lib/amadeus/auth.ts
- **Tipo:** Server-only
- **Export:** `getAccessToken`, `clearTokenCache`, `hasValidToken`
- **Server-only:** ✅ Sim (`"server-only"`)
- **Descrição:** Autenticação OAuth2, cache de token

### lib/amadeus/client.ts
- **Tipo:** Server-only
- **Export:** `amadeusFetch`, `amadeusRequest` (deprecated), `AmadeusError`, `type AmadeusApiError`, `type AmadeusFetchOptions`, `getAmadeusConfig`, `isAmadeusConfigured`, `getAmadeusBaseUrl`
- **Server-only:** ✅ Sim (`"server-only"`)
- **Descrição:** Cliente HTTP para Amadeus, retry, timeout, error handling

### lib/amadeus/config.ts
- **Tipo:** Server-only
- **Export:** `getAmadeusConfig`, `isAmadeusConfigured`, `getAmadeusBaseUrl`
- **Server-only:** ✅ Sim (`"server-only"`)
- **Descrição:** Configuração de variáveis de ambiente Amadeus

### lib/amadeus/flights.ts
- **Tipo:** Server-only
- **Export:** `searchFlightsAmadeus`
- **Server-only:** ✅ Sim (`"server-only"`)
- **Descrição:** Busca de voos via Amadeus API

### lib/amadeus/mappers/flightOffersToSearchResponse.ts
- **Tipo:** Server-only
- **Export:** `mapFlightOffersToSearchResponse`, `createSearchResponse`, `parseIsoDurationToMinutes`, `parseIsoDuration`, `formatDuration`, `type MapperRequestParams`
- **Server-only:** ✅ Sim (usado apenas em server)
- **Descrição:** Mapeamento de resposta Amadeus para formato interno

### lib/amadeus/mappers/index.ts
- **Tipo:** Barrel export
- **Export:** Re-exports de `flightOffersToSearchResponse.ts`
- **Server-only:** N/A
- **Descrição:** Re-exports de mappers

### lib/amadeus/types.ts
- **Tipo:** Types only
- **Export:** `type *` (todos os tipos Amadeus)
- **Server-only:** N/A (types)
- **Descrição:** Definições TypeScript para API Amadeus

### lib/amadeus/index.ts
- **Tipo:** Barrel export
- **Export:** Re-exports de todos os módulos Amadeus
- **Server-only:** N/A
- **Descrição:** Re-exports centralizados de integração Amadeus

### lib/analytics/tracking.ts
- **Tipo:** Client (browser-only)
- **Export:** `trackPartnerClick`
- **Server-only:** ❌ Não (usa `window`)
- **Descrição:** Tracking de cliques em parceiros (Google Analytics)

### lib/i18n/I18nProvider.tsx
- **Tipo:** Client Component (`"use client"`)
- **Export:** `I18nProvider`, `useI18n`, `type Locale`
- **Server-only:** ❌ Não
- **Descrição:** Provider e hook de internacionalização

### lib/i18n/messages/pt.ts
- **Tipo:** Data (constants)
- **Export:** `pt`, `type Messages`
- **Server-only:** ❌ Não
- **Descrição:** Mensagens em português

### lib/i18n/messages/en.ts
- **Tipo:** Data (constants)
- **Export:** `en`
- **Server-only:** ❌ Não
- **Descrição:** Mensagens em inglês

### lib/i18n/index.ts
- **Tipo:** Barrel export
- **Export:** `pt`, `en`, `type Messages`, `I18nProvider`, `useI18n`
- **Server-only:** N/A
- **Descrição:** Re-exports de i18n

### lib/mocks/airports.ts
- **Tipo:** Data (constants)
- **Export:** `getAirportByCode`, `AIRPORTS` (não exportado)
- **Server-only:** ❌ Não
- **Descrição:** Lista de aeroportos mock

### lib/mocks/costOfLiving.ts
- **Tipo:** Data (constants)
- **Export:** Não usado
- **Server-only:** ❌ Não
- **Descrição:** Dados de custo de vida (não usado)

### lib/mocks/flights.ts
- **Tipo:** Data (utilities)
- **Export:** `getMockFlights`, `getFlightById`, `formatPrice`, `type FlightResult` (re-export)
- **Server-only:** ❌ Não
- **Descrição:** Voos mock, formatação de preço

### lib/mocks/opportunities.ts
- **Tipo:** Data (constants)
- **Export:** Não usado
- **Server-only:** ❌ Não
- **Descrição:** Oportunidades (não usado)

### lib/mocks/priceInsight.ts
- **Tipo:** Data (utilities)
- **Export:** `getPriceInsight`
- **Server-only:** ❌ Não
- **Descrição:** Insights de preço (mock)

### lib/mocks/routes.ts
- **Tipo:** Data (constants)
- **Export:** Não usado
- **Server-only:** ❌ Não
- **Descrição:** Rotas (não usado)

### lib/mocks/searchConfig.ts
- **Tipo:** Data (constants)
- **Export:** Não usado
- **Server-only:** ❌ Não
- **Descrição:** Configuração de busca (não usado)

### lib/mocks/searchStats.ts
- **Tipo:** Data (constants)
- **Export:** Não usado
- **Server-only:** ❌ Não
- **Descrição:** Estatísticas de busca (não usado)

### lib/mocks/index.ts
- **Tipo:** Barrel export
- **Export:** Re-exports de mocks usados
- **Server-only:** N/A
- **Descrição:** Re-exports de mocks

### lib/providers/Providers.tsx
- **Tipo:** Client Component (`"use client"`)
- **Export:** `Providers`
- **Server-only:** ❌ Não
- **Descrição:** Provider combinado (Theme + i18n)

### lib/providers/index.ts
- **Tipo:** Barrel export
- **Export:** `Providers`
- **Server-only:** N/A
- **Descrição:** Re-export de Providers

### lib/search/flightCache.ts
- **Tipo:** Server-only (mas pode ser usado em client se necessário)
- **Export:** `cacheFlights`, `getFlightFromCache`, `hasFlightInCache`, `getFlightCacheStats`
- **Server-only:** ⚠️ Usado apenas em server (mas não tem "server-only")
- **Descrição:** Cache em memória de voos individuais

### lib/search/mockSearch.ts
- **Tipo:** Client/Server (utilities)
- **Export:** `mockSearch`, `type SearchResult`, `type FlightResult` (re-export)
- **Server-only:** ❌ Não
- **Descrição:** Função de busca mock com delay

### lib/search/searchFlights.ts
- **Tipo:** Client (browser-only)
- **Export:** `searchFlights`, `checkAmadeusStatus`
- **Server-only:** ❌ Não (usa `fetch`)
- **Descrição:** Cliente para chamar `/api/flights/search`

### lib/search/types.ts
- **Tipo:** Types only
- **Export:** `type *` (todos os tipos de busca)
- **Server-only:** N/A (types)
- **Descrição:** Tipos canônicos de busca e voos

### lib/types/search.ts
- **Tipo:** Types only (deprecated)
- **Export:** Re-exports de `@/lib/search/types` (deprecated)
- **Server-only:** N/A (types)
- **Descrição:** Re-exports deprecated, usar `@/lib/search/types` diretamente

### lib/utils/bestOffer.ts
- **Tipo:** Utilities (pure functions)
- **Export:** `parseDurationToMinutes`, `calculateScore`, `findBestOffer`, `calculateAveragePrice`, `calculatePriceDifference`, `getBestOfferInfo`
- **Server-only:** ❌ Não
- **Descrição:** Lógica para determinar melhor oferta

### lib/utils/savedSearches.ts
- **Tipo:** Client (browser-only)
- **Export:** `getSavedSearches`, `isSearchSaved`, `saveSearch`, `removeSearch`, `clearAllSearches`, `type SavedSearch`
- **Server-only:** ❌ Não (usa `localStorage`)
- **Descrição:** Gerenciamento de buscas salvas (localStorage)

### lib/utils/searchParams.ts
- **Tipo:** Utilities (pure functions)
- **Export:** `parseSearchParams`, `normalizeSearchState`, `serializeSearchState`
- **Server-only:** ❌ Não
- **Descrição:** Parser e serializador de SearchState ↔ URL params

---

## scripts/

### scripts/check-amadeus-security.sh
- **Tipo:** Shell script
- **Export:** N/A
- **Server-only:** N/A
- **Descrição:** Script de verificação de segurança Amadeus (secrets no client)

### scripts/test-api.ts
- **Tipo:** TypeScript (não usado)
- **Export:** N/A
- **Server-only:** N/A
- **Descrição:** Script de teste de API (não usado)

---

## Config Files

### package.json
- **Tipo:** Config
- **Descrição:** Dependências, scripts, metadata

### tsconfig.json
- **Tipo:** Config
- **Descrição:** Configuração TypeScript (strict mode, paths)

### next.config.ts
- **Tipo:** Config
- **Descrição:** Configuração Next.js (vazio, padrão)

### eslint.config.mjs
- **Tipo:** Config
- **Descrição:** Configuração ESLint

### postcss.config.mjs
- **Tipo:** Config
- **Descrição:** Configuração PostCSS (Tailwind)

### env.example
- **Tipo:** Config (template)
- **Descrição:** Template de variáveis de ambiente

---

## Observações

### Arquivos Não Usados (Dead Code)
- `components/search/*` - componentes antigos, usar `components/searchbar/*`
- `components/ui/FloatingPopover.tsx` - não usado
- `components/ui/Portal.tsx` - não usado (usar React Portal)
- `components/ui/SearchForm.tsx` - não usado (usar SearchBar)
- `components/searchbar/DatePopover.tsx` - não usado (usar CalendarPopover)
- `components/searchbar/TripTypePopover.tsx` - não usado (usar select nativo)
- `components/searchbar/TripTypeSelect.tsx` - não usado (usar select nativo)
- `components/searchbar/Segment.tsx` - não usado
- `lib/mocks/costOfLiving.ts` - não usado
- `lib/mocks/opportunities.ts` - não usado
- `lib/mocks/routes.ts` - não usado
- `lib/mocks/searchConfig.ts` - não usado
- `lib/mocks/searchStats.ts` - não usado
- `scripts/test-api.ts` - não usado

### Server-Only Modules
Todos os módulos em `lib/amadeus/` são server-only (importam `"server-only"`):
- `auth.ts`
- `client.ts`
- `config.ts`
- `flights.ts`

### Client-Only Modules
Módulos que usam APIs do browser:
- `lib/analytics/tracking.ts` - usa `window`
- `lib/utils/savedSearches.ts` - usa `localStorage`
- `lib/search/searchFlights.ts` - usa `fetch` (mas pode ser usado em server também)

---

**Fim do Inventário**

