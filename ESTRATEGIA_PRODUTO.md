# 🎯 Estratégia de Produto - navo.live

**Data:** 2025-01-26  
**Autor:** Product Engineer Analysis  
**Status:** Análise Estratégica (não implementação)

---

## 1. ENTENDIMENTO ATUAL DO PRODUTO

### 1.1 Visão Geral
**navo.live** é uma metabusca de voos em fase inicial, focada em:
- **Proposta de valor:** "prices change. we keep track." (rastreamento de preços)
- **Posicionamento:** Minimalista, adulto, sem poluição visual
- **Stack:** Next.js 16, React 19, Tailwind 4, TypeScript strict

### 1.2 Features Implementadas

#### Core Flow
- ✅ **Home:** Hero + SearchBar (sem resultados inline)
- ✅ **Busca:** Campos origem/destino, datas (específica/flexível), passageiros, classe
- ✅ **Resultados:** Lista de voos com filtros (preço/duração/melhor opção)
- ✅ **Detalhes:** Página `/voos/[id]` com resumo + ofertas por parceiro
- ✅ **Edição:** Modal de busca sobreposta (desktop centralizado, mobile bottom sheet)

#### UX/UI
- ✅ **Estados:** Loading (skeletons), Empty (com CTA), Error (com retry)
- ✅ **Responsivo:** Mobile-first, bottom sheets, layouts adaptativos
- ✅ **Acessibilidade:** ARIA labels, keyboard navigation, focus management
- ✅ **Tema:** Light/Dark mode com CSS variables
- ✅ **i18n:** PT/EN com sistema custom

#### Técnico
- ✅ **URL State:** Query params como fonte de verdade
- ✅ **Navegação:** Back preserva busca
- ✅ **Mocks:** Centralizados em `lib/mocks/flights.ts`
- ✅ **Popovers:** Floating UI com flip/shift automático

### 1.3 Rotas Existentes
```
/                    → Home (busca apenas)
/resultados          → Lista de voos (com filtros)
/voos/[id]           → Detalhes do voo + parceiros
/alertas             → "Em breve" (placeholder)
/como-funciona       → Explicação do produto
/privacidade         → Política
/termos              → Termos
```

### 1.4 Gaps Identificados

#### Monetização
- ❌ Sem tracking de cliques em parceiros
- ❌ Sem sistema de afiliados estruturado
- ❌ Links diretos sem parâmetros de tracking

#### Features
- ❌ Alertas de preço não implementados (apenas placeholder)
- ❌ Sem histórico de preços
- ❌ Sem comparação temporal
- ❌ Sem recomendações inteligentes

#### Dados
- ❌ Apenas mocks (sem API real)
- ❌ Sem persistência de buscas
- ❌ Sem analytics/tracking

#### Conversão
- ❌ Sem urgência/escassez visual
- ❌ Sem social proof
- ❌ Sem CTAs secundários além de "ver ofertas"

---

## 2. PERGUNTAS ORGANIZADAS POR CATEGORIA

### 2.1 Produto & Negócio

#### 🔴 Obrigatórias
1. **Qual é o modelo de receita primário?**
   - Afiliados (comissão por venda)?
   - CPC (custo por clique)?
   - Híbrido?
   - Outro?

2. **Quais parceiros/afiliados você já tem ou pretende ter?**
   - Decolar, MaxMilhas, Google Flights, Kayak, Skyscanner (já mockados)?
   - Outros?
   - Prioridade de integração?

3. **Qual é a proposta de valor única vs concorrentes?**
   - "Rastreamento de preços" é suficiente?
   - O que diferencia do Google Flights, Skyscanner, etc?

#### 🟡 Desejáveis
4. **Qual é o público-alvo primário?**
   - Viajantes frequentes?
   - Viajantes ocasionais?
   - Brasileiros buscando voos internacionais?
   - Segmento específico (executivos, mochileiros, etc)?

5. **Qual é a estratégia de crescimento?**
   - SEO orgânico?
   - Paid ads?
   - Parcerias?
   - Viral/referral?

6. **Qual é o roadmap de features?**
   - Alertas são prioridade?
   - Histórico de preços?
   - App mobile?

#### 🟢 Hipóteses Assumíveis
- **H1:** Modelo de receita é afiliados (comissão por venda)
- **H2:** Público-alvo são viajantes brasileiros (doméstico + internacional)
- **H3:** Diferenciação será "alertas inteligentes" + "transparência de preços"
- **H4:** Crescimento inicial será orgânico (SEO) + word-of-mouth

---

### 2.2 Público-Alvo

#### 🔴 Obrigatórias
1. **Qual é o perfil do usuário típico?**
   - Idade, renda, frequência de viagem?
   - B2C ou também B2B?

2. **Qual é a jornada do usuário?**
   - Como descobrem o produto?
   - O que os faz voltar?
   - Qual é o momento de decisão (compra imediata vs pesquisa)?

#### 🟡 Desejáveis
3. **Quais são as dores principais?**
   - Preços mudam muito?
   - Não sabem quando comprar?
   - Cansados de verificar manualmente?

4. **Qual é o comportamento de compra?**
   - Compram imediatamente após buscar?
   - Pesquisam em múltiplas sessões?
   - Comparam com outros sites?

#### 🟢 Hipóteses Assumíveis
- **H5:** Usuário típico: 25-45 anos, classe média/alta, viaja 2-4x/ano
- **H6:** Jornada: busca → compara → espera (ou compra) → alerta (se espera)
- **H7:** Dor principal: "não sei quando comprar" + "preços mudam muito"
- **H8:** Comportamento: pesquisa múltipla, decisão em 1-2 semanas

---

### 2.3 Monetização

#### 🔴 Obrigatórias
1. **Como você rastreia conversões?**
   - Pixel de conversão?
   - API de afiliados?
   - Parâmetros UTM?
   - Outro método?

2. **Qual é a estrutura de comissões?**
   - % fixo por parceiro?
   - Varia por rota/tipo de voo?
   - Mínimo de comissão?

3. **Como você prioriza parceiros?**
   - Maior comissão?
   - Melhor experiência do usuário?
   - Confiabilidade/trust?

#### 🟡 Desejáveis
4. **Há modelo de receita secundário?**
   - Alertas premium (pago)?
   - Dados agregados (B2B)?
   - Publicidade?

5. **Qual é a meta de receita?**
   - Por mês/ano?
   - Por usuário (ARPU)?
   - Break-even point?

#### 🟢 Hipóteses Assumíveis
- **H9:** Tracking via parâmetros de afiliado + pixel de conversão
- **H10:** Comissão média: 2-5% por venda
- **H11:** Priorização: melhor preço primeiro, depois maior comissão
- **H12:** Meta inicial: 100-500 conversões/mês

---

### 2.4 UX & UI

#### 🔴 Obrigatórias
1. **Qual é o tom de voz da marca?**
   - Minimalista e adulto (confirmado)
   - Mais formal ou casual?
   - Técnico ou emocional?

2. **Quais são os princípios de design não-negociáveis?**
   - "Sem poluir a home" (confirmado)
   - Outros princípios?

#### 🟡 Desejáveis
3. **Há referências visuais específicas?**
   - Sites/apps que você admira?
   - Estilo de design (brutalist, neumorphism, etc)?

4. **Qual é a hierarquia de informação?**
   - O que o usuário deve ver primeiro?
   - O que pode estar "abaixo da dobra"?

#### 🟢 Hipóteses Assumíveis
- **H13:** Tom: minimalista, confiável, sem exageros
- **H14:** Princípio: "menos é mais", informação quando necessário
- **H15:** Referência: Google Flights (limpo) + Airbnb (elegante)
- **H16:** Hierarquia: busca → resultados → ação (comprar/alerta)

---

### 2.5 Dados Disponíveis (Atuais e Futuros)

#### 🔴 Obrigatórias
1. **Quais APIs de voos você tem acesso?**
   - Amadeus, Skyscanner, Google Flights API?
   - Scraping (legal)?
   - Parcerias diretas?

2. **Quais dados você pode coletar?**
   - Buscas (origem/destino/datas)?
   - Cliques em resultados?
   - Conversões (via pixel)?
   - Histórico de preços?

#### 🟡 Desejáveis
3. **Há dados de terceiros disponíveis?**
   - Dados de preços históricos?
   - Dados de demanda?
   - Dados de tendências?

4. **Qual é a estratégia de dados?**
   - Analytics próprio?
   - Google Analytics?
   - Mixpanel/Amplitude?

#### 🟢 Hipóteses Assumíveis
- **H17:** Inicialmente: mocks, depois API de metabusca (Amadeus/Skyscanner)
- **H18:** Dados coletados: buscas, cliques, conversões (via pixel)
- **H19:** Analytics: Google Analytics 4 + evento customizado
- **H20:** Histórico: armazenar preços por rota/data para alertas

---

### 2.6 Restrições Técnicas

#### 🔴 Obrigatórias
1. **Há restrições de infraestrutura?**
   - Orçamento de servidor/API?
   - Limites de rate limiting?
   - Requisitos de compliance (LGPD)?

2. **Há prazos ou marcos importantes?**
   - Launch público?
   - Integração com parceiro específico?
   - Evento/marketing campaign?

#### 🟡 Desejáveis
3. **Há restrições de design?**
   - Brand guidelines?
   - Requisitos de acessibilidade (WCAG)?
   - Suporte a browsers antigos?

4. **Há restrições de performance?**
   - Core Web Vitals targets?
   - Mobile-first obrigatório?
   - Offline support necessário?

#### 🟢 Hipóteses Assumíveis
- **H21:** Infra: Vercel (serverless), sem restrições críticas
- **H22:** Prazos: sem pressão externa, desenvolvimento iterativo
- **H23:** Design: WCAG AA mínimo, browsers modernos
- **H24:** Performance: LCP < 2.5s, FID < 100ms, CLS < 0.1

---

## 3. HIPÓTESES ASSUMÍVEIS (RESUMO)

Se você não responder às perguntas, assumirei:

1. **Modelo:** Afiliados (comissão por venda)
2. **Público:** Brasileiros, 25-45 anos, viajantes ocasionais
3. **Diferenciação:** Alertas inteligentes + transparência
4. **Jornada:** Busca → Compara → Espera/Compra → Alerta
5. **Dores:** "Não sei quando comprar" + "preços mudam muito"
6. **Tracking:** Parâmetros de afiliado + pixel
7. **Comissão:** 2-5% média
8. **Tom:** Minimalista, confiável, adulto
9. **Dados:** Mocks → API metabusca (Amadeus/Skyscanner)
10. **Infra:** Vercel, sem restrições críticas

---

## 4. ESTRATÉGIA EM 3 FASES

### FASE A: Ganhos Rápidos (UX + Conversão)
**Timeline:** 2-4 semanas  
**Objetivo:** Aumentar taxa de conversão e experiência do usuário sem grandes mudanças estruturais

#### Blocos de UI Novos
1. **Home - Seção de Confiança (abaixo da busca)**
   - 3-4 cards pequenos: "Compara em 5+ sites", "Preços atualizados", "Sem taxas escondidas"
   - Design: Minimalista, ícones sutis, texto curto
   - Posição: Entre busca e footer (scroll natural)

2. **Resultados - Badge de Urgência (opcional)**
   - "Última atualização: há X minutos"
   - "X pessoas viram este voo hoje"
   - Apenas se dados disponíveis

3. **Detalhes - Seção de Contexto**
   - "Preço médio desta rota: R$ X"
   - "Este preço está X% abaixo da média"
   - "Melhor época para comprar: [mês]"

#### Features Novas
1. **Tracking de Cliques**
   - Parâmetros UTM em todos os links de parceiros
   - Evento customizado no GA4
   - Logging local (opcional)

2. **Social Proof Sutil**
   - "X buscas hoje para esta rota" (se dados disponíveis)
   - Badge "Popular" em rotas frequentes

3. **CTAs Secundários**
   - "Salvar busca" (prepara alertas futuros)
   - "Compartilhar busca" (link com query params)

4. **Melhorias de Conversão**
   - Destaque visual no menor preço (já existe, melhorar)
   - Badge "Melhor oferta" no primeiro resultado
   - Tooltip explicativo: "Por que este é o melhor?"

#### Métricas de Sucesso
- **Conversão:** +20-30% CTR em links de parceiros
- **Engajamento:** +15% tempo na página de resultados
- **Retenção:** +10% usuários que voltam (via "salvar busca")

---

### FASE B: Diferenciação (Features Inteligentes)
**Timeline:** 4-8 semanas  
**Objetivo:** Criar features únicas que justifiquem usar navo vs concorrentes

#### Blocos de UI Novos
1. **Home - Seção "Insights" (opcional, abaixo da busca)**
   - "Rotas em alta esta semana"
   - "Preços caindo: [rota] -X%"
   - Design: Cards horizontais, scroll suave

2. **Resultados - Filtro "Preço Histórico"**
   - Toggle: "Mostrar apenas preços abaixo da média"
   - Badge: "Bom negócio" em voos com preço atípico

3. **Detalhes - Gráfico de Preço (mini)**
   - Linha temporal: "Preço nos últimos 30 dias"
   - Indicador: "Você está vendo o menor preço do mês"

#### Features Novas
1. **Sistema de Alertas (MVP)**
   - Criar alerta na página de resultados
   - Email quando preço cair X%
   - Dashboard simples: `/alertas` (lista de alertas ativos)

2. **Histórico de Preços (Básico)**
   - Armazenar preços por rota/data (mock inicial)
   - Exibir tendência: "subindo" / "caindo" / "estável"
   - Gráfico simples (Chart.js ou similar)

3. **Recomendações Inteligentes**
   - "Voos similares por R$ X menos"
   - "Considere estas datas para economizar"
   - Baseado em dados históricos (mock inicial)

4. **Comparação Temporal**
   - "Este voo custava R$ X há 7 dias"
   - "Preço médio do mês: R$ X"

#### Métricas de Sucesso
- **Diferenciação:** 40%+ usuários criam alerta
- **Engajamento:** +25% sessões com múltiplas buscas
- **Retenção:** 30%+ usuários voltam via alerta

---

### FASE C: Monetização Estruturada
**Timeline:** 8-12 semanas  
**Objetivo:** Estruturar receita e otimizar conversão

#### Blocos de UI Novos
1. **Home - Seção "Por que navo?" (opcional)**
   - 3 benefícios: "Alertas inteligentes", "Sem taxas", "Transparência"
   - Design: Minimalista, abaixo da busca

2. **Resultados - Badge de Parceiro Premium**
   - Destaque visual para parceiros com maior comissão
   - "Recomendado" badge (se aplicável)

3. **Detalhes - Seção "Outras Opções"**
   - "Voos similares em outros horários"
   - "Rotas alternativas mais baratas"

#### Features Novas
1. **Sistema de Afiliados Estruturado**
   - Dashboard admin: `/admin/affiliates`
   - Tracking de conversões por parceiro
   - Relatórios: CTR, conversão, receita

2. **Alertas Premium (Opcional)**
   - Tier gratuito: 3 alertas
   - Tier pago: alertas ilimitados + notificações push
   - Integração: Stripe (ou similar)

3. **Otimização de Conversão**
   - A/B testing de CTAs
   - Personalização: destacar parceiros com maior conversão
   - Retargeting: pixel para ads

4. **Analytics Avançado**
   - Funnel: busca → resultados → detalhes → clique → conversão
   - Heatmaps (opcional)
   - User journey tracking

#### Métricas de Sucesso
- **Receita:** R$ X/mês de comissões
- **Conversão:** 5%+ taxa de clique → compra
- **ARPU:** R$ X por usuário (se premium)

---

## 5. PRÓXIMOS PROMPTS RECOMENDADOS

### Prompt 1: Fase A - Tracking e Conversão
```
Implementar sistema de tracking de cliques em parceiros:
- Adicionar parâmetros UTM/afiliado em todos os links
- Evento customizado no GA4 (ou analytics escolhido)
- Logging local opcional
- Badge "Melhor oferta" no primeiro resultado
- Tooltip explicativo sobre por que é o melhor
```

### Prompt 2: Fase A - Seção de Confiança na Home
```
Adicionar seção sutil de confiança na home (abaixo da busca):
- 3-4 cards: "Compara em 5+ sites", "Preços atualizados", "Sem taxas"
- Design minimalista, ícones sutis
- Scroll natural, não polui visual
- Responsivo mobile
```

### Prompt 3: Fase A - CTAs Secundários
```
Adicionar CTAs secundários em resultados:
- Botão "Salvar busca" (prepara alertas)
- Botão "Compartilhar busca" (link com query params)
- Posicionamento: header ou footer da lista
- Design: discreto, não compete com CTA principal
```

### Prompt 4: Fase B - Sistema de Alertas (MVP)
```
Implementar sistema básico de alertas:
- Criar alerta na página de resultados
- Form simples: email + preço alvo
- Mock de envio de email (console.log inicial)
- Página /alertas: lista de alertas ativos
- Design: consistente com resto do site
```

### Prompt 5: Fase B - Histórico de Preços (Básico)
```
Implementar histórico de preços básico:
- Armazenar preços por rota/data (localStorage inicial)
- Exibir tendência: "subindo" / "caindo" / "estável"
- Badge "Bom negócio" em preços atípicos
- Gráfico simples na página de detalhes (Chart.js)
```

### Prompt 6: Fase B - Recomendações Inteligentes
```
Adicionar recomendações inteligentes:
- "Voos similares por R$ X menos"
- "Considere estas datas para economizar"
- Baseado em dados históricos (mock inicial)
- Design: cards discretos, não invasivos
```

### Prompt 7: Fase C - Dashboard de Afiliados
```
Criar dashboard admin para afiliados:
- Rota: /admin/affiliates (protegida)
- Tracking de conversões por parceiro
- Relatórios: CTR, conversão, receita estimada
- Design: minimalista, tabelas simples
```

### Prompt 8: Fase C - Alertas Premium (Opcional)
```
Implementar sistema de alertas premium:
- Tier gratuito: 3 alertas
- Tier pago: ilimitados + notificações push
- Integração: Stripe (ou similar)
- Página de pricing: /premium
- Design: elegante, não agressivo
```

---

## 6. OBSERVAÇÕES FINAIS

### Princípios a Manter
1. **Minimalismo:** Nunca poluir a home
2. **Elegância:** Features discretas, não invasivas
3. **Confiança:** Transparência sobre preços e parceiros
4. **Performance:** Sempre rápido, sem comprometer UX

### Riscos a Evitar
1. **Over-engineering:** Features complexas antes de validar
2. **Poluição visual:** Muitos badges, popups, CTAs
3. **Dependências pesadas:** Evitar libs grandes sem necessidade
4. **Breaking changes:** Manter compatibilidade durante evolução

### Próximos Passos Imediatos
1. **Responder perguntas obrigatórias** (seção 2.1-2.6)
2. **Validar hipóteses** com dados reais (se possível)
3. **Priorizar Fase A** (ganhos rápidos)
4. **Implementar tracking** (base para tudo)

---

**Fim do documento estratégico.**

