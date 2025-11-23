# Instruções de Deploy - Humaniq AI

## Deploy do Frontend (Netlify)

### Opção 1: Deploy via Interface Web (Recomendado)

1. Acesse: https://app.netlify.com/teams/luizcarlos-bastos/sites
2. Clique em "Add new site" → "Deploy manually"
3. Arraste a pasta `dist` inteira para a área de upload
4. Configure as variáveis de ambiente:
   - VITE_API_URL: `https://humaniq-ai-production.up.railway.app/api`
   - VITE_APP_URL: `https://humaniq-ai.netlify.app`
   - VITE_JWT_SECRET: `your-production-jwt-secret`
   - VITE_API_FALLBACK_URL: `https://humaniq-ai-production.up.railway.app/api`

5. O deploy será automático após o upload

### Opção 2: Deploy via Git (Se estiver usando repositório)

1. Conecte seu repositório Git ao Netlify
2. Configure o build command: `npm run build`
3. Configure o publish directory: `dist`
4. Adicione as variáveis de ambiente acima

## Deploy do Backend (Railway)

1. Acesse: https://railway.com/new
2. Faça upload do diretório `api` ou conecte seu repositório
3. Configure as variáveis de ambiente:
   - DATABASE_URL: (sua conexão Neon)
   - JWT_SECRET: (seu segredo JWT)
   - PORT: 3001
   - NODE_ENV: production

## Configuração do Banco de Dados (Neon)

1. Acesse: https://neon.com/
2. Crie um novo projeto ou use um existente
3. Copie a DATABASE_URL fornecida
4. Configure no Railway como variável de ambiente

## URLs Esperadas

- Frontend: https://humaniq-ai.netlify.app
- Backend: https://humaniq-ai-production.up.railway.app
- Database: Neon (connection string)

## Testes Pós-Deploy

Após todos os deploys, teste:
1. Acesso ao frontend
2. Login/registro de usuários
3. Chamadas à API
4. Conexão com banco de dados

## Arquivos de Configuração

- `netlify.toml`: Configuração do Netlify
- `vercel.json`: Configuração do Vercel (se necessário)
- `.env.production`: Variáveis de ambiente para produção