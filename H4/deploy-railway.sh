#!/bin/bash

# Railway Deploy Script for Humaniq AI Backend

echo "🚀 Iniciando deploy do backend Humaniq AI..."

# Instalar dependências
echo "📦 Instalando dependências..."
cd server
npm install

# Verificar variáveis de ambiente
echo "🔍 Verificando variáveis de ambiente..."
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL não configurada!"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ JWT_SECRET não configurada!"
    exit 1
fi

# Iniciar servidor
echo "🎯 Iniciando servidor..."
npm start