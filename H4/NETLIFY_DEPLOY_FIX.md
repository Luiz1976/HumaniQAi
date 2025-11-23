# 🚨 Correção de Deploy Netlify - Humaniq AI

## Problema Detectado

O deploy falhou com erro: `vite: not found` (exit code 127)

## Causa
O Netlify não está instalando as devDependencies necessárias para o build.

## Solução Aplicada

### 1. Configuração Atualizada (`netlify.toml`)
```toml
[build]
  publish = "dist"
  command = """
    echo "📦 Instalando dependências..." &&
    npm ci --include=dev &&
    echo "🔧 Verificando Node e NPM..." &&
    node --version &&
    npm --version &&
    echo "📁 Listando node_modules..." &&
    ls -la node_modules/.bin/ | head -10 &&
    echo "🏗️  Iniciando build..." &&
    npx vite build &&
    echo "✅ Build concluído!" &&
    ls -la dist/
  """

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"
  NODE_ENV = "production"
  NPM_CONFIG_PRODUCTION = "false"
  NPM_FLAGS = "--include=dev"

[[redirects]]
  from = "/api/*"
  to = "https://humaniq-ai-production.up.railway.app/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production.environment]
  VITE_API_URL = "https://humaniq-ai-production.up.railway.app/api"
  VITE_APP_URL = "https://humaniq-ai.netlify.app"
  VITE_JWT_SECRET = "your-production-jwt-secret"
  VITE_API_FALLBACK_URL = "https://humaniq-ai-production.up.railway.app/api"
```

### 2. Variáveis de Ambiente Necessárias
Configure no painel do Netlify:

```env
NODE_VERSION=18
NPM_VERSION=9
NODE_ENV=production
NPM_CONFIG_PRODUCTION=false
NPM_FLAGS=--include=dev
VITE_API_URL=https://humaniq-ai-production.up.railway.app/api
VITE_APP_URL=https://humaniq-ai.netlify.app
VITE_API_FALLBACK_URL=https://humaniq-ai-production.up.railway.app/api
VITE_JWT_SECRET=your-production-jwt-secret-here
```

## Passos para Deploy Manual (Recomendado)

### Opção 1: Deploy via Interface Web
1. Acesse: https://app.netlify.com/teams/luizcarlos-bastos/sites
2. Clique em "Add new site" → "Deploy manually"
3. **IMPORTANTE**: Faça upload da pasta `dist` inteira (não arraste arquivos individuais)
4. Configure as variáveis de ambiente acima
5. O deploy será automático

### Opção 2: Deploy via Git (Se estiver usando repositório)
1. Conecte seu repositório Git ao Netlify
2. Configure:
   - Build command: `npm ci --include=dev && npm run build`
   - Publish directory: `dist`
3. Adicione as variáveis de ambiente
4. Faça push para trigger automático

## Verificação Pós-Deploy

Execute após deploy bem-sucedido:
```bash
# Testar URLs
curl -I https://humaniq-ai.netlify.app
curl -I https://humaniq-ai.netlify.app/api/health

# Verificar redirecionamentos
curl -I https://humaniq-ai.netlify.app/api/testes
```

## Troubleshooting

### Se ainda falhar:
1. **Limpar cache**: No Netlify, vá para "Deploy settings" → "Clear cache and retry"
2. **Verificar logs**: Clique no deploy falhado para ver logs completos
3. **Testar localmente**: 
   ```bash
   rm -rf node_modules package-lock.json
   npm install --include=dev
   npm run build
   ```

### Erros comuns:
- **Exit code 127**: Dependências faltando → Use `npm ci --include=dev`
- **Exit code 2**: Erro de build → Verifique sintaxe do código
- **Exit code 254**: Problema de permissão → Verifique variáveis de ambiente

## URLs Esperadas
- Frontend: `https://humaniq-ai.netlify.app`
- Backend: `https://humaniq-ai-production.up.railway.app`

## Status Atual
✅ **Configuração corrigida e pronta para novo deploy**