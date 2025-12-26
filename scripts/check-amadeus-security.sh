#!/bin/bash

# Security Check Script for Amadeus Integration
# Verifica se há vazamento de secrets Amadeus no código client-side

set -e

echo "🔒 Verificando segurança da integração Amadeus..."
echo ""

ERRORS=0

# 1. Verificar se há NEXT_PUBLIC_AMADEUS (não deve existir)
echo "1️⃣ Verificando uso de NEXT_PUBLIC_AMADEUS..."
if grep -r "NEXT_PUBLIC_AMADEUS" --include="*.tsx" --include="*.ts" --include="*.js" --include="*.jsx" . 2>/dev/null | grep -v "node_modules" | grep -v "\.md$" | grep -v "scripts/"; then
  echo "❌ ERRO: NEXT_PUBLIC_AMADEUS encontrado! Secrets não devem usar prefixo NEXT_PUBLIC_"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ Nenhum NEXT_PUBLIC_AMADEUS encontrado"
fi
echo ""

# 2. Verificar se há process.env.AMADEUS em componentes client
echo "2️⃣ Verificando uso de process.env.AMADEUS em componentes client..."
CLIENT_FILES=$(find . -name "*.tsx" -o -name "*.ts" | xargs grep -l '"use client"' 2>/dev/null | grep -v "node_modules")
if [ -n "$CLIENT_FILES" ]; then
  for file in $CLIENT_FILES; do
    if grep -q "process\.env\.AMADEUS\|AMADEUS_CLIENT_ID\|AMADEUS_CLIENT_SECRET" "$file" 2>/dev/null; then
      echo "❌ ERRO: Secret Amadeus encontrado em componente client: $file"
      ERRORS=$((ERRORS + 1))
    fi
  done
  if [ $ERRORS -eq 0 ]; then
    echo "✅ Nenhum secret encontrado em componentes client"
  fi
else
  echo "✅ Nenhum componente client encontrado para verificar"
fi
echo ""

# 3. Verificar se há AMADEUS em arquivos client (exceto documentação)
echo "3️⃣ Verificando referências a AMADEUS em código client..."
if grep -r "AMADEUS\|amadeus" --include="*.tsx" --include="*.ts" --include="*.js" --include="*.jsx" components/ app/ 2>/dev/null | grep -v "use server" | grep -v "\.md$" | grep -v "scripts/" | grep -v "node_modules"; then
  echo "⚠️  AVISO: Referências a AMADEUS encontradas em código client"
  echo "   Verifique se são apenas comentários ou documentação"
  # Não conta como erro, apenas aviso
else
  echo "✅ Nenhuma referência a AMADEUS em código client"
fi
echo ""

# 4. Verificar se .env.local está no .gitignore
echo "4️⃣ Verificando .gitignore..."
if grep -q "\.env\*" .gitignore 2>/dev/null || grep -q "\.env\.local" .gitignore 2>/dev/null; then
  echo "✅ .env.local está no .gitignore"
else
  echo "⚠️  AVISO: .env.local pode não estar no .gitignore"
fi
echo ""

# Resultado final
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
  echo "✅ Verificação de segurança PASSOU"
  echo ""
  exit 0
else
  echo "❌ Verificação de segurança FALHOU ($ERRORS erro(s))"
  echo ""
  echo "Corrija os erros acima antes de fazer commit."
  echo ""
  exit 1
fi

