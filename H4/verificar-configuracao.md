# Verificação da Configuração de API

## Problema Identificado
O frontend está fazendo chamadas diretas para a antiga URL do Render (`https://h2-8xej.onrender.com`) ao invés de usar os redirects configurados no Netlify.

## Causa Raiz
A variável de ambiente `VITE_API_URL` está configurada no Netlify com o valor da antiga URL do Render, fazendo com que o serviço de API (`src/services/apiService.ts:5`) use esse valor diretamente, ignorando os redirects.

## Solução
**Opção 1 (Recomendada):** Remover a variável `VITE_API_URL` do Netlify
- Acesse: https://app.netlify.com/sites/humaniqai/settings/deploys#environment-variables
- Encontre a variável `VITE_API_URL` 
- Clique em "Edit" e depois "Delete"
- Isso fará o frontend usar URLs relativas e respeitar os redirects

**Opção 2:** Atualizar a variável para a URL correta do Railway
- Altere o valor de `VITE_API_URL` para: `https://humaniqai-server.up.railway.app`
- Isso fará o frontend acessar diretamente o Railway

## Configuração Atual (Correta)
- `netlify.toml` já está configurado com os redirects corretos
- O arquivo `_redirects` também está correto
- A lógica de fallback no `apiService.ts` está implementada

## Próximos Passos
1. Acesse o dashboard do Netlify
2. Remova ou atualize a variável `VITE_API_URL`
3. Faça um novo deploy
4. Teste o acesso aos resultados novamente

## Teste Rápido
Após a correção, teste esta URL:
`https://www.humaniqai.com.br/api/health`

Deve retornar a resposta do Railway, não mais o erro 403 do Render.