# 🔍 Auditoria Técnica - Plano de Refactor Incremental

**Data:** 2025-01-26  
**Projeto:** navo-live  
**Objetivo:** Refactor incremental sem alterar UI/UX

---

## 1. DIAGNÓSTICO

### 1.1 Stack Tecnológica

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Next.js** | 16.1.1 | App Router (não Pages Router) |
| **React** | 19.2.3 | Client Components ("use client") |
| **TypeScript** | 5.x | Strict mode habilitado |
| **Tailwind CSS** | 4.x | Utility-first, CSS variables para theming |
| **next-themes** | 0.4.6 | Theme management (light/dark) |
| **@floating-ui/react-dom** | 2.1.6 | Popover positioning |
| **i18n** | Custom | Context API + localStorage |

**Observações:**
- ✅ App Router (moderno, correto)
- ✅ TypeScript strict
- ✅ Tailwind 4 com CSS variables (bom para theming)
- ⚠️ i18n custom (sem biblioteca dedicada)
- ⚠️ Sem state management externo (Zustand/Redux)

### 1.2 Rotas Mapeadas

```
/ (home)
├── SearchBar inline
└── Results inline (showResults state)

/resultados
├── URL query params (from, to, depart, return, tripType, adults, children, infants, cabin)
├── SearchModal para editar busca
└── FlightCard list

/voos/[id]
└── FlightDetailContent

/alertas
/como-funciona
/privacidade
/termos
```

**Problemas identificados:**
- ❌ `/` tem resultados inline (duplicação com `/resultados`)
- ❌ Estado de busca não sincronizado com URL na home
- ❌ `/resultados` usa URL params mas `/` usa state local

### 1.3 Componentes-Chave

#### SearchBar (`components/searchbar/SearchBar.tsx`)
- **Responsabilidades:** Form completo de busca
- **Estado:** `useState<SearchState>` interno
- **Props:** `initialState`, `onSearch`, `mode`
- **Problemas:**
  - ❌ Estado duplicado (home vs resultados)
  - ❌ Não sincroniza com URL
  - ❌ Lógica de submit duplicada

#### ResultsList (inline em `app/page.tsx`)
- **Responsabilidades:** Exibir resultados mockados
- **Estado:** `showResults` local
- **Problemas:**
  - ❌ Duplicado com `/resultados`
  - ❌ Sem loading/error states
  - ❌ Mock hardcoded no componente

#### ResultsFilters (`components/results/ResultsFilters.tsx`)
- **Responsabilidades:** Filtros de ordenação
- **Estado:** Recebido via props
- **Status:** ✅ OK (isolado, reutilizável)

#### CalendarPopover (`components/searchbar/CalendarPopover.tsx`)
- **Responsabilidades:** Seleção de datas (específica + flexível)
- **Estado:** Interno
- **Status:** ✅ OK (funcional, isolado)

#### DateField (`components/searchbar/DateField.tsx`)
- **Responsabilidades:** Trigger do CalendarPopover
- **Status:** ✅ OK

### 1.4 Dívidas Técnicas Identificadas

#### 🔴 P0 - Críticas (UX)

1. **Estado de busca não persiste na URL (home)**
   - Usuário não pode compartilhar link
   - Não funciona back/forward do browser
   - Perde estado ao recarregar

2. **Duplicação de lógica de resultados**
   - `app/page.tsx` tem resultados inline
   - `app/resultados/page.tsx` tem resultados via URL
   - Mock flights duplicado

3. **Falta de estados de loading/error**
   - Home: sem loading ao buscar
   - Home: sem empty state
   - Home: sem error handling

4. **Editar busca na home não funciona**
   - `/resultados` tem SearchModal
   - Home não tem opção de editar

#### 🟡 P1 - Importantes (Manutenção)

5. **State management fragmentado**
   - SearchBar tem estado interno
   - Home tem estado local
   - Resultados lê de URL
   - Sem fonte única de verdade

6. **Props drilling**
   - SearchBar recebe `onSearch` callback
   - Estado passa por múltiplas camadas

7. **Mocks inconsistentes**
   - `app/page.tsx`: MOCK_FLIGHTS (3 voos simples)
   - `lib/mocks/results.ts`: generateResults (voos complexos)
   - Estruturas diferentes

8. **i18n incompleto**
   - Alguns textos hardcoded
   - `app/page.tsx` tem `locale === "pt"` inline
   - Falta tradução em alguns componentes

#### 🟢 P2 - Melhorias (Qualidade)

9. **Falta de testes**
   - Zero testes unitários
   - Zero testes de integração

10. **Type safety pode melhorar**
    - Alguns `as` type assertions
    - Tipos de URL params poderiam ser mais seguros

11. **Performance**
    - Sem memoização em listas grandes
    - Re-renders desnecessários possíveis

---

## 2. PLANO DE REFACTOR (3 FASES)

### FASE P0: UX "Editar Busca" + URL State

**Objetivo:** Permitir editar busca sem sair da página + sincronizar com URL

#### Checklist P0

- [ ] **P0.1: Unificar resultados em `/resultados`**
  - Remover resultados inline de `app/page.tsx`
  - Home sempre redireciona para `/resultados?params`
  - Manter `showResults` apenas para animação (opcional)

- [ ] **P0.2: URL query params na home**
  - `SearchBar` lê de `useSearchParams()` quando disponível
  - Submit sempre atualiza URL
  - Home lê URL e preenche form

- [ ] **P0.3: SearchModal na home**
  - Adicionar botão "editar" na home quando há busca
  - Reutilizar `SearchModal` existente
  - Sincronizar com URL após editar

- [ ] **P0.4: Loading/Empty/Error states**
  - Adicionar `isLoading` state
  - Adicionar `isEmpty` state
  - Adicionar `error` state (opcional, para futuro)
  - Componentes `LoadingSkeleton`, `EmptyState` reutilizáveis

**Arquivos a alterar:**
```
app/page.tsx                    # Remover resultados inline, adicionar SearchModal
components/searchbar/SearchBar.tsx  # Ler de URL, sempre atualizar URL
lib/hooks/useSearchParams.ts    # NOVO: hook para parse/serialize SearchState
```

**Riscos:**
- ⚠️ Quebrar fluxo atual de busca
- ⚠️ Perder estado durante migração

**Mitigação:**
- Manter `onSearch` callback funcionando
- Testar fluxo completo: home → buscar → resultados → editar → resultados

---

### FASE P1: State Model + Mocks Consistentes

**Objetivo:** Fonte única de verdade para busca + mocks padronizados

#### Checklist P1

- [ ] **P1.1: Hook `useSearchState`**
  - Centraliza lógica de SearchState
  - Sincroniza com URL
  - Valida estado
  - `lib/hooks/useSearchState.ts`

- [ ] **P1.2: Unificar mocks**
  - Remover `MOCK_FLIGHTS` de `app/page.tsx`
  - Usar apenas `lib/mocks/results.ts`
  - Garantir estrutura consistente
  - Adicionar tipos TypeScript estritos

- [ ] **P1.3: Service layer para resultados**
  - `lib/services/searchService.ts`
  - Função `searchFlights(state: SearchState): Promise<FlightResult[]>`
  - Mock implementado, fácil trocar por API real depois

- [ ] **P1.4: Estados consistentes**
  - `useSearchResults` hook
  - Gerencia: loading, data, error
  - Reutilizável em home e resultados

**Arquivos a alterar:**
```
lib/hooks/useSearchState.ts      # NOVO: hook centralizado
lib/hooks/useSearchResults.ts    # NOVO: hook para resultados
lib/services/searchService.ts    # NOVO: service layer
app/page.tsx                     # Usar hooks novos
app/resultados/page.tsx          # Usar hooks novos
lib/mocks/results.ts             # Padronizar estrutura
```

**Riscos:**
- ⚠️ Mudança grande em múltiplos arquivos
- ⚠️ Possível regressão se hooks não testados

**Mitigação:**
- Criar hooks incrementalmente
- Testar cada hook isoladamente
- Manter compatibilidade com código existente durante transição

---

### FASE P2: i18n Completo + Theme Robusto + Testes

**Objetivo:** Qualidade de código e manutenibilidade

#### Checklist P2

- [ ] **P2.1: i18n completo**
  - Auditar todos os textos hardcoded
  - Adicionar chaves faltantes em `lib/i18n/messages/pt.ts` e `en.ts`
  - Remover `locale === "pt"` inline
  - Usar `t.*` sempre

- [ ] **P2.2: Theme robusto**
  - Auditar uso de cores hardcoded
  - Garantir todas usam CSS variables
  - Adicionar variáveis faltantes em `globals.css`
  - Testar dark mode em todos os componentes

- [ ] **P2.3: Testes básicos**
  - Setup Jest + React Testing Library
  - Testes de hooks (`useSearchState`, `useSearchResults`)
  - Testes de componentes críticos (SearchBar, ResultsFilters)
  - Snapshot tests para prevenir regressão visual

- [ ] **P2.4: Type safety melhorado**
  - Remover `as` type assertions desnecessários
  - Tipos mais específicos para URL params
  - Validação runtime com Zod (opcional)

**Arquivos a alterar:**
```
lib/i18n/messages/pt.ts          # Adicionar chaves faltantes
lib/i18n/messages/en.ts          # Adicionar chaves faltantes
app/globals.css                  # Adicionar variáveis CSS faltantes
**/*.tsx                         # Substituir textos hardcoded
jest.config.js                   # NOVO: config de testes
__tests__/**/*.test.tsx          # NOVO: testes
```

**Riscos:**
- ⚠️ Testes podem quebrar com mudanças futuras
- ⚠️ i18n pode adicionar overhead

**Mitigação:**
- Testes focados em lógica, não em detalhes de UI
- i18n com fallback para pt-BR

---

## 3. ARQUIVOS QUE SERÃO ALTERADOS

### P0 (Prioridade Alta)

```
app/page.tsx                          # Refactor completo
components/searchbar/SearchBar.tsx    # Adicionar URL sync
lib/hooks/useSearchParams.ts          # NOVO
components/ui/LoadingSkeleton.tsx     # Extrair de resultados (reutilizar)
components/ui/EmptyState.tsx          # Extrair de resultados (reutilizar)
```

### P1 (Prioridade Média)

```
lib/hooks/useSearchState.ts           # NOVO
lib/hooks/useSearchResults.ts         # NOVO
lib/services/searchService.ts         # NOVO
lib/mocks/results.ts                  # Padronizar
app/resultados/page.tsx               # Usar novos hooks
```

### P2 (Prioridade Baixa)

```
lib/i18n/messages/pt.ts               # Completar traduções
lib/i18n/messages/en.ts               # Completar traduções
app/globals.css                        # Adicionar variáveis
**/*.tsx                              # Substituir textos hardcoded
jest.config.js                        # NOVO
__tests__/**/*.test.tsx               # NOVO
```

---

## 4. RISCOS E MITIGAÇÃO

### Risco 1: Quebrar fluxo de busca existente

**Probabilidade:** Média  
**Impacto:** Alto

**Mitigação:**
- Manter `onSearch` callback funcionando durante P0
- Testar manualmente: home → buscar → resultados → editar
- Fazer PR pequeno (só P0.1 primeiro)

### Risco 2: Regressão visual

**Probabilidade:** Baixa  
**Impacto:** Alto

**Mitigação:**
- Não alterar classes CSS existentes
- Usar apenas variáveis CSS já definidas
- Comparar screenshots antes/depois (manual)
- Snapshot tests em P2

### Risco 3: Estado inconsistente durante migração

**Probabilidade:** Média  
**Impacto:** Médio

**Mitigação:**
- Migrar incrementalmente (um hook por vez)
- Manter código antigo funcionando até novo estar estável
- Feature flags se necessário

### Risco 4: Performance degradada

**Probabilidade:** Baixa  
**Impacto:** Baixo

**Mitigação:**
- Hooks devem ser leves (sem cálculos pesados)
- Usar `useMemo` onde necessário
- Monitorar re-renders com React DevTools

---

## 5. CHECKLIST DE VALIDAÇÃO

Antes de considerar cada fase completa:

### P0 ✅
- [ ] Home redireciona para `/resultados?params` ao buscar
- [ ] URL reflete estado de busca atual
- [ ] Botão "editar" aparece na home quando há busca
- [ ] SearchModal funciona na home
- [ ] Loading state aparece durante busca
- [ ] Empty state aparece quando não há resultados
- [ ] Back/forward do browser funciona
- [ ] Compartilhar URL funciona

### P1 ✅
- [ ] `useSearchState` centraliza toda lógica de busca
- [ ] `useSearchResults` gerencia loading/data/error
- [ ] Mocks unificados e consistentes
- [ ] Service layer isolado (fácil trocar por API)
- [ ] Home e resultados usam mesmos hooks

### P2 ✅
- [ ] Zero textos hardcoded (tudo via `t.*`)
- [ ] Zero cores hardcoded (tudo via CSS variables)
- [ ] Testes básicos passando
- [ ] Type safety melhorado
- [ ] Dark mode testado em todos os componentes

---

## 6. PRÓXIMOS PASSOS

1. **Revisar este documento** com time
2. **Priorizar fases** (P0 primeiro, sempre)
3. **Criar issues** no GitHub para cada item do checklist
4. **Iniciar P0.1** (PR pequeno: remover resultados inline da home)
5. **Testar manualmente** após cada PR
6. **Iterar** até completar todas as fases

---

**Fim do documento de auditoria.**

