# Arquitetura do Projeto navo.live

**Versão:** 1.0  
**Data:** 2025-01-XX  
**Mantido por:** Tech Lead

---

## 1. Visão Geral

### 1.1 O que é o produto

navo.live é uma plataforma web para comparação de preços de passagens aéreas, focada no mercado brasileiro. O produto permite que usuários busquem voos, comparem ofertas e recebam insights sobre preços, sem criar urgência artificial ou pressão de compra. A plataforma é minimalista, prioriza transparência e oferece uma experiência fluida de busca e comparação.

**Stack Principal:**
- **Framework:** Next.js 16 (App Router)
- **React:** 19.2.3
- **Styling:** Tailwind CSS 4
- **TypeScript:** Strict mode
- **i18n:** Sistema customizado (pt/en)
- **Integração:** Amadeus Self-Service API (via feature flag `USE_AMADEUS`)

### 1.2 Fluxo Principal de Usuário

```
Home (/) 
  → Busca (SearchBar)
    → /resultados?from=GRU&to=LIS&depart=2025-03-15
      → Lista de voos (FlightCard[])
        → /voos/[id]?from=GRU&to=LIS&depart=2025-03-15
          → Detalhes do voo + parceiros (placeholder)
```

**Fluxo de Dados:**
1. Usuário preenche formulário na home (`app/page.tsx`)
2. Estado é serializado em query params e navega para `/resultados`
3. Página de resultados (`app/resultados/page.tsx`) chama `/api/flights/search`
4. API route valida, cacheia (5min), e chama Amadeus (se `USE_AMADEUS=true`) ou retorna mock
5. Resultados são renderizados em `FlightCard[]` com filtros (melhor/preço/duração)
6. Ao clicar em um voo, navega para `/voos/[id]` com query params preservados
7. Página de detalhes (`app/voos/[id]/page.tsx`) busca voo via `/api/flights/[id]`
8. Cache de voos individuais (10min) ou re-fetch se cache miss

### 1.3 Principais Restrições e Princípios

**Design:**
- Minimalista: sem urgência falsa, sem contadores de "pessoas vendo"
- Transparente: preços claros, sem taxas escondidas
- Acessível: WCAG AA, suporte a dark mode, i18n (pt/en)
- Responsivo: mobile-first, breakpoints sm/md/lg

**Técnico:**
- TypeScript strict: zero `any`, tipos explícitos
- Server-only para secrets: Amadeus nunca no client
- Feature flag `USE_AMADEUS` para rollout gradual
- Cache em memória (server-side): 5min para buscas, 10min para voos individuais
- Fallback automático: mock se Amadeus desabilitado ou erro

---

## 2. Mapa de Rotas (App Router)

### 2.1 Rotas Públicas (Pages)

#### `/` - Home Page
- **Arquivo:** `app/page.tsx`
- **Tipo:** Client Component (`"use client"`)
- **Props:** Nenhuma
- **Estado:** 
  - `showEditModal` (boolean) - controla modal de edição
  - `initialState` (SearchState) - parseado de URL params
- **Dependências:**
  - `@/components/searchbar/SearchBar`
  - `@/components/ui/SearchModal`
  - `@/components/layout/Header`, `Footer`
  - `@/lib/utils/searchParams` (parse, normalize, serialize)
- **Comportamento:**
  - Se houver query params na URL, mostra botão "editar" e pré-preenche SearchBar
  - Ao buscar, serializa estado e navega para `/resultados?{params}`
  - Não renderiza resultados (separação de responsabilidades)

#### `/resultados` - Results Page
- **Arquivo:** `app/resultados/page.tsx`
- **Tipo:** Client Component (`"use client"`)
- **Props:** Nenhuma
- **Estado:**
  - `isLoading` (boolean)
  - `results` (FlightResult[])
  - `error` (string | null)
  - `activeFilter` ("best" | "price" | "duration")
  - `isSaved` (boolean) - busca salva no localStorage
- **Dependências:**
  - `@/lib/search/searchFlights` - chama `/api/flights/search`
  - `@/lib/search/mockSearch` - fallback se Amadeus desabilitado
  - `@/lib/utils/bestOffer` - cálculo de melhor oferta
  - `@/lib/utils/savedSearches` - persistência de buscas
- **Comportamento:**
  - Parse de query params → SearchState
  - Chama `searchFlights()` que faz fetch para `/api/flights/search`
  - Se `AMADEUS_DISABLED`, usa `mockSearch()` como fallback
  - Ordena resultados baseado em `activeFilter`
  - Calcula "melhor oferta" usando score (preço 60% + duração 40%)
  - Permite salvar busca no localStorage
  - Flags de teste: `?_empty=1` ou `?_error=1` para forçar estados

#### `/voos/[id]` - Flight Detail Page
- **Arquivo:** `app/voos/[id]/page.tsx` (wrapper) + `FlightDetailContent.tsx` (lógica)
- **Tipo:** Client Component (`"use client"`)
- **Props:** `params.id` (string) - ID do voo
- **Estado:**
  - `isLoading` (boolean)
  - `flight` (FlightResult | null)
  - `partnerPrices` (array) - preços de parceiros (mock)
  - `error` (string | null)
- **Dependências:**
  - `@/api/flights/[id]/route.ts` - busca voo por ID
  - `@/lib/search/flightCache` - cache de voos individuais
- **Comportamento:**
  - Chama `/api/flights/[id]?from=...&to=...&depart=...`
  - Se cache miss, API tenta re-fetch via `/api/flights/search` com search params
  - Se não encontrar, mostra "voo não encontrado"
  - **Problema atual:** Cache é em memória (server-side), então após restart ou cache expirado, voos não são encontrados. Solução: persistir cache ou sempre re-fetch com search params.

#### `/como-funciona` - How It Works
- **Arquivo:** `app/como-funciona/page.tsx`
- **Tipo:** Server Component (default)
- **Status:** Página estática, conteúdo básico

#### `/alertas` - Alerts Page
- **Arquivo:** `app/alertas/page.tsx`
- **Tipo:** Server Component (default)
- **Status:** Placeholder "em breve"

#### `/privacidade` - Privacy Policy
- **Arquivo:** `app/privacidade/page.tsx`
- **Tipo:** Server Component (default)

#### `/termos` - Terms of Service
- **Arquivo:** `app/termos/page.tsx`
- **Tipo:** Server Component (default)

### 2.2 API Routes (Route Handlers)

#### `GET /api/flights/search`
- **Arquivo:** `app/api/flights/search/route.ts`
- **Tipo:** Server-only (Route Handler)
- **Inputs (Query Params):**
  - `from` (required): IATA code (3 letras)
  - `to` (required): IATA code (3 letras)
  - `depart` (required): YYYY-MM-DD
  - `return` (optional): YYYY-MM-DD
  - `adults` (optional, default: 1): 1-9
  - `cabin` (optional): ECONOMY|PREMIUM_ECONOMY|BUSINESS|FIRST
  - `nonStop` (optional): true|false
  - `max` (optional, default: 20): 1-50
  - `currency` (optional, default: BRL)
- **Outputs:**
  - **200 OK:** `SearchResponse` (flights[], source, meta)
  - **400 Bad Request:** `SearchError` (VALIDATION_ERROR)
  - **502 Bad Gateway:** `SearchError` (erro Amadeus)
  - **503 Service Unavailable:** `SearchError` (AMADEUS_DISABLED)
- **Dependências:**
  - `@/lib/amadeus/client` - `amadeusFetch<T>`
  - `@/lib/amadeus/mappers` - `mapFlightOffersToSearchResponse`
  - `@/lib/search/flightCache` - `cacheFlights()`
- **Comportamento:**
  1. Verifica `USE_AMADEUS` feature flag
  2. Valida query params (IATA regex, date format, ranges)
  3. Verifica cache em memória (TTL: 5min)
  4. Se cache hit, retorna com `meta.cached: true`
  5. Se cache miss e `USE_AMADEUS=true`:
     - Chama `amadeusFetch<AmadeusFlightOffersResponse>("/v2/shopping/flight-offers", {...})`
     - Mapeia resposta para `SearchResponse` via `mapFlightOffersToSearchResponse()`
     - Cacheia resultado (search-level) e voos individuais (flight-level)
     - Retorna `SearchResponse`
  6. Se `USE_AMADEUS=false`, retorna 503 com `AMADEUS_DISABLED`
- **Cache:**
  - Implementação: `Map<string, CacheEntry>` em memória
  - Key: JSON serializado dos params (minificado)
  - TTL: 5 minutos
  - Limpeza: automática ao verificar expiração

#### `GET /api/flights/[id]`
- **Arquivo:** `app/api/flights/[id]/route.ts`
- **Tipo:** Server-only (Route Handler)
- **Inputs:**
  - `params.id` (string) - ID do voo (ex: "amadeus-123" ou "flight-1")
  - Query params (opcional, para re-fetch):
    - `from`, `to`, `depart`, `return`
- **Outputs:**
  - **200 OK:** `FlightDetailResponse` (flight, source: "cache" | "refetch")
  - **400 Bad Request:** `SearchError` (INVALID_ID)
  - **404 Not Found:** `SearchError` (FLIGHT_NOT_FOUND)
- **Dependências:**
  - `@/lib/search/flightCache` - `getFlightFromCache(id)`
  - `/api/flights/search` - re-fetch se cache miss
- **Comportamento:**
  1. Busca voo no cache via `getFlightFromCache(id)`
  2. Se encontrado, retorna com `source: "cache"`
  3. Se cache miss e houver search params (`from`, `to`, `depart`):
     - Chama `/api/flights/search` internamente com search params
     - Procura voo por ID na lista retornada
     - Se encontrado, retorna com `source: "refetch"`
  4. Se não encontrado, retorna 404
- **Problema:** Cache é em memória, então após restart do servidor ou expiração, voos não são encontrados. Depende de search params na URL para re-fetch.

### 2.3 Layout Root

#### `app/layout.tsx`
- **Tipo:** Server Component (default)
- **Props:** `children` (ReactNode)
- **Dependências:**
  - `@/lib/providers/Providers` - ThemeProvider + I18nProvider
  - `@/components/analytics/GoogleAnalytics`
- **Comportamento:**
  - Define metadata (title, description, OG tags)
  - Carrega fonte DM Sans
  - Renderiza `Providers` (theme + i18n)
  - Portal root para modais (`#overlay-root`)
  - Google Analytics 4

---

## 3. Árvore de Componentes (UI)

### 3.1 Componentes Core

#### `SearchBar` (components/searchbar/SearchBar.tsx)
- **Tipo:** Organism (componente complexo)
- **Props:**
  - `initialState?: Partial<SearchState>`
  - `onSearch?: (state: SearchState) => void`
  - `mode?: "default" | "compact"`
- **Estado:**
  - `state` (SearchState) - estado interno do formulário
  - `paxOpen` (boolean) - popover de passageiros
- **Eventos:**
  - `handleTripTypeChange` - muda tripType (oneway/roundtrip)
  - `handleFromChange`, `handleToChange` - seleção de aeroportos
  - `handleSwap` - inverte origem/destino
  - `handleDatesApply` - aplica datas do calendário
  - `handlePaxApply` - aplica passageiros/classe
  - `handleSubmit` - normaliza estado e navega ou chama `onSearch`
- **Dependências:**
  - `@/components/searchbar/AirportField`
  - `@/components/searchbar/DateField`
  - `@/components/searchbar/PaxClassPopover`
  - `@/lib/utils/searchParams` (normalize, serialize)
- **Observações:**
  - Layout responsivo: mobile empilhado, desktop grid
  - Validação: `isValid` verifica campos obrigatórios
  - Normaliza estado antes de submeter

#### `FlightCard` (components/flights/FlightCard.tsx)
- **Tipo:** Molecule (componente reutilizável)
- **Props:**
  - `flight` (FlightResult) - dados do voo
  - `onClick: () => void` - callback ao clicar
  - `isBestOffer?: boolean` - se é a melhor oferta
  - `bestOfferInfo?: { explanation, priceDifference }` - info da melhor oferta
  - `searchState?: SearchState` - para calcular price insight
- **Estado:**
  - `showTooltip` (boolean) - tooltip da melhor oferta
- **Dependências:**
  - `@/components/flights/AirlineLogo`
  - `@/components/price/PriceInsightBadge`
  - `@/lib/mocks/priceInsight` - `getPriceInsight()`
- **Observações:**
  - Layout: companhia | itinerário (linha) | preço + CTA
  - Mostra badge "melhor oferta" se `isBestOffer=true`
  - Calcula price insight se `searchState` fornecido
  - Responsivo: mobile empilhado, desktop grid

#### `SearchModal` (components/ui/SearchModal.tsx)
- **Tipo:** Organism (modal complexo)
- **Props:**
  - `isOpen: boolean`
  - `onClose: () => void`
  - `initialState?: Partial<SearchState>`
  - `onSearch: (state: SearchState) => void`
- **Dependências:**
  - `@/components/searchbar/SearchBar` (mode="compact")
  - `@/components/ui/Portal` - renderização em `#overlay-root`
- **Observações:**
  - Overlay com backdrop blur
  - Fecha ao clicar fora ou ESC
  - Usa `SearchBar` em modo compacto

#### `ResultsFilters` (components/results/ResultsFilters.tsx)
- **Tipo:** Molecule
- **Props:**
  - `activeFilter: FilterType` ("best" | "price" | "duration")
  - `onFilterChange: (filter: FilterType) => void`
- **Comportamento:**
  - Botões de filtro: "melhor", "preço", "duração"
  - Atualiza ordenação na página de resultados

### 3.2 Componentes de Layout

#### `Header` (components/layout/Header.tsx)
- **Tipo:** Organism
- **Props:** Nenhuma
- **Dependências:**
  - `@/components/brand/LogoMark`, `Wordmark`
  - `@/components/layout/LanguageToggle`, `ThemeToggle`
- **Comportamento:**
  - Logo + links (alertas, como funciona)
  - Toggles de idioma e tema (desktop)

#### `Footer` (components/layout/Footer.tsx)
- **Tipo:** Organism
- **Props:** Nenhuma
- **Comportamento:**
  - Links: termos, privacidade, contato
  - Disclaimer sobre preços

#### `BackgroundWaves` (components/ui/BackgroundWaves.tsx)
- **Tipo:** Atom (componente visual)
- **Props:** Nenhuma
- **Comportamento:**
  - SVG animado de ondas (background)
  - Animação CSS (`@keyframes wavesBack`, `wavesFront`)

### 3.3 Componentes de Formulário

#### `AirportField` (components/searchbar/AirportField.tsx)
- **Tipo:** Molecule
- **Props:**
  - `label: string`
  - `icon: ReactNode`
  - `value: Airport | null`
  - `onChange: (airport: Airport) => void`
  - `exclude?: string` - código IATA a excluir (evita origem = destino)
  - `placeholder: string`
- **Dependências:**
  - `@/components/searchbar/AirportPopover` - autocomplete de aeroportos
  - `@/lib/mocks/airports` - lista de aeroportos
- **Comportamento:**
  - Campo de texto com popover de autocomplete
  - Filtra aeroportos por código/cidade
  - Exclui aeroporto oposto (from/to)

#### `DateField` (components/searchbar/DateField.tsx)
- **Tipo:** Molecule
- **Props:**
  - `label: string`
  - `icon: ReactNode`
  - `departDate: string | null`
  - `returnDate: string | null`
  - `onApply: (depart: string | null, return: string | null) => void`
  - `isRoundtrip: boolean`
  - `focusField: "depart" | "return"`
  - `disabled?: boolean`
- **Dependências:**
  - `@/components/searchbar/CalendarPopover` - calendário
- **Comportamento:**
  - Campo de data com popover de calendário
  - Suporta ida e volta (se `isRoundtrip=true`)

### 3.4 Component Graph

**Hierarquia de Componentes:**

```
RootLayout
  └── Providers (Theme + i18n)
      ├── Home (/)
      │   ├── Header
      │   ├── BackgroundWaves
      │   ├── SearchBar
      │   │   ├── AirportField → AirportPopover
      │   │   ├── DateField → CalendarPopover
      │   │   └── PaxClassPopover
      │   ├── OpportunitiesSection
      │   └── Footer
      │
      ├── Results (/resultados)
      │   ├── Header (sticky)
      │   ├── BackgroundWaves
      │   ├── ResultsFilters
      │   ├── FlightCard[] (sorted)
      │   │   └── AirlineLogo
      │   │   └── PriceInsightBadge
      │   └── SearchModal (edit)
      │
      └── FlightDetail (/voos/[id])
          ├── Header (sticky)
          ├── BackgroundWaves
          ├── FlightDetailContent
          │   ├── AirlineLogo
          │   ├── PriceInsightBadge
          │   └── PartnerLogo[] (placeholder)
          └── Footer
```

**Componentes Core (mais importantes):**
1. `SearchBar` - formulário principal de busca
2. `FlightCard` - card de voo na lista de resultados
3. `SearchModal` - modal de edição de busca
4. `ResultsFilters` - filtros de ordenação

**Duplicação de Lógica:**
- ❌ **Nenhuma duplicação crítica encontrada**
- ✅ Tipos centralizados em `@/lib/search/types`
- ✅ Utils reutilizáveis (`searchParams`, `bestOffer`)

**Acoplamento:**
- ⚠️ `FlightCard` depende de `getPriceInsight()` (mock) - poderia ser injetado
- ⚠️ `SearchBar` acoplado a `normalizeSearchState()` - mas é intencional (single source of truth)
- ✅ Componentes de UI são desacoplados (props bem definidas)

---

## 4. Domínio e Tipos (Modelos)

### 4.1 Tipos Principais

#### `SearchState` (lib/search/types.ts)
```typescript
interface SearchState {
  tripType: "roundtrip" | "oneway";
  from: Airport | null;
  to: Airport | null;
  departDate: string | null; // YYYY-MM-DD
  returnDate: string | null; // YYYY-MM-DD
  pax: { adults: number; children: number; infants: number };
  cabinClass: "economy" | "premium_economy" | "business" | "first";
}
```
- **Uso:** Estado do formulário de busca, serializado em URL params
- **Normalização:** `normalizeSearchState()` garante valores válidos
- **Serialização:** `serializeSearchState()` → query string

#### `FlightResult` (lib/search/types.ts)
```typescript
interface FlightResult {
  id: string; // "amadeus-{id}" ou "flight-{id}"
  airline: string; // lowercase: "latam", "tap"
  airlineCode: string; // IATA: "LA", "TP"
  departure: string; // "22:30"
  arrival: string; // "11:15"
  duration: string; // "10h 45min"
  stops: string; // "direto" | "1 escala" | "2 escalas"
  stopsCities?: string[]; // ["Lisboa", "Madrid"]
  price: number; // BRL, integer
  offersCount: number;
  co2?: string; // "-12% CO₂" | "+8% CO₂"
  nextDayArrival?: boolean;
}
```
- **Uso:** Formato canônico para renderização na UI
- **Fonte:** Mapeado de Amadeus ou mock
- **Transformação:** `mapFlightOffersToSearchResponse()` (Amadeus) ou `getMockFlights()` (mock)

#### `SearchResponse` (lib/search/types.ts)
```typescript
interface SearchResponse {
  flights: FlightResult[];
  source: "amadeus" | "mock";
  meta: {
    count: number;
    durationMs: number;
    cached?: boolean;
    warning?: string;
  };
}
```
- **Uso:** Resposta da API `/api/flights/search`
- **Fonte:** Amadeus (se `USE_AMADEUS=true`) ou mock

#### `SearchError` (lib/search/types.ts)
```typescript
interface SearchError {
  code: string; // "VALIDATION_ERROR" | "AMADEUS_DISABLED" | "FLIGHT_NOT_FOUND"
  message: string;
  errors?: Array<{ field: string; message: string }>;
  details?: unknown;
  requestId?: string;
}
```
- **Uso:** Erros da API

### 4.2 Tipos Amadeus

#### `AmadeusFlightOffersResponse` (lib/amadeus/types.ts)
- **Fonte:** API Amadeus `/v2/shopping/flight-offers`
- **Mapeamento:** `mapFlightOffersToSearchResponse()` → `SearchResponse`

#### `AmadeusFlightOffer` (lib/amadeus/types.ts)
- **Estrutura:** Complexa (itineraries[], segments[], price, etc.)
- **Mapeamento:** `mapOfferToFlightResult()` → `FlightResult`

### 4.3 Onde são Transformados

**Amadeus → FlightResult:**
- `lib/amadeus/mappers/flightOffersToSearchResponse.ts`
  - `mapFlightOffersToSearchResponse()` - mapeia array completo
  - `mapOfferToFlightResult()` - mapeia oferta individual
  - Helpers: `parseIsoDuration()`, `formatTime()`, `getStopsInfo()`

**Mock → FlightResult:**
- `lib/mocks/flights.ts`
  - `getMockFlights(searchState)` - gera voos mock baseado em SearchState
  - `getFlightById(id)` - busca voo mock por ID

**SearchState ↔ URL Params:**
- `lib/utils/searchParams.ts`
  - `parseSearchParams()` - URL → SearchState
  - `serializeSearchState()` - SearchState → URL
  - `normalizeSearchState()` - valida e aplica defaults

### 4.4 Divergências entre Mock e Amadeus

**Mock:**
- IDs fixos: "flight-1", "flight-2", ...
- Preços fixos (com multiplicador baseado em rota)
- Sem CO2 (exceto alguns hardcoded)
- Sem validação de datas reais

**Amadeus:**
- IDs dinâmicos: "amadeus-{id}"
- Preços reais da API
- CO2 calculado de `segment.co2Emissions[]`
- Validação de datas e rotas reais

**Normalização:**
- Ambos mapeiam para `FlightResult` (formato canônico)
- UI não diferencia origem (mock vs Amadeus)

---

## 5. Camada de Dados

### 5.1 Mocks

**Localização:** `lib/mocks/`

**Arquivos:**
- `flights.ts` - voos mock (`getMockFlights()`, `getFlightById()`)
- `airports.ts` - lista de aeroportos (`getAirportByCode()`)
- `priceInsight.ts` - insights de preço (`getPriceInsight()`)
- `costOfLiving.ts` - custo de vida (não usado atualmente)
- `opportunities.ts` - oportunidades (não usado atualmente)
- `routes.ts` - rotas (não usado atualmente)
- `searchConfig.ts` - configuração de busca (não usado atualmente)
- `searchStats.ts` - estatísticas (não usado atualmente)

**Como são Usados:**
- `mockSearch()` (`lib/search/mockSearch.ts`) chama `getMockFlights(searchState)`
- Fallback automático se `USE_AMADEUS=false` ou erro Amadeus
- Flags de teste: `?_empty=1` ou `?_error=1` forçam estados vazios/erro

**Fallback Rules:**
1. Se `USE_AMADEUS !== "true"` → mock
2. Se erro Amadeus em dev → mock (com `console.warn`)
3. Se erro Amadeus em prod → propaga erro
4. Se `AMADEUS_DISABLED` → mock (client-side)

### 5.2 Amadeus

#### Configuração (`lib/amadeus/config.ts`)
- **Env Vars:**
  - `AMADEUS_BASE_URL` (default: `https://test.api.amadeus.com`)
  - `AMADEUS_CLIENT_ID` (obrigatório)
  - `AMADEUS_CLIENT_SECRET` (obrigatório)
- **Funções:**
  - `getAmadeusConfig()` - retorna config completo (throws se faltar)
  - `isAmadeusConfigured()` - verifica se todas as vars estão setadas
  - `getAmadeusBaseUrl()` - retorna base URL

#### Autenticação (`lib/amadeus/auth.ts`)
- **OAuth2 Flow:**
  - Endpoint: `/v1/security/oauth2/token`
  - Grant type: `client_credentials`
  - Token cache: em memória (`cachedToken`)
  - Refresh buffer: 5 minutos antes de expirar
- **Funções:**
  - `getAccessToken()` - retorna token válido (cache ou fetch novo)
  - `clearTokenCache()` - limpa cache (útil para testes)
  - `hasValidToken()` - verifica se há token válido
- **Thread Safety:**
  - `tokenFetchPromise` evita múltiplas requisições simultâneas

#### Cliente HTTP (`lib/amadeus/client.ts`)
- **Função Principal:** `amadeusFetch<T>(path, options)`
- **Features:**
  - Timeout: 10s (configurável via `timeoutMs`)
  - Retry: 2 tentativas (total 3) para 429 e 5xx
  - Backoff: 200ms, 500ms
  - Error handling: `AmadeusError` normalizado
  - Request ID: gerado automaticamente para tracing
- **Headers:**
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`
  - `Accept: application/json`
  - `X-Request-Id: {requestId}`

#### Flight Offers Search (`lib/amadeus/flights.ts`)
- **Função:** `searchFlightsAmadeus(searchState: SearchState)`
- **Endpoint:** `/v2/shopping/flight-offers`
- **Mapeamento:** `mapFlightOffersToSearchResponse()` → `SearchResponse`
- **Logs:** Dev-only (`console.log`)

### 5.3 API Routes

#### `/api/flights/search` (`app/api/flights/search/route.ts`)
- **Validação:**
  - IATA codes: regex `/^[A-Z]{3}$/`
  - Dates: formato `YYYY-MM-DD` + validação de data válida
  - Adults: 1-9
  - Cabin: enum válido
  - Max: 1-50
- **Cache:**
  - Implementação: `Map<string, CacheEntry>` em memória
  - Key: JSON serializado dos params (minificado)
  - TTL: 5 minutos
  - Limpeza: automática ao verificar expiração
- **Códigos de Erro:**
  - `VALIDATION_ERROR` (400) - params inválidos
  - `AMADEUS_DISABLED` (503) - feature flag desabilitada
  - `HTTP_{status}` (502) - erro Amadeus
  - `TIMEOUT` (408) - timeout na requisição
  - `NETWORK_ERROR` (0) - erro de rede
  - `INTERNAL_ERROR` (502) - erro inesperado

#### `/api/flights/[id]` (`app/api/flights/[id]/route.ts`)
- **Cache:**
  - Implementação: `lib/search/flightCache.ts` (Map em memória)
  - TTL: 10 minutos (mais longo que search cache)
  - Max entries: 500 (limpeza automática)
  - Search context: armazena params da busca para re-fetch
- **Re-fetch:**
  - Se cache miss e houver search params, chama `/api/flights/search` internamente
  - Procura voo por ID na lista retornada
  - Se encontrado, retorna com `source: "refetch"`

### 5.4 Cache

**Implementação:**
- **Search Cache:** `Map<string, CacheEntry>` em `app/api/flights/search/route.ts`
- **Flight Cache:** `Map<string, CacheEntry>` em `lib/search/flightCache.ts`
- **Token Cache:** variável global em `lib/amadeus/auth.ts`

**TTL:**
- Search: 5 minutos
- Flight: 10 minutos
- Token: conforme `expires_in` da API (menos 5min de buffer)

**Invalidação:**
- Automática: verifica `expiresAtMs` ao acessar
- Manual: `clearTokenCache()` (token), limpeza de entries expiradas (search/flight)

**Problemas:**
- ⚠️ Cache é em memória: perde dados após restart do servidor
- ⚠️ Não compartilhado entre instâncias (serverless)
- ⚠️ Flight cache depende de search params para re-fetch (fragilidade)

### 5.5 Diagramas de Fluxo

#### Fluxo: UI → API → Amadeus → UI

```
[Home/Results Page]
  ↓ (user submits search)
[SearchBar] → serializeSearchState()
  ↓ (navigate to /resultados?from=GRU&to=LIS&depart=2025-03-15)
[Results Page] → searchFlights(searchState)
  ↓ (fetch)
[GET /api/flights/search?from=GRU&to=LIS&depart=2025-03-15]
  ↓
[Check USE_AMADEUS flag]
  ├─ false → return 503 (AMADEUS_DISABLED)
  └─ true → continue
  ↓
[Check cache (5min TTL)]
  ├─ hit → return cached SearchResponse
  └─ miss → continue
  ↓
[amadeusFetch("/v2/shopping/flight-offers", {...})]
  ↓
[getAccessToken()]
  ├─ cache hit → return token
  └─ cache miss → POST /v1/security/oauth2/token
  ↓
[GET /v2/shopping/flight-offers?originLocationCode=GRU&...]
  ↓
[mapFlightOffersToSearchResponse()]
  ↓
[Cache result + individual flights]
  ↓
[Return SearchResponse]
  ↓
[Results Page] → render FlightCard[]
```

#### Fluxo: UI → /voos/[id] → (qual fonte?) → UI

```
[Results Page] → user clicks FlightCard
  ↓ (navigate to /voos/amadeus-123?from=GRU&to=LIS&depart=2025-03-15)
[FlightDetail Page] → fetchFlight()
  ↓ (fetch)
[GET /api/flights/amadeus-123?from=GRU&to=LIS&depart=2025-03-15]
  ↓
[getFlightFromCache("amadeus-123")]
  ├─ hit → return cached FlightResult
  └─ miss → continue
  ↓
[Check search params (from, to, depart)]
  ├─ missing → return 404 (FLIGHT_NOT_FOUND)
  └─ present → continue
  ↓
[Internal fetch to /api/flights/search?from=GRU&to=LIS&depart=2025-03-15]
  ↓
[Search returns FlightResult[]]
  ↓
[Find flight by ID in results]
  ├─ found → return FlightResult (source: "refetch")
  └─ not found → return 404
  ↓
[FlightDetail Page] → render flight details
```

**Por que /voos/[id] falha hoje:**
1. Cache é em memória: após restart, cache vazio
2. Se cache expirou (10min), voo não é encontrado
3. Re-fetch depende de search params na URL: se usuário acessar diretamente `/voos/amadeus-123` sem params, retorna 404
4. IDs de mock ("flight-1") não são cacheados (só Amadeus)

**Soluções possíveis:**
1. **Persistir cache:** Redis ou database para cache compartilhado
2. **Sempre re-fetch:** Se cache miss, sempre fazer nova busca (sem depender de search params)
3. **Store flight ID + search params:** Ao navegar para detalhes, salvar search params no sessionStorage/localStorage

---

## 6. Estado, URL Sync e Navegação

### 6.1 Fonte da Verdade

**SearchState:**
- **Fonte:** URL query params (`?from=GRU&to=LIS&depart=2025-03-15`)
- **Parser:** `parseSearchParams()` em `lib/utils/searchParams.ts`
- **Normalização:** `normalizeSearchState()` garante valores válidos
- **Serialização:** `serializeSearchState()` → query string

**Fluxo:**
1. Usuário preenche formulário → `SearchState` interno
2. Ao submeter → `normalizeSearchState()` → `serializeSearchState()` → URL
3. Navegação para `/resultados?{params}`
4. Página de resultados → `parseSearchParams()` → `normalizeSearchState()` → `SearchState`
5. Busca usa `SearchState` normalizado

### 6.2 Hooks e Helpers

**Hooks:**
- `useSearchParams()` (Next.js) - lê query params
- `useRouter()` (Next.js) - navegação
- `useI18n()` (custom) - i18n
- `useState()` - estado local de componentes

**Helpers:**
- `parseSearchParams()` - URL → SearchState
- `normalizeSearchState()` - valida e aplica defaults
- `serializeSearchState()` - SearchState → URL
- `getAirportByCode()` - busca aeroporto por código

### 6.3 "Editar Busca"

**Home (`app/page.tsx`):**
- Se houver query params, mostra botão "editar"
- Abre `SearchModal` com `initialState` parseado da URL
- Ao salvar, navega para `/resultados?{newParams}`

**Results (`app/resultados/page.tsx`):**
- Botão "editar" no header
- Abre `SearchModal` com `initialState` atual
- Ao salvar, usa `router.replace()` (não push) para atualizar URL e re-buscar

### 6.4 Preservação de Busca (Back)

**Navegação:**
- Home → Results: query params preservados na URL
- Results → FlightDetail: query params preservados (`/voos/[id]?from=...&to=...`)
- FlightDetail → Results: `backUrl` preserva query params (`/resultados?from=...&to=...`)

**Implementação:**
- `FlightDetailContent.tsx` (linha 66-68):
  ```typescript
  const backUrl = searchParams.toString() 
    ? `/resultados?${searchParams.toString()}`
    : "/resultados";
  ```

### 6.5 Inconsistências

**Problemas:**
1. ⚠️ **Duplicação de useEffect:** `app/resultados/page.tsx` tem `useEffect` duplicado (linhas 247-251 e 254-258) - ambos verificam se busca está salva
2. ⚠️ **SearchState não sincronizado:** Se usuário editar busca e não submeter, estado interno não reflete URL
3. ✅ **URL é source of truth:** Correto - URL sempre reflete estado atual

---

## 7. i18n e Tema

### 7.1 i18n Custom

**Estrutura:**
- **Provider:** `lib/i18n/I18nProvider.tsx`
- **Messages:** `lib/i18n/messages/pt.ts`, `en.ts`
- **Hook:** `useI18n()` retorna `{ locale, t, setLocale }`

**Chaves:**
- Estrutura aninhada: `t.home.headline`, `t.search.from`, `t.results.edit`
- Tipo: `Messages` interface em `lib/i18n/messages/pt.ts`

**Fallback:**
- Default: `pt` (português)
- Storage: `localStorage.getItem("navo-locale")`
- SSR: sempre renderiza `pt` inicialmente, depois hidrata com locale salvo

**Uso:**
```typescript
const { t, locale } = useI18n();
// t.home.headline → "para onde você quer ir?"
// locale → "pt" | "en"
```

**Problemas:**
- ⚠️ **SSR mismatch:** Se locale salvo for `en`, SSR renderiza `pt` e depois muda para `en` (flash)
- ✅ **Solução atual:** `mounted` state evita renderizar até localStorage ser lido

### 7.2 Tema (Light/Dark)

**Implementação:**
- **Provider:** `next-themes` (`ThemeProvider`)
- **Toggle:** `components/layout/ThemeToggle.tsx`
- **CSS:** Variáveis CSS em `app/globals.css`

**CSS Variables:**
- Light mode (default): `:root { --cream: #fcf2ed; --ink: #3a3a3a; ... }`
- Dark mode: `:root.dark { --cream: #1a1a1f; --ink: #e8e8e8; ... }`
- Tailwind: usa `oklch(from var(--cream) l c h)` para cores dinâmicas

**Toggle:**
- Atributo: `class="dark"` no `<html>`
- Storage: `localStorage.getItem("theme")` (gerenciado por `next-themes`)
- System: `defaultTheme="system"` detecta preferência do OS

**Onde pode quebrar:**
- ⚠️ **SSR:** `next-themes` usa `suppressHydrationWarning` no `<html>` para evitar mismatch
- ✅ **CSS vars:** Funcionam em SSR e CSR (sem flash)

---

## 8. Observabilidade e Qualidade

### 8.1 Logs

**Dev-only:**
- `lib/amadeus/client.ts`: `logRequest()` - logs requests Amadeus (requestId, path, status, duration)
- `lib/amadeus/auth.ts`: `console.log` ao adquirir token
- `lib/amadeus/flights.ts`: `console.log` ao buscar voos
- `app/api/flights/search/route.ts`: `console.error` em erros inesperados

**Produção:**
- Apenas erros críticos (`console.error`)
- Sem logs de debug

**Onde aparecem:**
- Server: terminal/stdout (Vercel logs)
- Client: DevTools Console (apenas em dev)

### 8.2 Scripts

**package.json:**
- `dev`: `next dev` - desenvolvimento
- `build`: `next build` - build de produção
- `start`: `next start` - servidor de produção
- `lint`: `eslint` - linting
- `check:amadeus`: `bash scripts/check-amadeus-security.sh` - verificação de segurança

### 8.3 Security Check

**Script:** `scripts/check-amadeus-security.sh`

**Verificações:**
1. `NEXT_PUBLIC_AMADEUS` não deve existir
2. `process.env.AMADEUS` não deve estar em componentes client
3. Referências a `AMADEUS` em código client (apenas aviso)
4. `.env.local` no `.gitignore`

**Integração:**
- Comando: `npm run check:amadeus`
- Pode ser usado em pre-commit hook (futuro)

### 8.4 Checklist de Segurança (Resumo)

**✅ Implementado:**
- Secrets nunca no client (`server-only` imports)
- Feature flag `USE_AMADEUS` para controle
- Validação de inputs (IATA, dates, ranges)
- Script de verificação automática
- Documentação de segurança (`docs/SECURITY_CHECKLIST.md`)

**⚠️ Melhorias:**
- Pre-commit hook para verificação automática
- CI check para bloquear commits com secrets

### 8.5 Pontos de Melhoria (Priorizados)

**P0 (Crítico):**
1. **Cache persistente:** Redis ou database para cache compartilhado (resolve problema de `/voos/[id]`)
2. **Error tracking:** Sentry ou similar para erros em produção
3. **Rate limiting:** Proteger `/api/flights/search` de abuse

**P1 (Alto):**
4. **Testes:** Unit tests para mappers, utils, componentes
5. **E2E:** Playwright/Cypress para fluxos críticos
6. **Monitoring:** APM (Vercel Analytics ou Datadog)

**P2 (Médio):**
7. **Type safety:** Remover `any` restantes (se houver)
8. **Performance:** Lazy load de componentes pesados
9. **Acessibilidade:** Auditoria completa (axe-core)

---

## 9. Lista de Riscos e Débitos Técnicos

### R1: Cache em Memória (P0)

**Severidade:** P0  
**Sintoma:** `/voos/[id]` retorna 404 após restart do servidor ou cache expirado  
**Causa:** Cache é em memória (`Map`), não persiste entre restarts  
**Arquivos:**
- `app/api/flights/search/route.ts` (linha 60: `const cache = new Map(...)`)
- `lib/search/flightCache.ts` (linha 39: `const flightCache = new Map(...)`)

**Correção sugerida:**
- Opção 1: Redis para cache compartilhado
- Opção 2: Database (PostgreSQL) para cache persistente
- Opção 3: Re-fetch sempre se cache miss (sem depender de search params)

**Critério de aceite:**
- `/voos/[id]` funciona mesmo após restart
- Cache compartilhado entre instâncias (serverless)

### R2: Duplicação de useEffect (P2)

**Severidade:** P2  
**Sintoma:** Código duplicado, possível re-render desnecessário  
**Causa:** `useEffect` duplicado em `app/resultados/page.tsx` (linhas 247-251 e 254-258)  
**Arquivo:** `app/resultados/page.tsx`

**Correção sugerida:**
- Remover um dos `useEffect` duplicados
- Manter apenas um que verifica `isSearchSaved()`

**Critério de aceite:**
- Apenas um `useEffect` para verificar busca salva
- Funcionalidade preservada

### R3: Re-fetch depende de Search Params (P1)

**Severidade:** P1  
**Sintoma:** `/voos/[id]` sem search params retorna 404 mesmo se voo existe  
**Causa:** `app/api/flights/[id]/route.ts` só re-fetch se houver search params (linha 86)  
**Arquivo:** `app/api/flights/[id]/route.ts`

**Correção sugerida:**
- Opção 1: Sempre re-fetch se cache miss (sem depender de search params)
- Opção 2: Store search params no sessionStorage ao navegar para detalhes
- Opção 3: Incluir search params no ID do voo (ex: `amadeus-123-GRU-LIS-2025-03-15`)

**Critério de aceite:**
- `/voos/[id]` funciona mesmo sem search params (se voo existe)

### R4: SSR Mismatch em i18n (P2)

**Severidade:** P2  
**Sintoma:** Flash de conteúdo em português antes de mudar para inglês  
**Causa:** SSR sempre renderiza `pt`, depois hidrata com locale salvo  
**Arquivo:** `lib/i18n/I18nProvider.tsx` (linha 45-51)

**Correção sugerida:**
- Usar cookies para locale (acessível em SSR)
- Ou aceitar flash (já mitigado com `mounted` state)

**Critério de aceite:**
- Sem flash de conteúdo (ou aceitável)

### R5: Falta de Testes (P1)

**Severidade:** P1  
**Sintoma:** Mudanças podem quebrar funcionalidades sem detecção  
**Causa:** Nenhum teste automatizado  
**Arquivos:** Nenhum arquivo de teste encontrado

**Correção sugerida:**
- Adicionar Jest + React Testing Library
- Testes unitários para: mappers, utils, componentes críticos
- E2E para fluxos principais (busca → resultados → detalhes)

**Critério de aceite:**
- Cobertura mínima: 60% para utils e mappers
- E2E para fluxo principal

### R6: Rate Limiting Ausente (P0)

**Severidade:** P0  
**Sintoma:** API pode ser abusada, custos Amadeus elevados  
**Causa:** Nenhum rate limiting em `/api/flights/search`  
**Arquivo:** `app/api/flights/search/route.ts`

**Correção sugerida:**
- Implementar rate limiting (Vercel Edge Config ou Upstash Redis)
- Limite: 10 requests/min por IP
- Retornar 429 se exceder

**Critério de aceite:**
- Rate limiting ativo em produção
- 429 retornado quando exceder limite

### R7: Error Tracking Ausente (P1)

**Severidade:** P1  
**Sintoma:** Erros em produção não são monitorados  
**Causa:** Apenas `console.error`, sem tracking  
**Arquivos:** Todos que usam `console.error`

**Correção sugerida:**
- Integrar Sentry ou similar
- Capturar erros Amadeus, validação, network
- Alertas para erros críticos

**Critério de aceite:**
- Erros capturados e alertados
- Dashboard de erros

---

## 10. "Source of Truth" do Projeto

### 10.1 Documentação Existente

**docs/AMADEUS_SETUP.md:**
- Setup de integração Amadeus
- Variáveis de ambiente
- Comandos de teste
- **Status:** ✅ Atualizado

**docs/SECURITY_CHECKLIST.md:**
- Checklist de segurança
- Verificações automáticas
- **Status:** ✅ Atualizado

**docs/AMADEUS_ROLLOUT_PLAN.md:**
- Plano de rollout gradual
- Fases de implementação
- **Status:** ⚠️ Verificar se está atualizado

**docs/TODO_NEXT.md:**
- Tarefas futuras
- **Status:** ⚠️ Verificar se está atualizado

### 10.2 O que está Desatualizado

**Nenhum documento desatualizado encontrado** (após análise completa)

### 10.3 O que Precisa Virar Padrão

**Decisões Arquiteturais:**
1. ✅ **Tipos canônicos:** `lib/search/types.ts` é source of truth
2. ✅ **Normalização:** `normalizeSearchState()` sempre usado antes de serializar
3. ✅ **Cache:** TTL padrão (5min search, 10min flight)
4. ⚠️ **Error handling:** Padronizar formato de erros (já existe `SearchError`)
5. ⚠️ **Logging:** Padronizar formato de logs (requestId, contexto)

**Convenções:**
- ✅ Componentes client: `"use client"` no topo
- ✅ Server-only: `"server-only"` import ou API routes
- ✅ Tipos: sempre explícitos, sem `any`
- ✅ i18n: sempre usar `useI18n()` hook

---

## 11. Quick Fix Suggestions (Sem Implementar)

### QF1: Remover useEffect Duplicado
**Por que melhora:** Elimina código duplicado e possível re-render desnecessário  
**Arquivo:** `app/resultados/page.tsx` (linhas 247-258)  
**Risco:** Baixo (apenas remover duplicação)  
**Estimativa:** 5 minutos  
**Critério de sucesso:** Apenas um `useEffect` para `isSearchSaved()`

### QF2: Adicionar Request ID em Logs de Erro
**Por que melhora:** Facilita debugging em produção  
**Arquivo:** `app/api/flights/search/route.ts` (linha 348)  
**Risco:** Baixo (apenas adicionar campo)  
**Estimativa:** 10 minutos  
**Critério de sucesso:** Todos os erros têm `requestId` no log

### QF3: Validar Search Params em FlightDetail
**Por que melhora:** Evita 404 desnecessário se search params ausentes  
**Arquivo:** `app/voos/[id]/FlightDetailContent.tsx` (linha 81-113)  
**Risco:** Médio (pode quebrar se não houver fallback)  
**Estimativa:** 30 minutos  
**Critério de sucesso:** Re-fetch funciona mesmo sem search params (usar default ou sessionStorage)

### QF4: Adicionar Type Guards para SearchState
**Por que melhora:** Type safety melhor, menos bugs em runtime  
**Arquivo:** `lib/utils/searchParams.ts`  
**Risco:** Baixo (apenas adicionar validações)  
**Estimativa:** 20 minutos  
**Critério de sucesso:** `parseSearchParams()` valida tipos corretamente

### QF5: Cache Key mais Eficiente
**Por que melhora:** Reduz uso de memória, cache mais eficiente  
**Arquivo:** `app/api/flights/search/route.ts` (linha 62-74)  
**Risco:** Baixo (apenas otimização)  
**Estimativa:** 15 minutos  
**Critério de sucesso:** Cache key mais curto, mesmo comportamento

### QF6: Adicionar JSDoc em Funções Públicas
**Por que melhora:** Melhor documentação inline, IDE hints  
**Arquivo:** Todos os arquivos em `lib/`  
**Risco:** Baixo (apenas documentação)  
**Estimativa:** 2 horas  
**Critério de sucesso:** Todas as funções exportadas têm JSDoc

### QF7: Remover Dead Code (Mocks não Usados)
**Por que melhora:** Código mais limpo, menos confusão  
**Arquivo:** `lib/mocks/costOfLiving.ts`, `opportunities.ts`, `routes.ts`, etc.  
**Risco:** Baixo (verificar se realmente não usado)  
**Estimativa:** 30 minutos  
**Critério de sucesso:** Apenas mocks usados permanecem

### QF8: Adicionar Error Boundary
**Por que melhora:** Erros não quebram toda a aplicação  
**Arquivo:** `app/layout.tsx` ou novo componente  
**Risco:** Médio (precisa testar bem)  
**Estimativa:** 1 hora  
**Critério de sucesso:** Erros são capturados e mostram UI de fallback

### QF9: Otimizar Re-renders com useMemo
**Por que melhora:** Performance melhor, menos re-renders desnecessários  
**Arquivo:** `app/resultados/page.tsx` (já tem alguns, verificar outros)  
**Risco:** Baixo (apenas otimização)  
**Estimativa:** 1 hora  
**Critério de sucesso:** Re-renders reduzidos (medir com React DevTools)

### QF10: Adicionar Loading States Consistentes
**Por que melhora:** UX melhor, feedback visual consistente  
**Arquivo:** Todos os componentes que fazem fetch  
**Risco:** Baixo (apenas UI)  
**Estimativa:** 2 horas  
**Critério de sucesso:** Todos os fetches mostram loading state

---

**Fim do Documento**

