# 🚨 Instruções Urgentes - Deploy Netlify Humaniq AI

## Problema Atual
O Netlify não está conseguindo fazer o build automático devido a erros de dependências.

## Solução: Deploy Manual com Build Local

### Passo 1: Build Local (Faça Agora)
```bash
# No diretório do projeto
npm install --include=dev
npm run build

# Verificar se o build funcionou
ls -la dist/
# Deve mostrar index.html e assets/
```

### Passo 2: Deploy Manual no Netlify

1. **Acesse**: https://app.netlify.com/teams/luizcarlos-bastos/sites
2. **Clique**: "Add new site" → "Deploy manually" 
3. **IMPORTANTE**: Arraste a pasta `dist` inteira (não arquivos individuais)
4. **Configure as variáveis** (após upload):
   - VITE_API_URL: `https://humaniq-ai-production.up.railway.app/api`
   - VITE_APP_URL: `https://humaniq-ai.netlify.app`
   - VITE_JWT_SECRET: `your-production-jwt-secret`
   - VITE_API_FALLBACK_URL: `https://humaniq-ai-production.up.railway.app/api`

### Passo 3: Configurar Redirecionamentos

No painel do Netlify, vá para "Site settings" → "Redirects":

```
/api/*  https://humaniq-ai-production.up.railway.app/api/:splat  200
/*      /index.html  200
```

## Arquivos Importantes

- `dist/index.html` - Página principal (DEVE existir após build)
- `dist/assets/` - Assets do build (DEVE existir)
- `netlify.toml` - Configurações (pode ser ignorado no deploy manual)

## Verificação Final

Após deploy bem-sucedido:
1. Acesse: https://humaniq-ai.netlify.app
2. Teste: https://humaniq-ai.netlify.app/login
3. Teste API: https://humaniq-ai.netlify.app/api/health (deve redirecionar)

## Se Ainda Falhar

1. **Limpar cache do Netlify**: Settings → Build & deploy → Clear cache
2. **Verificar build local**: Certifique-se que `npm run build` funciona localmente
3. **Tamanho dos arquivos**: Verifique se não há arquivos muito grandes
4. **Contate suporte**: Netlify support se necessário

## Status do Backend
- ✅ Backend configurado para Railway
- ✅ URLs atualizadas para produção
- ✅ Banco de dados Neon configurado

**PRIORIDADE MÁXIMA**: Faça o build local AGORA e deploy manual!