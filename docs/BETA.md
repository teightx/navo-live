# BETA Configuration Guide

Este documento explica como usar as flags BETA para debugging em produção.

> ⚠️ **IMPORTANTE**: As flags BETA são para uso temporário durante debugging. Remova-as assim que o problema for resolvido.

## Problema: Busca falha em produção mas funciona em preview/test

Se você está vendo erros como "erro ao buscar voos" com requestId em produção, mas o mesmo código funciona em preview, o problema provavelmente é uma diferença de configuração de credenciais Amadeus.

### Solução: Usar configuração de teste em produção (temporário)

1. **Na Vercel, adicione as variáveis de ambiente para Production:**

```bash
# Habilita uso de credenciais de teste em produção
BETA_USE_TEST_CONFIG_IN_PROD=true

# Credenciais de teste (as mesmas que funcionam em preview)
TEST_AMADEUS_BASE_URL=https://test.api.amadeus.com
TEST_AMADEUS_CLIENT_ID=<seu_client_id_de_teste>
TEST_AMADEUS_CLIENT_SECRET=<seu_client_secret_de_teste>
```

2. **Faça deploy ou redeploy**

3. **Verifique os logs** - Você deve ver um warning:
```json
{"level":"warn","event":"BETA_PROD_USING_TEST_CONFIG",...}
```

4. **Teste a busca** - Agora deve funcionar

5. **IMPORTANTE: Quando resolver o problema real, remova as variáveis BETA e configure as credenciais de produção corretas**

## Flags BETA Disponíveis

### `BETA_USE_TEST_CONFIG_IN_PROD`

| Valor | Comportamento |
|-------|---------------|
| `false` (default) | Usa `AMADEUS_*` normalmente |
| `true` | Usa `TEST_AMADEUS_*` em vez de `AMADEUS_*` em produção |

**Variáveis de teste aceitas:**
- `TEST_AMADEUS_BASE_URL` ou `AMADEUS_BASE_URL_TEST`
- `TEST_AMADEUS_CLIENT_ID` ou `AMADEUS_CLIENT_ID_TEST`
- `TEST_AMADEUS_CLIENT_SECRET` ou `AMADEUS_CLIENT_SECRET_TEST`

**Se `BETA_USE_TEST_CONFIG_IN_PROD=true` mas as variáveis de teste não existirem, o app falhará no boot com erro explícito.**

### `BETA_ALLOW_MOCKS_IN_PROD`

| Valor | Comportamento |
|-------|---------------|
| `false` (default) | Mocks proibidos em produção (comportamento normal) |
| `true` | Permite `USE_MOCKS=true` em produção |

> ⚠️ **NUNCA** deixe esta flag habilitada em produção por mais tempo do que necessário. Mocks em produção podem causar comportamento incorreto e não refletem dados reais.

## Como Configurar na Vercel

1. Vá em **Project Settings** > **Environment Variables**

2. Adicione as variáveis com scope **Production**:

| Variable | Value | Scope |
|----------|-------|-------|
| `BETA_USE_TEST_CONFIG_IN_PROD` | `true` | Production |
| `TEST_AMADEUS_BASE_URL` | `https://test.api.amadeus.com` | Production |
| `TEST_AMADEUS_CLIENT_ID` | `<seu_id>` | Production |
| `TEST_AMADEUS_CLIENT_SECRET` | `<seu_secret>` | Production |

3. Clique em **Save**

4. Faça um **Redeploy** (Settings > Deployments > ... > Redeploy)

## Logs de Diagnóstico

Quando as flags BETA estão ativas, você verá warnings nos logs:

```json
// Usando config de teste em produção
{"level":"warn","event":"BETA_PROD_USING_TEST_CONFIG","message":"Production is using TEST Amadeus credentials..."}

// Mocks permitidos em produção
{"level":"warn","event":"BETA_MOCKS_ALLOWED_IN_PROD","message":"Mocks are allowed in production..."}
```

## Códigos de Erro Normalizados

A API agora retorna códigos de erro normalizados para facilitar debugging:

| Código | Significado | Causa Provável |
|--------|-------------|----------------|
| `AMADEUS_AUTH_FAILED` | 401/403 do Amadeus | Credenciais inválidas ou expiradas |
| `AMADEUS_UNAVAILABLE` | 5xx do Amadeus | API Amadeus com problemas |
| `AMADEUS_BAD_REQUEST` | 400 do Amadeus | Parâmetros inválidos |
| `AMADEUS_NETWORK_ERROR` | Fetch falhou | DNS, firewall, rede |
| `AMADEUS_TIMEOUT` | Timeout | API lenta ou bloqueada |

## Checklist para Voltar ao Normal

Depois de resolver o problema:

- [ ] Remover `BETA_USE_TEST_CONFIG_IN_PROD` da Vercel
- [ ] Remover `TEST_AMADEUS_*` da Vercel (ou manter para futuro debugging)
- [ ] Remover `BETA_ALLOW_MOCKS_IN_PROD` se foi usado
- [ ] Verificar que `AMADEUS_*` (produção) estão configurados corretamente
- [ ] Fazer redeploy
- [ ] Confirmar que logs não mostram mais warnings BETA

## Contato

Se precisar de ajuda, verifique:
1. Os logs no Vercel (Functions tab)
2. O requestId retornado na UI (primeiros 8 caracteres)
3. Este documento para configuração correta

