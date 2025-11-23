# Configuração Neon Database - Humaniq AI

## Passos para Configuração

### 1. Criar Projeto no Neon
1. Acesse: https://neon.com/
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Nome do projeto: `humaniq-ai`
5. Região: Escolha a mais próxima (us-east-1 recomendado)
6. PostgreSQL Version: 15 ou superior

### 2. Configurar Banco de Dados

#### SQL de Criação de Tabelas Principais

```sql
-- Criar schema principal
CREATE SCHEMA IF NOT EXISTS humaniq;

-- Tabela de Empresas
CREATE TABLE humaniq.empresas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20),
    telefone VARCHAR(20),
    endereco TEXT,
    plano VARCHAR(50) DEFAULT 'trial',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Colaboradores
CREATE TABLE humaniq.colaboradores (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES humaniq.empresas(id),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    cpf VARCHAR(14),
    telefone VARCHAR(20),
    cargo VARCHAR(100),
    departamento VARCHAR(100),
    data_admissao DATE,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(empresa_id, email)
);

-- Tabela de Testes/Questionários
CREATE TABLE humaniq.testes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50) NOT NULL,
    duracao_minutos INTEGER DEFAULT 30,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Resultados
CREATE TABLE humaniq.resultados (
    id SERIAL PRIMARY KEY,
    colaborador_id INTEGER REFERENCES humaniq.colaboradores(id),
    teste_id INTEGER REFERENCES humaniq.testes(id),
    data_realizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pontuacao_total DECIMAL(10,2),
    nivel_risco VARCHAR(50),
    resultado_completo JSONB,
    observacoes TEXT,
    status VARCHAR(50) DEFAULT 'completo'
);

-- Tabela de Convites
CREATE TABLE humaniq.convites (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES humaniq.empresas(id),
    codigo VARCHAR(255) UNIQUE NOT NULL,
    email_destinatario VARCHAR(255),
    tipo VARCHAR(50) NOT NULL,
    validade TIMESTAMP NOT NULL,
    utilizado BOOLEAN DEFAULT false,
    data_utilizacao TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_empresas_email ON humaniq.empresas(email);
CREATE INDEX idx_colaboradores_empresa ON humaniq.colaboradores(empresa_id);
CREATE INDEX idx_colaboradores_email ON humaniq.colaboradores(email);
CREATE INDEX idx_resultados_colaborador ON humaniq.resultados(colaborador_id);
CREATE INDEX idx_resultados_teste ON humaniq.resultados(teste_id);
CREATE INDEX idx_convites_codigo ON humaniq.convites(codigo);
CREATE INDEX idx_convites_empresa ON humaniq.convites(empresa_id);
```

### 3. Configurar Conexão

#### Variáveis de Ambiente para Railway
```env
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/humaniq_db?sslmode=require
```

#### Testar Conexão
```bash
# Testar via psql
psql $DATABASE_URL

# Ou via Node.js
npm install pg
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('Erro:', err);
  else console.log('Conexão bem-sucedida:', res.rows[0]);
  pool.end();
});
"
```

### 4. Configurar RLS (Row Level Security)

```sql
-- Habilitar RLS nas tabelas
ALTER TABLE humaniq.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE humaniq.colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE humaniq.resultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE humaniq.convites ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar conforme necessário)
CREATE POLICY "empresas_select_all" ON humaniq.empresas FOR SELECT USING (true);
CREATE POLICY "colaboradores_select_empresa" ON humaniq.colaboradores FOR SELECT USING (empresa_id = current_setting('app.current_empresa_id')::integer);
CREATE POLICY "resultados_select_colaborador" ON humaniq.resultados FOR SELECT USING (colaborador_id = current_setting('app.current_colaborador_id')::integer);
```

### 5. Backup e Monitoramento

#### Configurar Backup Automático
- Neon já faz backups automáticos
- Configurar retenção de 30 dias
- Testar restore periodicamente

#### Monitorar Performance
- Verificar slow queries
- Monitorar índices não utilizados
- Ajustar configurações de memória

### 6. Integração com Railway

1. No dashboard do Railway, vá para sua aplicação
2. Adicione a variável `DATABASE_URL` nas Settings
3. Teste a conexão reiniciando o serviço
4. Verifique os logs para confirmar conexão bem-sucedida