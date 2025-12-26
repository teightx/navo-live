# Security Checklist - Amadeus Integration

## 🔒 Verificação de Segurança

Este checklist deve ser executado antes de cada commit relacionado à integração Amadeus.

---

## ✅ Checklist de Segurança

### 1. Variáveis de Ambiente

- [ ] Nenhuma variável `AMADEUS_*` usa prefixo `NEXT_PUBLIC_`
- [ ] Todas as variáveis sensíveis estão no `.env.local` (não commitadas)
- [ ] `.env.local` está no `.gitignore`
- [ ] Arquivo `env.example` existe e não contém valores reais

### 2. Client-Side Security

- [ ] Nenhum componente `"use client"` acessa `process.env.AMADEUS_*`
- [ ] Nenhum secret é passado via props para componentes client
- [ ] Nenhum secret aparece em `window`, `document`, ou objetos globais
- [ ] Nenhum secret é logado no console do browser

### 3. Server-Side Only

- [ ] Todas as chamadas à API Amadeus são feitas em:
  - [ ] API Routes (`app/api/**/route.ts`)
  - [ ] Server Actions (`"use server"`)
  - [ ] Server Components (sem `"use client"`)
- [ ] Cliente Amadeus é instanciado apenas no servidor
- [ ] Tokens OAuth2 são armazenados apenas no servidor (não em cookies do client)

### 4. Code Review

Execute os seguintes comandos antes de fazer commit:

```bash
# 1. Verificar se há uso de AMADEUS em componentes client
grep -r "AMADEUS\|amadeus" --include="*.tsx" --include="*.ts" components/ app/ | grep -v "use server" | grep -v "\.md$"

# Resultado esperado: Nenhum resultado (ou apenas em comentários/documentação)

# 2. Verificar se há NEXT_PUBLIC_AMADEUS (não deve existir)
grep -r "NEXT_PUBLIC_AMADEUS" --include="*.tsx" --include="*.ts" .

# Resultado esperado: Nenhum resultado

# 3. Verificar se há process.env.AMADEUS em arquivos client
grep -r "process\.env\.AMADEUS" --include="*.tsx" --include="*.ts" components/ app/ | grep -v "use server"

# Resultado esperado: Nenhum resultado
```

### 5. Build Verification

- [ ] Build de produção passa sem erros: `npm run build`
- [ ] Nenhum warning sobre variáveis de ambiente não definidas
- [ ] TypeScript não reporta erros de tipo relacionados a secrets

### 6. Runtime Verification

- [ ] Em desenvolvimento, verificar que variáveis estão carregadas:
  ```typescript
  // Em uma API route temporária
  console.log('AMADEUS_BASE_URL:', process.env.AMADEUS_BASE_URL ? '✅ Set' : '❌ Missing');
  console.log('AMADEUS_CLIENT_ID:', process.env.AMADEUS_CLIENT_ID ? '✅ Set' : '❌ Missing');
  ```
- [ ] Verificar que no browser (DevTools > Console), nenhum secret é exposto
- [ ] Verificar Network tab: nenhuma requisição contém secrets no payload

---

## 🚨 Red Flags (NUNCA fazer)

❌ **NUNCA** faça isso:

```typescript
// ❌ ERRADO - Expõe secret no client
"use client";
const clientId = process.env.AMADEUS_CLIENT_ID; // ❌

// ❌ ERRADO - Usa NEXT_PUBLIC_
NEXT_PUBLIC_AMADEUS_CLIENT_SECRET=xxx // ❌

// ❌ ERRADO - Passa secret via props
<ClientComponent apiKey={process.env.AMADEUS_CLIENT_ID} /> // ❌

// ❌ ERRADO - Loga secret no client
console.log('Secret:', process.env.AMADEUS_CLIENT_SECRET); // ❌
```

✅ **SEMPRE** faça isso:

```typescript
// ✅ CORRETO - API Route (server-only)
// app/api/flights/route.ts
export async function GET() {
  const clientId = process.env.AMADEUS_CLIENT_ID; // ✅ Server-only
  // ...
}

// ✅ CORRETO - Server Action
"use server";
export async function searchFlights() {
  const clientId = process.env.AMADEUS_CLIENT_ID; // ✅ Server-only
  // ...
}
```

---

## 📋 Pre-Commit Checklist

Antes de fazer commit, verifique:

1. [ ] Execute `grep` commands acima (nenhum resultado esperado)
2. [ ] Build passa: `npm run build`
3. [ ] Nenhum secret no código commitado
4. [ ] `.env.local` não está sendo commitado
5. [ ] Documentação atualizada

---

## 🔍 Verificação Automática (Futuro)

Considere adicionar um pre-commit hook ou CI check:

```bash
#!/bin/bash
# .husky/pre-commit

# Verificar se há secrets expostos
if grep -r "NEXT_PUBLIC_AMADEUS\|process\.env\.AMADEUS" --include="*.tsx" --include="*.ts" components/ app/ | grep -v "use server" | grep -v "\.md$"; then
  echo "❌ ERRO: Secrets Amadeus encontrados em código client-side!"
  exit 1
fi

echo "✅ Verificação de segurança passou"
```

---

**Última atualização:** 2025-01-XX  
**Mantido por:** Tech Lead

