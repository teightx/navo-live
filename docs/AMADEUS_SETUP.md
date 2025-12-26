# Integração Amadeus Self-Service - Setup e Segurança

## 📋 Visão Geral

Este documento descreve como configurar e integrar a API Amadeus Self-Service (TEST) no projeto navo.live, garantindo segurança e boa experiência de desenvolvimento.

---

## 🔐 Variáveis de Ambiente

### Variáveis Necessárias

| Variável | Descrição | Escopo | Obrigatória |
|----------|-----------|--------|-------------|
| `AMADEUS_BASE_URL` | URL base da API Amadeus | Server-only | ✅ Sim |
| `AMADEUS_CLIENT_ID` | Client ID da aplicação | Server-only | ✅ Sim |
| `AMADEUS_CLIENT_SECRET` | Client Secret da aplicação | Server-only | ✅ Sim |
| `USE_AMADEUS` | Feature flag para habilitar integração | Server-only | ❌ Não (default: `false`) |
| `NODE_ENV` | Ambiente de execução (`development`, `production`) | Server-only | ✅ Sim |

### Valores Padrão (TEST)

```bash
# Amadeus Self-Service TEST Environment
AMADEUS_BASE_URL=https://test.api.amadeus.com
AMADEUS_CLIENT_ID=your_test_client_id_here
AMADEUS_CLIENT_SECRET=your_test_client_secret_here

# Feature Flag (opcional)
USE_AMADEUS=false

# Ambiente
NODE_ENV=development
```

---

## 🚀 Configuração Local

### 1. Criar arquivo `.env.local`

Na raiz do projeto, crie o arquivo `.env.local`:

```bash
cp .env.local.example .env.local
```

### 2. Preencher credenciais

Edite `.env.local` com suas credenciais do Amadeus TEST:

```bash
AMADEUS_BASE_URL=https://test.api.amadeus.com
AMADEUS_CLIENT_ID=seu_client_id_aqui
AMADEUS_CLIENT_SECRET=seu_client_secret_aqui
USE_AMADEUS=true
NODE_ENV=development
```

### 3. Verificar que está no `.gitignore`

O arquivo `.env.local` já está no `.gitignore` (linha 34), então não será commitado.

---

## 🧪 Comandos de Teste

### Desenvolvimento Local

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build de produção local
npm run build
npm start
```

### Testar Integração

Após implementar a integração, você pode testar:

```bash
# Verificar se variáveis estão carregadas (server-side)
# Adicione um console.log temporário em uma API route:
# console.log('AMADEUS_BASE_URL:', process.env.AMADEUS_BASE_URL)

# Testar busca de voos via API route
curl http://localhost:3000/api/flights/search?from=GRU&to=LIS&depart=2025-12-15
```

---

## 🔒 Segurança

### ✅ Regras de Segurança

1. **NUNCA** exponha `AMADEUS_CLIENT_ID` ou `AMADEUS_CLIENT_SECRET` no client-side
2. **NUNCA** use prefixo `NEXT_PUBLIC_` para variáveis sensíveis
3. **SEMPRE** use API Routes (Server Actions ou Route Handlers) para chamadas à API Amadeus
4. **SEMPRE** valide e sanitize inputs antes de enviar para a API

### ✅ Checklist de Segurança

- [ ] Nenhuma variável `AMADEUS_*` está sendo usada em componentes `"use client"`
- [ ] Todas as chamadas à API Amadeus são feitas via API Routes ou Server Actions
- [ ] Credenciais não aparecem em `window`, `document`, ou qualquer objeto global do browser
- [ ] `.env.local` está no `.gitignore`
- [ ] Variáveis de produção estão configuradas no Vercel (não no código)

### 🚨 Verificação Automática

Execute este comando para verificar se há vazamento de secrets:

```bash
# Buscar por uso de variáveis AMADEUS em componentes client
grep -r "AMADEUS" --include="*.tsx" --include="*.ts" components/ app/ | grep -v "use server"
```

**Resultado esperado:** Nenhum resultado (ou apenas em arquivos de documentação/config).

---

## 📁 Estrutura de Arquivos Recomendada

```
lib/
  ├── amadeus/
  │   ├── client.ts          # Cliente Amadeus (server-only)
  │   ├── auth.ts            # Autenticação OAuth2
  │   ├── flights.ts          # Endpoints de voos
  │   └── types.ts            # Tipos TypeScript
  └── search/
      ├── mockSearch.ts       # Mock atual (fallback)
      └── amadeusSearch.ts    # Nova implementação (opcional)

app/
  └── api/
      └── flights/
          └── route.ts        # API Route para busca de voos
```

---

## 🎯 Plano de Rollout

### Fase 1: Setup e Testes (Atual)

- [x] Documentação criada
- [ ] Variáveis de ambiente configuradas localmente
- [ ] Estrutura de diretórios criada
- [ ] Cliente Amadeus implementado (server-only)

### Fase 2: Integração Gradual

- [ ] Feature flag `USE_AMADEUS` implementada
- [ ] API Route `/api/flights/search` criada
- [ ] Fallback para mock em caso de erro (apenas em `development`)
- [ ] Testes locais com credenciais TEST

### Fase 3: Validação

- [ ] Testes de integração com API Amadeus TEST
- [ ] Validação de segurança (verificação automática)
- [ ] Testes de fallback e error handling
- [ ] Performance: latência e rate limits

### Fase 4: Produção (Futuro)

- [ ] Configurar variáveis no Vercel (produção)
- [ ] Atualizar `AMADEUS_BASE_URL` para produção
- [ ] Habilitar `USE_AMADEUS=true` em produção
- [ ] Monitoramento e alertas

---

## 🔄 Feature Flag: `USE_AMADEUS`

### Comportamento

```typescript
// lib/search/amadeusSearch.ts
const USE_AMADEUS = process.env.USE_AMADEUS === "true";

export async function searchFlights(state: SearchState) {
  if (USE_AMADEUS) {
    try {
      return await amadeusSearch(state);
    } catch (error) {
      // Em desenvolvimento, fallback para mock
      if (process.env.NODE_ENV === "development") {
        console.warn("[Amadeus] API error, falling back to mock:", error);
        return await mockSearch(state);
      }
      // Em produção, propaga erro
      throw error;
    }
  }
  
  // Se flag desabilitada, usa mock
  return await mockSearch(state);
}
```

### Configuração

- **Local (dev):** `USE_AMADEUS=true` em `.env.local`
- **Vercel (staging):** `USE_AMADEUS=false` (usar mock até validação completa)
- **Vercel (prod):** `USE_AMADEUS=true` (após validação)

---

## 📚 Recursos

- [Amadeus Self-Service API Docs](https://developers.amadeus.com/self-service)
- [Amadeus Flight Offers Search API](https://developers.amadeus.com/self-service/category/flights/api-doc/flight-offers-search)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

## ⚠️ Notas Importantes

1. **TEST Environment:** As credenciais TEST têm limites de rate limit menores. Use com moderação durante desenvolvimento.

2. **OAuth2 Token:** A API Amadeus usa OAuth2. O token deve ser renovado periodicamente. Implemente cache de token no servidor.

3. **Rate Limits:** Monitore rate limits da API. Implemente retry logic com exponential backoff.

4. **Error Handling:** Sempre trate erros de forma elegante. Em desenvolvimento, use mock como fallback. Em produção, mostre mensagens claras ao usuário.

---

## ✅ Checklist Final

Antes de fazer deploy:

- [ ] Variáveis configuradas no Vercel (produção)
- [ ] Nenhum secret exposto no client-side
- [ ] Feature flag configurada corretamente
- [ ] Fallback para mock implementado (dev)
- [ ] Error handling robusto
- [ ] Testes de integração passando
- [ ] Documentação atualizada

---

**Última atualização:** 2025-01-XX  
**Mantido por:** Tech Lead

