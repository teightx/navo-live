# Plano de Rollout - Integração Amadeus

## 📋 Visão Geral

Este documento descreve o plano de rollout gradual para integração da API Amadeus Self-Service no navo.live.

---

## 🎯 Objetivos

1. Integrar Amadeus Self-Service (TEST) de forma segura
2. Manter fallback para mock durante desenvolvimento
3. Garantir zero downtime durante rollout
4. Validar segurança e performance antes de produção

---

## 📅 Fases do Rollout

### Fase 1: Preparação ✅ (Concluída)

- [x] Documentação criada (`AMADEUS_SETUP.md`)
- [x] Checklist de segurança criado (`SECURITY_CHECKLIST.md`)
- [x] Script de verificação de segurança (`scripts/check-amadeus-security.sh`)
- [x] Arquivo de exemplo de variáveis (`env.example`)
- [x] Verificação de segurança executada (passou)

**Status:** ✅ Pronto para próxima fase

---

### Fase 2: Implementação Base

**Duração estimada:** 2-3 dias

#### Tarefas

- [ ] Criar estrutura de diretórios:
  ```
  lib/amadeus/
    ├── client.ts       # Cliente Amadeus (server-only)
    ├── auth.ts         # OAuth2 token management
    ├── flights.ts      # Flight Offers Search
    └── types.ts        # TypeScript types
  ```

- [ ] Implementar autenticação OAuth2:
  - [ ] Função `getAccessToken()` com cache
  - [ ] Renovação automática de token
  - [ ] Error handling para falhas de auth

- [ ] Implementar cliente Amadeus:
  - [ ] Configuração base (base URL, headers)
  - [ ] Retry logic com exponential backoff
  - [ ] Rate limit handling

- [ ] Criar API Route:
  ```
  app/api/flights/search/route.ts
  ```
  - [ ] Endpoint POST/GET para busca de voos
  - [ ] Validação de input (SearchState)
  - [ ] Error handling robusto
  - [ ] Response formatado (compatível com mock atual)

#### Feature Flag

```typescript
// lib/search/amadeusSearch.ts
const USE_AMADEUS = process.env.USE_AMADEUS === "true";

export async function searchFlights(state: SearchState) {
  if (!USE_AMADEUS) {
    return await mockSearch(state);
  }

  try {
    return await amadeusSearch(state);
  } catch (error) {
    // Fallback para mock em desenvolvimento
    if (process.env.NODE_ENV === "development") {
      console.warn("[Amadeus] API error, falling back to mock:", error);
      return await mockSearch(state);
    }
    throw error;
  }
}
```

#### Configuração

- **Local:** `USE_AMADEUS=true` em `.env.local`
- **Vercel (staging):** `USE_AMADEUS=false` (usar mock)
- **Vercel (prod):** `USE_AMADEUS=false` (usar mock até validação)

---

### Fase 3: Integração com UI

**Duração estimada:** 1-2 dias

#### Tarefas

- [ ] Atualizar `app/resultados/page.tsx`:
  - [ ] Substituir `mockSearch()` por `searchFlights()` (com feature flag)
  - [ ] Manter compatibilidade com tipos existentes
  - [ ] Adicionar loading states específicos para Amadeus

- [ ] Adicionar indicador visual (opcional):
  - [ ] Badge "Powered by Amadeus" (apenas quando `USE_AMADEUS=true`)
  - [ ] Tooltip explicando fonte dos dados

- [ ] Error handling na UI:
  - [ ] Mensagens de erro específicas para Amadeus
  - [ ] Fallback automático para mock em dev
  - [ ] Retry button para usuário

#### Testes

- [ ] Testar busca com `USE_AMADEUS=true`
- [ ] Testar busca com `USE_AMADEUS=false` (mock)
- [ ] Testar fallback em caso de erro
- [ ] Testar rate limits e retry logic

---

### Fase 4: Validação e Testes

**Duração estimada:** 2-3 dias

#### Testes Funcionais

- [ ] Busca de voos (one-way)
- [ ] Busca de voos (round-trip)
- [ ] Diferentes rotas (domésticas e internacionais)
- [ ] Diferentes datas
- [ ] Filtros (preço, duração, paradas)

#### Testes de Performance

- [ ] Latência média de resposta
- [ ] Timeout handling
- [ ] Rate limit handling
- [ ] Cache de tokens OAuth2

#### Testes de Segurança

- [ ] Executar `npm run check:amadeus`
- [ ] Verificar que nenhum secret está exposto
- [ ] Verificar Network tab (browser)
- [ ] Verificar logs do servidor

#### Testes de Integração

- [ ] Testar com credenciais TEST do Amadeus
- [ ] Validar formato de resposta
- [ ] Validar mapeamento de dados (Amadeus → FlightResult)
- [ ] Validar tratamento de erros da API

---

### Fase 5: Staging Deployment

**Duração estimada:** 1 dia

#### Tarefas

- [ ] Configurar variáveis no Vercel (staging):
  ```
  AMADEUS_BASE_URL=https://test.api.amadeus.com
  AMADEUS_CLIENT_ID=<test_client_id>
  AMADEUS_CLIENT_SECRET=<test_client_secret>
  USE_AMADEUS=true
  ```

- [ ] Deploy para staging
- [ ] Smoke tests em staging
- [ ] Monitoramento de erros (Sentry/Vercel Logs)

#### Validação

- [ ] Busca funciona em staging
- [ ] Nenhum erro crítico nos logs
- [ ] Performance aceitável (< 2s resposta)
- [ ] Fallback funciona em caso de erro

---

### Fase 6: Produção (Futuro)

**Duração estimada:** 1 dia

#### Pré-requisitos

- [ ] Todas as fases anteriores concluídas
- [ ] Testes em staging passando
- [ ] Performance validada
- [ ] Segurança validada
- [ ] Credenciais de produção obtidas do Amadeus

#### Tarefas

- [ ] Configurar variáveis no Vercel (produção):
  ```
  AMADEUS_BASE_URL=https://api.amadeus.com
  AMADEUS_CLIENT_ID=<prod_client_id>
  AMADEUS_CLIENT_SECRET=<prod_client_secret>
  USE_AMADEUS=true
  ```

- [ ] Deploy gradual (opcional):
  - [ ] 10% do tráfego → 50% → 100%
  - [ ] Monitorar erros e performance

- [ ] Monitoramento pós-deploy:
  - [ ] Taxa de erro < 1%
  - [ ] Latência média < 2s
  - [ ] Rate limits não excedidos

---

## 🔄 Feature Flag Strategy

### Estados da Flag

| Ambiente | `USE_AMADEUS` | Comportamento |
|----------|---------------|---------------|
| Local (dev) | `true` | Usa Amadeus TEST, fallback para mock em erro |
| Local (dev) | `false` | Usa mock sempre |
| Vercel (staging) | `true` | Usa Amadeus TEST, sem fallback |
| Vercel (staging) | `false` | Usa mock sempre |
| Vercel (prod) | `true` | Usa Amadeus PROD, sem fallback |
| Vercel (prod) | `false` | Usa mock sempre |

### Rollback

Se houver problemas em produção:

1. **Imediato:** Alterar `USE_AMADEUS=false` no Vercel
2. **Redeploy:** Não necessário (Next.js recarrega env vars)
3. **Investigar:** Analisar logs e corrigir problema
4. **Retry:** Habilitar novamente após correção

---

## 📊 Métricas de Sucesso

### Performance

- ✅ Latência média < 2 segundos
- ✅ 95th percentile < 3 segundos
- ✅ Taxa de erro < 1%

### Funcionalidade

- ✅ 100% das buscas retornam resultados válidos
- ✅ Fallback funciona corretamente em dev
- ✅ Error handling robusto

### Segurança

- ✅ Zero secrets expostos no client
- ✅ Verificação de segurança passa
- ✅ Tokens OAuth2 não expostos

---

## 🚨 Plano de Contingência

### Se a API Amadeus falhar:

1. **Em desenvolvimento:**
   - Fallback automático para mock
   - Log de warning no console

2. **Em staging/produção:**
   - Error message clara para usuário
   - Log de erro no servidor
   - Alert para time (Sentry/email)

3. **Rollback:**
   - Alterar `USE_AMADEUS=false` no Vercel
   - Sistema volta a usar mock imediatamente

---

## 📝 Checklist Final

Antes de marcar como concluído:

- [ ] Documentação completa
- [ ] Código implementado e testado
- [ ] Segurança validada
- [ ] Performance validada
- [ ] Deploy em staging
- [ ] Smoke tests passando
- [ ] Monitoramento configurado
- [ ] Plano de rollback documentado

---

**Última atualização:** 2025-01-XX  
**Mantido por:** Tech Lead

