# Grafo de Dependências - navo.live

**Versão:** 1.0  
**Data:** 2025-01-XX  
**Mantido por:** Tech Lead

---

Este documento mapeia as dependências entre módulos internos do projeto, destacando ciclos, dívidas técnicas e sugerindo organização por camadas.

---

## Convenções

- `A → B`: A importa B
- `A →* B`: A importa B (dependência transitiva)
- `[server-only]`: Módulo server-only
- `[client]`: Módulo client-side
- `[types]`: Apenas tipos TypeScript

---

## Camadas Propostas

```
┌─────────────────────────────────────────┐
│  UI Layer (components/)                │
│  - Componentes React                    │
│  - Client-only                          │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  Hooks Layer (lib/i18n, lib/utils)     │
│  - Hooks customizados                    │
│  - Utilitários client-side               │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  Services Layer (lib/search)            │
│  - Lógica de negócio                     │
│  - Clientes de API                       │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  Integrations Layer (lib/amadeus)      │
│  - Integrações externas                 │
│  - Server-only                           │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  Types Layer (lib/search/types)         │
│  - Tipos canônicos                       │
│  - Shared types                          │
└─────────────────────────────────────────┘
```

---

## Dependências por Módulo

### app/ (Pages)

#### app/page.tsx [client]
```
app/page.tsx
  → components/layout (Header, Footer)
  → components/ui (BackgroundWaves, SearchModal)
  → components/searchbar (SearchBar)
  → components/opportunities (OpportunitiesSection)
  → lib/i18n (useI18n)
  → lib/utils/searchParams (parseSearchParams, normalizeSearchState, serializeSearchState)
  → lib/types/search (SearchState)
```

#### app/resultados/page.tsx [client]
```
app/resultados/page.tsx
  → components/layout (Footer, ThemeToggle, LanguageToggle)
  → components/brand (LogoMark, Wordmark)
  → components/ui (BackgroundWaves, SearchModal)
  → components/flights (FlightCard)
  → components/results (ResultsFilters)
  → lib/i18n (useI18n)
  → lib/search/types (SearchState, FlightResult)
  → lib/search/searchFlights (searchFlights)
  → lib/search/mockSearch (mockSearch)
  → lib/utils/searchParams (parseSearchParams, normalizeSearchState, serializeSearchState)
  → lib/utils/bestOffer (findBestOffer, calculateAveragePrice, calculateScore, parseDurationToMinutes)
  → lib/utils/savedSearches (saveSearch, removeSearch, isSearchSaved)
```

#### app/voos/[id]/FlightDetailContent.tsx [client]
```
app/voos/[id]/FlightDetailContent.tsx
  → components/layout (Footer, ThemeToggle, LanguageToggle)
  → components/brand (LogoMark, Wordmark)
  → components/ui (BackgroundWaves)
  → components/flights (AirlineLogo)
  → components/partners (PartnerLogo)
  → components/price (PriceInsightBadge)
  → lib/i18n (useI18n)
  → lib/search/types (FlightResult)
  → lib/analytics/tracking (trackPartnerClick)
  → lib/utils/searchParams (parseSearchParams, normalizeSearchState)
  → lib/mocks/flights (formatPrice)
  → lib/mocks/priceInsight (getPriceInsight)
```

#### app/api/flights/search/route.ts [server-only]
```
app/api/flights/search/route.ts
  → lib/amadeus (amadeusFetch, AmadeusError, mapFlightOffersToSearchResponse, createSearchResponse, type AmadeusFlightOffersResponse)
  → lib/search/types (SearchResponse, SearchError)
  → lib/search/flightCache (cacheFlights)
```

#### app/api/flights/[id]/route.ts [server-only]
```
app/api/flights/[id]/route.ts
  → lib/search/flightCache (getFlightFromCache)
  → lib/search/types (FlightResult, SearchError)
```

---

### components/ (UI)

#### components/searchbar/SearchBar.tsx [client]
```
components/searchbar/SearchBar.tsx
  → components/searchbar (AirportField, DateField, PaxClassPopover, SwapButton)
  → lib/i18n (useI18n)
  → lib/types/search (SearchState, TripType, Pax, CabinClass, defaultSearchState)
  → lib/mocks/airports (Airport)
  → lib/utils/searchParams (normalizeSearchState, serializeSearchState)
```

#### components/flights/FlightCard.tsx [client]
```
components/flights/FlightCard.tsx
  → components/flights (AirlineLogo)
  → components/price (PriceInsightBadge)
  → lib/search/types (FlightResult)
  → lib/types/search (SearchState)
  → lib/i18n (useI18n)
  → lib/mocks/flights (formatPrice)
  → lib/mocks/priceInsight (getPriceInsight)
```

#### components/ui/SearchModal.tsx [client]
```
components/ui/SearchModal.tsx
  → components/searchbar (SearchBar)
  → components/ui (Portal) [não usado, usar React Portal]
  → lib/types/search (SearchState)
```

#### components/layout/Header.tsx [client]
```
components/layout/Header.tsx
  → components/brand (LogoMark, Wordmark)
  → components/layout (LanguageToggle, ThemeToggle)
  → lib/i18n (useI18n)
```

---

### lib/ (Libraries)

#### lib/search/searchFlights.ts [client]
```
lib/search/searchFlights.ts
  → lib/search/types (SearchState, SearchResponse, SearchError, FlightResult, TravelClass)
```

#### lib/search/mockSearch.ts [client/server]
```
lib/search/mockSearch.ts
  → lib/mocks/flights (getMockFlights)
  → lib/search/types (SearchState, FlightResult)
```

#### lib/search/flightCache.ts [server-only]
```
lib/search/flightCache.ts
  → lib/search/types (FlightResult)
```

#### lib/amadeus/client.ts [server-only]
```
lib/amadeus/client.ts
  → lib/amadeus/auth (getAccessToken)
  → lib/amadeus/config (getAmadeusBaseUrl)
  → "server-only"
```

#### lib/amadeus/auth.ts [server-only]
```
lib/amadeus/auth.ts
  → lib/amadeus/config (getAmadeusConfig)
  → lib/amadeus/types (AmadeusToken, AmadeusTokenResponse)
  → "server-only"
```

#### lib/amadeus/config.ts [server-only]
```
lib/amadeus/config.ts
  → lib/amadeus/types (AmadeusConfig)
  → "server-only"
```

#### lib/amadeus/flights.ts [server-only]
```
lib/amadeus/flights.ts
  → lib/amadeus/client (amadeusFetch)
  → lib/amadeus/types (AmadeusFlightOffersResponse, AmadeusFlightOffer, AmadeusTravelClass, FlightSearchRequest)
  → lib/search/types (CabinClass, SearchState, FlightResult)
  → "server-only"
```

#### lib/amadeus/mappers/flightOffersToSearchResponse.ts [server-only]
```
lib/amadeus/mappers/flightOffersToSearchResponse.ts
  → lib/amadeus/types (AmadeusFlightOffersResponse, AmadeusFlightOffer, AmadeusSegment, AmadeusDictionaries)
  → lib/search/types (FlightResult, SearchResponse)
```

#### lib/utils/searchParams.ts [client/server]
```
lib/utils/searchParams.ts
  → lib/types/search (SearchState, TripType, CabinClass, defaultSearchState)
  → lib/mocks/airports (getAirportByCode)
```

#### lib/utils/bestOffer.ts [client/server]
```
lib/utils/bestOffer.ts
  → lib/mocks/flights (FlightResult) [deveria usar lib/search/types]
```

#### lib/utils/savedSearches.ts [client]
```
lib/utils/savedSearches.ts
  → lib/types/search (SearchState)
  → lib/utils/searchParams (serializeSearchState)
```

#### lib/i18n/I18nProvider.tsx [client]
```
lib/i18n/I18nProvider.tsx
  → lib/i18n/messages/pt (pt, Messages)
  → lib/i18n/messages/en (en)
```

#### lib/providers/Providers.tsx [client]
```
lib/providers/Providers.tsx
  → next-themes (ThemeProvider)
  → lib/i18n (I18nProvider)
```

---

## Ciclos de Dependência

### ❌ Nenhum ciclo encontrado

O projeto está bem estruturado sem ciclos de dependência.

---

## Dívidas Técnicas de Dependência

### D1: bestOffer.ts usa tipo de mocks

**Problema:** `lib/utils/bestOffer.ts` importa `FlightResult` de `lib/mocks/flights` em vez de `lib/search/types`

**Arquivo:** `lib/utils/bestOffer.ts` (linha 23)

**Correção:**
```typescript
// ❌ Atual
import type { FlightResult } from "@/lib/mocks/flights";

// ✅ Correto
import type { FlightResult } from "@/lib/search/types";
```

**Impacto:** Baixo (apenas tipo, mas quebra single source of truth)

### D2: searchParams.ts depende de mocks

**Problema:** `lib/utils/searchParams.ts` importa `getAirportByCode` de `lib/mocks/airports`

**Arquivo:** `lib/utils/searchParams.ts` (linha 3)

**Impacto:** Médio (utils não deveria depender de mocks, mas é necessário para parsing)

**Solução:** Manter como está (mocks são dados, não lógica)

### D3: Tipos duplicados (deprecated)

**Problema:** `lib/types/search.ts` re-exporta tipos de `lib/search/types` (deprecated)

**Arquivo:** `lib/types/search.ts`

**Impacto:** Baixo (apenas re-export, mas confunde)

**Solução:** Remover `lib/types/search.ts` e atualizar imports para usar `lib/search/types` diretamente

---

## Organização por Camadas (Sugestão)

### Camada 1: Types (Foundation)
```
lib/search/types.ts          [types]
lib/amadeus/types.ts          [types]
lib/types/search.ts          [types, deprecated]
```
- **Dependências:** Nenhuma (apenas tipos)
- **Usado por:** Todas as outras camadas

### Camada 2: Integrations (Server-only)
```
lib/amadeus/config.ts         [server-only]
lib/amadeus/auth.ts           [server-only]
lib/amadeus/client.ts          [server-only]
lib/amadeus/flights.ts         [server-only]
lib/amadeus/mappers/          [server-only]
```
- **Dependências:** Types
- **Usado por:** API routes

### Camada 3: Services (Business Logic)
```
lib/search/searchFlights.ts   [client]
lib/search/mockSearch.ts      [client/server]
lib/search/flightCache.ts    [server-only]
lib/utils/bestOffer.ts        [client/server]
lib/utils/searchParams.ts     [client/server]
lib/utils/savedSearches.ts    [client]
```
- **Dependências:** Types, Mocks (dados)
- **Usado por:** Pages, Components

### Camada 4: Hooks & Providers
```
lib/i18n/                     [client]
lib/providers/                [client]
lib/analytics/                [client]
```
- **Dependências:** Types
- **Usado por:** Pages, Components

### Camada 5: UI Components
```
components/                    [client]
```
- **Dependências:** Types, Services, Hooks
- **Usado por:** Pages

### Camada 6: Pages & API Routes
```
app/                          [client/server]
```
- **Dependências:** Components, Services, Hooks, Integrations
- **Usado por:** Next.js Router

---

## Dependências Externas

### Next.js
- `next/navigation` (useRouter, useSearchParams, useParams)
- `next/link` (Link)
- `next/font/google` (DM_Sans)
- `next-themes` (ThemeProvider)

### React
- `react` (hooks, componentes)
- `react-dom` (render)

### Floating UI
- `@floating-ui/react-dom` (Popover positioning)

### Outros
- `server-only` (marcador de server-only)

---

## Regras de Importação

### ✅ Permitido

1. **Types:** Qualquer módulo pode importar tipos
2. **Utils:** Podem importar types e outros utils
3. **Services:** Podem importar types, utils, mocks
4. **Components:** Podem importar types, services, hooks, outros components
5. **Pages:** Podem importar tudo

### ❌ Proibido

1. **Server-only → Client:** Nunca importar módulos server-only em client
2. **Components → API Routes:** Components não devem importar API routes diretamente
3. **Types → Implementação:** Types não devem importar implementações

### ⚠️ Cuidado

1. **Mocks em Utils:** Utils podem depender de mocks se necessário (ex: `searchParams.ts`)
2. **Barrel Exports:** Usar com cuidado para evitar ciclos

---

## Mapa Visual Simplificado

```
┌─────────────────────────────────────────────────────────────┐
│                        app/                                  │
│  (Pages, API Routes)                                         │
└─────────────────────────────────────────────────────────────┘
           ↓                    ↓                    ↓
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ components/  │    │ lib/search/  │    │ lib/amadeus/ │
│ (UI)         │    │ (Services)   │    │ (Integrations│
└──────────────┘    └──────────────┘    └──────────────┘
     ↓                    ↓                    ↓
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ lib/i18n/    │    │ lib/utils/   │    │ lib/mocks/   │
│ (Hooks)      │    │ (Utils)      │    │ (Data)       │
└──────────────┘    └──────────────┘    └──────────────┘
     ↓                    ↓                    ↓
┌─────────────────────────────────────────────────────────────┐
│              lib/search/types.ts                            │
│              lib/amadeus/types.ts                           │
│              (Types - Foundation)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Recomendações

### 1. Consolidar Tipos
- Remover `lib/types/search.ts` (deprecated)
- Atualizar todos os imports para usar `lib/search/types` diretamente

### 2. Separar Mocks de Utils
- Mocks são dados, não lógica
- Utils podem depender de mocks se necessário (ex: parsing)
- Manter separação clara

### 3. Server-Only Enforcement
- Adicionar `"server-only"` em `lib/search/flightCache.ts` se usado apenas no server
- Verificar imports de módulos server-only em client (já verificado, OK)

### 4. Barrel Exports
- Manter barrel exports apenas para conveniência
- Não criar ciclos via barrel exports

---

**Fim do Documento**

