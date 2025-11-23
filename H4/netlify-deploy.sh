#!/bin/bash

# Script de deploy para Netlify - Humaniq AI Frontend

echo "🚀 Iniciando build do frontend Humaniq AI..."

# Limpar cache e instalar dependências
echo "📦 Instalando dependências..."
npm ci --include=dev

# Verificar se vite está disponível
echo "🔍 Verificando vite..."
if ! command -v vite &> /dev/null; then
    echo "❌ Vite não encontrado, instalando globalmente..."
    npm install -g vite
fi

# Build do projeto
echo "🏗️  Construindo projeto..."
npm run build

# Verificar se build foi bem-sucedido
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "✅ Build concluído com sucesso!"
    echo "📁 Arquivos gerados:"
    ls -la dist/
else
    echo "❌ Build falhou - diretório dist não encontrado"
    exit 1
fi

echo "🎯 Deploy pronto!"