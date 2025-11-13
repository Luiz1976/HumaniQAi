# 🔄 Changelog - HumaniQ

Este arquivo documenta todas as alterações significativas realizadas no projeto HumaniQ.

---

## 📅 13/11/2025 - Implementação de Porta 5000 Obrigatória

### 🔒 Requisito de Porta Fixa Implementado
**Motivo**: O frontend deve rodar exclusivamente na porta 5000 para garantir consistência no ambiente de desenvolvimento e produção.

### 🛠️ Alterações Realizadas

#### 1. Scripts de Gerenciamento de Porta
- **`scripts/manage-port-5000.ps1`**: Script PowerShell completo para gerenciamento da porta 5000
  - Verificação de disponibilidade da porta
  - Encerramento de processos existentes
  - Logs detalhados em `logs/port-5000.log`
  - Múltiplos modos de operação: check, prepare, force-stop, wait

- **`scripts/start-frontend.ps1`**: Script de inicialização do frontend com garantia de porta 5000
  - Testa disponibilidade da porta antes de iniciar
  - Encerra processos conflitantes automaticamente
  - Registra eventos de inicialização
  - Opção de forçar reinicialização com flag `-Force`

#### 2. Configuração do Package.json
Novos scripts adicionados:
```json
{
  "port:check": "powershell -ExecutionPolicy Bypass -File scripts/manage-port-5000.ps1 -Action check",
  "port:prepare": "powershell -ExecutionPolicy Bypass -File scripts/manage-port-5000.ps1 -Action prepare",
  "port:force-stop": "powershell -ExecutionPolicy Bypass -File scripts/manage-port-5000.ps1 -Action force-stop",
  "frontend:force": "powershell -ExecutionPolicy Bypass -File scripts/start-frontend.ps1 -Force"
}
```

#### 3. Configuração do Vite
- **`vite.config.ts`**: Atualizado com configuração fixa de porta
  - `port: 5000` - Define porta fixa
  - `strictPort: true` - Impede fallback para outras portas
  - Proxy configurado para `http://localhost:5000`

#### 4. Variáveis de Ambiente
- **`.env`**: Atualizado com configurações de porta
  - `VITE_API_URL=http://localhost:5000`
  - `PORT=5000`

#### 5. Documentação
- **`README.md`**: Adicionada seção completa sobre requisito de porta 5000
  - Instruções de uso dos novos scripts
  - Configuração necessária
  - Solução de problemas comuns

### 📋 Comandos Disponíveis

```bash
# Verificar disponibilidade da porta 5000
npm run port:check

# Preparar porta (encerrar processos existentes)
npm run port:prepare

# Forçar encerramento de processos
npm run port:force-stop

# Iniciar frontend com garantia de porta 5000
npm run frontend:force

# Iniciar normalmente (com verificação automática)
npm run dev
```

### 🔍 Solução de Problemas

**Erro: "Port 5000 is already in use"**
1. Execute `npm run port:prepare` para liberar a porta
2. Use `npm run frontend:force` para iniciar com garantia
3. Verifique logs em `logs/port-5000.log` para detalhes

**Processos que podem estar usando a porta 5000:**
- Aplicações web anteriores
- Servidores de desenvolvimento
- Outras instâncias do HumaniQ
- Sistemas de cache ou proxy

### ✅ Validação Implementada

O sistema agora garante que:
1. ✅ Frontend sempre inicia na porta 5000
2. ✅ Processos conflitantes são automaticamente encerrados
3. ✅ Logs detalhados são gerados para auditoria
4. ✅ Scripts funcionam em ambiente Windows/PowerShell
5. ✅ Configuração é aplicada tanto em desenvolvimento quanto produção

---

## 📅 13/11/2025 - Correção de Inconsistência QVT

### 🐛 Problema Identificado
Os resultados do teste HumaniQ QVT (Qualidade de Vida no Trabalho) apresentavam inconsistência entre os dados JSON e a exibição na interface:
- **JSON**: Mostrava valores corretos (pontuacaoTotal: 3.34, percentual: 66.8%, categoria: "Regular")
- **UI**: Exibia "N/A%" e "Não definido"

### 🔍 Causa Raiz
Inconsistência de nomenclatura entre campos:
- **TypeScript**: Usava camelCase (`indiceGeral`, `nivelGeral`, `percentualGeral`)
- **Banco de Dados**: Usava snake_case (`indice_geral`, `nivel_geral`, `percentual_geral`)
- **Componente**: Tentava acessar ambos os formatos com lógica de fallback incorreta

### ✅ Solução Implementada
- **`src/components/ResultadoQVT.tsx`**: Reescrito completo
  - Removida toda lógica de fallback para snake_case
  - Utilização exclusiva dos campos camelCase do tipo ResultadoQVT
  - Correção da lógica de processamento de `pontosFortes` e `dimensoesCriticas`
  - Mantida toda funcionalidade existente

### 🧪 Testes Criados
- **`src/lib/testes/__tests__/qvt-correcao.test.ts`**: Testes unitários abrangentes
  - Validação da estrutura de dados QVT
  - Teste com valores zero/nulos
  - Verificação da resolução de inconsistências
  - Validação do formato de metadados

### 📊 Resultado
- ✅ Inconsistência completamente resolvida
- ✅ Dados JSON e UI agora estão sincronizados
- ✅ Todos os testes passando (4/4)
- ✅ Funcionalidade preservada para todos os outros testes

---

## 📅 [Data Anterior] - Migração para PostgreSQL

### 🔄 Alterações Anteriores
- Migração completa do banco de dados SQLite para PostgreSQL
- Implementação de sistema hierárquico (Admin → Empresa → Colaborador)
- Adição de 7 testes psicológicos validados
- Sistema de convites com tokens seguros
- Autenticação JWT com refresh tokens

---

## 📝 Notas de Versão

### Próximos Passos
- [ ] Implementar testes automatizados para todos os testes psicológicos
- [ ] Adicionar monitoramento de performance
- [ ] Criar dashboard administrativo completo
- [ ] Implementar notificações em tempo real

### Dependências de Segurança
- Manter todas as variáveis de ambiente em `.env` (nunca commitar valores reais)
- Usar apenas `sk-xxx` ou placeholders em documentação
- Implementar rate limiting para APIs públicas
- Manter logs de auditoria para ações críticas

---

**🎯 Última Atualização**: 13/11/2025  
**✅ Versão Atual**: v1.2.0