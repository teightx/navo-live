# Sincronização SearchBar ↔ URL

## Arquivos Alterados

1. **`lib/utils/searchParams.ts`** (NOVO)
   - `parseSearchParams()` - Converte URL params → SearchState
   - `normalizeSearchState()` - Aplica defaults e validações
   - `serializeSearchState()` - Converte SearchState → query string

2. **`app/page.tsx`**
   - Lê URL params na inicialização
   - Passa estado inicial para SearchBar

3. **`components/searchbar/SearchBar.tsx`**
   - Usa `serializeSearchState()` ao buscar
   - Usa `normalizeSearchState()` antes de navegar

4. **`app/resultados/page.tsx`**
   - Usa `parseSearchParams()` para ler URL
   - Usa `normalizeSearchState()` para SearchModal
   - Usa `serializeSearchState()` ao editar busca

## Exemplos de URLs

### Roundtrip completo
```
/resultados?from=GRU&to=GIG&depart=2025-12-27&return=2025-12-31&tripType=roundtrip&adults=2&children=1&cabin=economy
```

### Oneway (sem returnDate)
```
/resultados?from=GRU&to=GIG&depart=2025-12-27&tripType=oneway&adults=1
```

### Mínimo (usa defaults)
```
/resultados?from=GRU&to=GIG&depart=2025-12-27
```
- `tripType` = "roundtrip" (default)
- `adults` = 1 (default)
- `children` = 0 (default)
- `infants` = 0 (default)
- `cabin` = "economy" (default)
- `return` = null (se oneway ou não fornecido)

## Casos Tratados

### ✅ Oneway vs Roundtrip
- **Oneway**: `returnDate` é removido automaticamente na normalização
- **Roundtrip**: `returnDate` é incluído na URL se presente

### ✅ Sem returnDate
- Se `tripType=oneway`, `returnDate` é ignorado mesmo se presente na URL
- Se `tripType=roundtrip` e sem `return`, busca funciona normalmente

### ✅ Datas Inválidas
- Validação de formato: apenas `YYYY-MM-DD` é aceito
- Datas inválidas são descartadas e substituídas por `null`
- Regex: `/^\d{4}-\d{2}-\d{2}$/`

### ✅ Aeroportos Inválidos
- Códigos não encontrados são ignorados
- `from`/`to` ficam `null` se código não existe

### ✅ Números Inválidos (Pax)
- `adults < 1` → corrigido para 1
- `children < 0` → corrigido para 0
- `infants < 0` → corrigido para 0
- Valores não numéricos são ignorados

### ✅ Cabin Class Inválido
- Apenas valores válidos são aceitos: `economy`, `premium_economy`, `business`, `first`
- Valores inválidos usam default `economy`

### ✅ Parâmetros Faltantes
- Todos os campos opcionais usam defaults
- Apenas `from`, `to`, `depart` são obrigatórios para busca válida

## Comportamento

### Home (`/`)
1. Lê URL params se existirem
2. Preenche SearchBar com estado da URL
3. Ao buscar, navega para `/resultados?params`

### Resultados (`/resultados`)
1. Lê URL como fonte da verdade
2. Parse → Normalize → Usa para buscar e exibir
3. SearchModal recebe estado normalizado da URL
4. Ao editar, atualiza URL e recarrega resultados

### Normalização
- Remove `returnDate` se `tripType=oneway`
- Valida formato de datas
- Aplica defaults para campos faltantes
- Garante números válidos para pax

### Serialização
- Omite valores default (URLs mais limpas)
- Omite `return` se oneway
- Sempre inclui `from`, `to`, `depart` (obrigatórios)

## Testes Manuais

1. **Home com URL params:**
   ```
   /?from=GRU&to=GIG&depart=2025-12-27
   ```
   - Campos devem preencher automaticamente

2. **Buscar na home:**
   - Preencher campos → Clicar "buscar"
   - Deve navegar para `/resultados?from=...&to=...&depart=...`

3. **Editar em resultados:**
   - Clicar "editar" → Modificar campos → Aplicar
   - URL deve atualizar e resultados recarregar

4. **Oneway:**
   - Selecionar "só ida" → Preencher → Buscar
   - URL não deve ter `return` param

5. **URL compartilhada:**
   - Copiar URL de resultados
   - Abrir em nova aba
   - Deve mostrar mesmos resultados

