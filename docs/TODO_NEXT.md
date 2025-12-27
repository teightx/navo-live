# TODO: Próximos Passos

## Em Breve (Feature Flags)

### 1. Comparação de Parceiros (`/voos/[id]`)

**Status:** Placeholder honesto com badge "em breve"

**O que falta:**
- Integrar com APIs de parceiros (Decolar, MaxMilhas, Kayak, Skyscanner, Google Flights)
- Ou implementar deep linking com tracking de afiliados
- Mapear URLs oficiais das companhias aéreas por IATA code

**Arquivo:** `app/voos/[id]/FlightDetailContent.tsx`

**Feature flag:** Não há flag específica; seção já mostra CTA "ir para site" funcional

---

### 2. Preços Monitorados (Home)

**Status:** Renomeado para "rotas populares" com badge "exemplos"

**O que falta:**
- Implementar pipeline de coleta de preços históricos
- Criar tabela/cache de preços por rota
- Calcular variação real (média 30 dias, menor preço 48h)
- Atualizar `HAS_REAL_PRICE_HISTORY = true` quando pronto

**Arquivo:** `components/opportunities/OpportunitiesSection.tsx`

**Feature flag:** 
- `SHOW_OPPORTUNITIES`: mostra/esconde seção inteira
- `HAS_REAL_PRICE_HISTORY`: quando `true`, mostra badges reais

---

### 3. Alertas de Preço

**Status:** Página `/alertas` existe mas usa mocks

**O que falta:**
- Backend para salvar alertas (DB)
- Sistema de notificação (email/push)
- Integração com pipeline de preços

---

### 4. Logos Reais das Companhias

**Status:** SVGs placeholder com código IATA e cor da marca

**O que falta:**
- Obter logos oficiais em SVG das companhias
- Substituir arquivos em `public/airlines/{CODE}.svg`
- Atualizar `hasLogo: true` em `lib/airlines/airlineLogos.ts`

**Companhias com logo placeholder:**
- LA, AD, G3, JJ (Brasil)
- TP, IB, AF, LH, BA, KL, UX (Europa)
- AA, UA, DL, AC (América do Norte)
- EK, QR, TK (Oriente Médio)

---

## Bugs Conhecidos

### 1. Cache de Voos Expira

**Problema:** Se usuário compartilhar URL de `/voos/[id]` e o outro usuário abrir depois de 10min, pode dar 404

**Solução:** O sistema já tenta re-fetch via query params. Garantir que a URL sempre inclua `from`, `to`, `depart` para permitir re-fetch.

---

## Melhorias de UX Pendentes

1. **Loading state mais elegante** na página de detalhes
2. **Skeleton mais preciso** que corresponda ao layout real
3. **Animações de transição** entre estados
4. **Feedback visual** ao clicar em "ver ofertas"

---

## Configuração de Produção

### Variáveis de Ambiente

```bash
# .env.local (desenvolvimento)
USE_AMADEUS=true
AMADEUS_BASE_URL=https://test.api.amadeus.com
AMADEUS_CLIENT_ID=xxx
AMADEUS_CLIENT_SECRET=xxx

# Produção
AMADEUS_BASE_URL=https://api.amadeus.com
```

### Cache TTL

- Search cache: 5 minutos (`CACHE_TTL_MS` em `app/api/flights/search/route.ts`)
- Flight cache: 10 minutos (`CACHE_TTL_MS` em `lib/search/flightCache.ts`)

---

## Contato

Dúvidas sobre implementação: ver arquivos relevantes ou abrir issue no repositório.

