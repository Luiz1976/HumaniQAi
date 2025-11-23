#!/bin/bash

# Script de Teste de Integração - Humaniq AI Deploy

echo "🧪 Iniciando testes de integração..."
echo "=================================="

# URLs esperadas após deploy
FRONTEND_URL="https://humaniq-ai.netlify.app"
BACKEND_URL="https://humaniq-ai-production.up.railway.app"

# Função para testar URL
test_url() {
    local url=$1
    local description=$2
    
    echo "Testing: $description"
    echo "URL: $url"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "200" ] || [ "$response" = "304" ]; then
        echo "✅ $description - OK (HTTP $response)"
        return 0
    else
        echo "❌ $description - FAILED (HTTP $response)"
        return 1
    fi
}

# Função para testar API endpoint
test_api_endpoint() {
    local endpoint=$1
    local description=$2
    
    echo "Testing API: $description"
    echo "Endpoint: $endpoint"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$endpoint" 2>/dev/null)
    
    if [ "$response" = "200" ] || [ "$response" = "201" ] || [ "$response" = "401" ]; then
        echo "✅ $description - OK (HTTP $response)"
        return 0
    else
        echo "❌ $description - FAILED (HTTP $response)"
        return 1
    fi
}

echo ""
echo "📱 Testando Frontend (Netlify)..."
echo "================================"
test_url "$FRONTEND_URL" "Página inicial do frontend"
test_url "$FRONTEND_URL/login" "Página de login"
test_url "$FRONTEND_URL/cadastro" "Página de cadastro"

echo ""
echo "🔧 Testando Backend (Railway)..."
echo "================================"
test_api_endpoint "$BACKEND_URL/api/health" "Health check da API"
test_api_endpoint "$BACKEND_URL/api/auth/health" "Auth endpoint"
test_api_endpoint "$BACKEND_URL/api/testes" "Testes endpoint"

echo ""
echo "🔗 Testando Conectividade Frontend -> Backend..."
echo "================================"
# Testar se o frontend está conseguindo se conectar ao backend
response=$(curl -s -H "Origin: $FRONTEND_URL" -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/health" 2>/dev/null)
if [ "$response" = "200" ]; then
    echo "✅ CORS funcionando - Frontend pode acessar Backend"
else
    echo "❌ CORS problem - Frontend não consegue acessar Backend (HTTP $response)"
fi

echo ""
echo "📊 Resumo dos Testes"
echo "================================"
echo "Frontend URL: $FRONTEND_URL"
echo "Backend URL: $BACKEND_URL"
echo ""
echo "Próximos passos:"
echo "1. Teste manual de login/cadastro"
echo "2. Verificar se emails estão sendo enviados"
echo "3. Testar criação de convites"
echo "4. Validar resultados de testes"
echo "5. Verificar certificados"
echo ""
echo "🎯 Testes concluídos! Verifique os resultados acima."