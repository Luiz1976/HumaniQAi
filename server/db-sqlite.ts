import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../shared/schema';
import { hashPassword } from './utils/auth';
import path from 'path';

// Criar banco SQLite local para desenvolvimento
const sqlite = new Database('humaniq-dev.db');
export { sqlite };

// Configurar WAL mode para melhor performance
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });

// Função para executar migrações
export async function runMigrations() {
  try {
    console.log('🔄 Executando migrações SQLite...');
    
    // Criar tabelas básicas se não existirem
    await createTables();
    // Garantir colunas obrigatórias conforme schema compartilhado
    await ensureRequiredColumns();
    // Seed de desenvolvimento (admin padrão)
    await seedDevAdmin();
    // Seed de desenvolvimento (empresa padrão, via .env)
    await seedDevEmpresa();
    
    console.log('✅ Migrações SQLite concluídas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar migrações:', error);
    throw error;
  }
}

// Função para criar tabelas básicas
async function createTables() {
  // Criar tabela admins
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      email TEXT UNIQUE NOT NULL,
      nome TEXT NOT NULL,
      senha TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Criar tabela empresas
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS empresas (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      nome_empresa TEXT NOT NULL,
      email_contato TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      cnpj TEXT,
      endereco TEXT,
      setor TEXT,
      numero_colaboradores INTEGER,
      dias_acesso INTEGER,
      data_expiracao TEXT,
      admin_id TEXT REFERENCES admins(id),
      -- Observação: no schema compartilhado o campo é 'ativa'. Mantemos 'ativo' para retrocompatibilidade
      ativo BOOLEAN DEFAULT 1,
      -- Campos adicionais alinhados ao schema compartilhado
      configuracoes TEXT DEFAULT '{}',
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      stripe_price_id TEXT,
      plano TEXT,
      status_assinatura TEXT DEFAULT 'inativo',
      token_convite TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Criar tabela colaboradores
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS colaboradores (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      cargo TEXT,
      departamento TEXT,
      avatar TEXT,
      empresa_id TEXT REFERENCES empresas(id),
      permissoes TEXT DEFAULT '{}',
      ativo BOOLEAN DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Criar tabela testes
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS testes (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      nome TEXT NOT NULL,
      descricao TEXT,
      categoria TEXT,
      instrucoes TEXT,
      tempo_estimado INTEGER,
      ativo BOOLEAN DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Criar tabela resultados (usada pelo PGR)
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS resultados (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      teste_id TEXT REFERENCES testes(id),
      usuario_id TEXT,
      pontuacao_total REAL,
      tempo_gasto INTEGER,
      data_realizacao TEXT DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'concluido' NOT NULL,
      metadados TEXT,
      session_id TEXT,
      user_agent TEXT,
      ip_address TEXT,
      colaborador_id TEXT REFERENCES colaboradores(id),
      empresa_id TEXT REFERENCES empresas(id),
      user_email TEXT
    );
  `);

  // Criar tabela perguntas
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS perguntas (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      teste_id TEXT REFERENCES testes(id) ON DELETE CASCADE,
      texto TEXT NOT NULL,
      tipo TEXT NOT NULL,
      opcoes TEXT,
      escala_min INTEGER,
      escala_max INTEGER,
      obrigatoria BOOLEAN DEFAULT 1,
      ordem INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_perguntas_teste_id ON perguntas(teste_id);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_perguntas_ordem ON perguntas(teste_id, ordem);`);

  // Criar tabela respostas
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS respostas (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      resultado_id TEXT REFERENCES resultados(id) ON DELETE CASCADE,
      pergunta_id TEXT REFERENCES perguntas(id) ON DELETE CASCADE,
      valor TEXT NOT NULL,
      pontuacao INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_respostas_resultado_id ON respostas(resultado_id);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_respostas_pergunta_id ON respostas(pergunta_id);`);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS teste_disponibilidade (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      colaborador_id TEXT REFERENCES colaboradores(id) ON DELETE CASCADE NOT NULL,
      teste_id TEXT REFERENCES testes(id) ON DELETE CASCADE NOT NULL,
      empresa_id TEXT REFERENCES empresas(id) ON DELETE CASCADE NOT NULL,
      disponivel BOOLEAN DEFAULT 1 NOT NULL,
      periodicidade_dias INTEGER,
      ultima_liberacao TEXT,
      proxima_disponibilidade TEXT,
      historico_liberacoes TEXT DEFAULT '[]',
      metadados TEXT DEFAULT '{}',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_teste_disp_colaborador_id ON teste_disponibilidade(colaborador_id);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_teste_disp_teste_id ON teste_disponibilidade(teste_id);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_teste_disp_empresa_id ON teste_disponibilidade(empresa_id);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_teste_disp_disponivel ON teste_disponibilidade(disponivel);`);
  sqlite.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_teste_disp_colab_teste_unique ON teste_disponibilidade(colaborador_id, teste_id);`);

  // Criar tabela convites_empresa
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS convites_empresa (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      token TEXT UNIQUE NOT NULL,
      nome_empresa TEXT NOT NULL,
      email_contato TEXT NOT NULL,
      telefone TEXT,
      cnpj TEXT,
      numero_colaboradores INTEGER,
      dias_acesso INTEGER,
      admin_id TEXT REFERENCES admins(id),
      validade TEXT NOT NULL,
      status TEXT DEFAULT 'pendente' NOT NULL,
      metadados TEXT DEFAULT '{}',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  // Índices para convites_empresa
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_convites_empresa_token ON convites_empresa(token);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_convites_empresa_status ON convites_empresa(status);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_convites_empresa_validade ON convites_empresa(validade);`);

  // Criar tabela convites_colaborador
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS convites_colaborador (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      token TEXT UNIQUE NOT NULL,
      nome TEXT NOT NULL,
      email TEXT NOT NULL,
      cargo TEXT,
      departamento TEXT,
      empresa_id TEXT REFERENCES empresas(id) ON DELETE CASCADE,
      validade TEXT NOT NULL,
      status TEXT DEFAULT 'pendente' NOT NULL,
      metadados TEXT DEFAULT '{}',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  // Índices para convites_colaborador
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_convites_colaborador_token ON convites_colaborador(token);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_convites_colaborador_empresa_id ON convites_colaborador(empresa_id);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_convites_colaborador_status ON convites_colaborador(status);`);

  
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS curso_disponibilidade (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      colaborador_id TEXT REFERENCES colaboradores(id) ON DELETE CASCADE NOT NULL,
      curso_id TEXT NOT NULL,
      empresa_id TEXT REFERENCES empresas(id) ON DELETE CASCADE NOT NULL,
      disponivel BOOLEAN DEFAULT 0 NOT NULL,
      periodicidade_dias INTEGER,
      ultima_liberacao TEXT,
      proxima_disponibilidade TEXT,
      liberado_por TEXT,
      historico_liberacoes TEXT DEFAULT '[]',
      metadados TEXT DEFAULT '{}',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_curso_disp_colaborador_id ON curso_disponibilidade(colaborador_id);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_curso_disp_curso_id ON curso_disponibilidade(curso_id);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_curso_disp_empresa_id ON curso_disponibilidade(empresa_id);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_curso_disp_disponivel ON curso_disponibilidade(disponivel);`);
  sqlite.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_curso_disp_colab_curso_unique ON curso_disponibilidade(colaborador_id, curso_id);`);

  
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS curso_progresso (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      colaborador_id TEXT REFERENCES colaboradores(id) ON DELETE CASCADE NOT NULL,
      curso_id TEXT NOT NULL,
      curso_slug TEXT NOT NULL,
      modulos_completados TEXT DEFAULT '[]' NOT NULL,
      total_modulos INTEGER NOT NULL,
      progresso_porcentagem INTEGER DEFAULT 0 NOT NULL,
      avaliacao_final_realizada BOOLEAN DEFAULT 0 NOT NULL,
      avaliacao_final_pontuacao INTEGER,
      tentativas_avaliacao INTEGER DEFAULT 0 NOT NULL,
      data_inicio TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      data_ultima_atualizacao TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      data_conclusao TEXT,
      metadados TEXT DEFAULT '{}',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_curso_progresso_colaborador_id ON curso_progresso(colaborador_id);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_curso_progresso_curso_id ON curso_progresso(curso_id);`);
  sqlite.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_curso_progresso_colab_curso_unique ON curso_progresso(colaborador_id, curso_id);`);

  
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS curso_avaliacoes (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      colaborador_id TEXT REFERENCES colaboradores(id) ON DELETE CASCADE NOT NULL,
      curso_id TEXT NOT NULL,
      curso_slug TEXT NOT NULL,
      respostas TEXT,
      pontuacao INTEGER,
      total_questoes INTEGER,
      aprovado BOOLEAN DEFAULT 0 NOT NULL,
      tempo_gasto INTEGER,
      metadados TEXT DEFAULT '{}',
      data_realizacao TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_curso_avaliacoes_colaborador_id ON curso_avaliacoes(colaborador_id);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_curso_avaliacoes_curso_id ON curso_avaliacoes(curso_id);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_curso_avaliacoes_aprovado ON curso_avaliacoes(aprovado);`);

  
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS curso_certificados (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      colaborador_id TEXT REFERENCES colaboradores(id) ON DELETE CASCADE NOT NULL,
      curso_id TEXT NOT NULL,
      curso_slug TEXT NOT NULL,
      curso_titulo TEXT,
      colaborador_nome TEXT,
      carga_horaria INTEGER,
      data_emissao TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
      codigo_autenticacao TEXT UNIQUE,
      qr_code_url TEXT,
      assinatura_digital TEXT,
      validado BOOLEAN DEFAULT 1 NOT NULL,
      metadados TEXT DEFAULT '{}'
    );
  `);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_curso_cert_colaborador_id ON curso_certificados(colaborador_id);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_curso_cert_curso_id ON curso_certificados(curso_id);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_curso_cert_codigo ON curso_certificados(codigo_autenticacao);`);

  console.log('📊 Tabelas SQLite criadas com sucesso!');
}


// Garantir colunas requeridas quando a tabela já existe
async function ensureRequiredColumns() {
  // Helper para checar colunas existentes
  const hasColumn = (table: string, column: string) => {
    const stmt = sqlite.prepare(`PRAGMA table_info(${table})`);
    const cols = stmt.all() as Array<{ name: string }>;
    return cols.some((c) => c.name === column);
  };

  // Empresas: colunas conforme shared/schema.ts
  const empresasCols: Array<[string, string]> = [
    ['configuracoes', "ALTER TABLE empresas ADD COLUMN configuracoes TEXT DEFAULT '{}'"],
    ['stripe_customer_id', 'ALTER TABLE empresas ADD COLUMN stripe_customer_id TEXT'],
    ['stripe_subscription_id', 'ALTER TABLE empresas ADD COLUMN stripe_subscription_id TEXT'],
    ['stripe_price_id', 'ALTER TABLE empresas ADD COLUMN stripe_price_id TEXT'],
    ['plano', 'ALTER TABLE empresas ADD COLUMN plano TEXT'],
    ['status_assinatura', "ALTER TABLE empresas ADD COLUMN status_assinatura TEXT DEFAULT 'inativo'"],
    ['token_convite', 'ALTER TABLE empresas ADD COLUMN token_convite TEXT'],
    // Campo lógico equivalente a "ativa" no schema; manter ambos se necessário
    ['ativa', 'ALTER TABLE empresas ADD COLUMN ativa BOOLEAN DEFAULT 1']
  ];
  for (const [name, alterSql] of empresasCols) {
    try {
      if (!hasColumn('empresas', name)) sqlite.exec(alterSql);
    } catch (e) {
      // Ignorar se a coluna já existir ou se houver limitações
      console.warn(`[SQLite] Aviso ao adicionar coluna ${name} em empresas:`, (e as any)?.message);
    }
  }

  // Colaboradores: colunas adicionais
  const colaboradoresCols: Array<[string, string]> = [
    ['avatar', 'ALTER TABLE colaboradores ADD COLUMN avatar TEXT'],
    ['permissoes', "ALTER TABLE colaboradores ADD COLUMN permissoes TEXT DEFAULT '{}'"],
  ];
  for (const [name, alterSql] of colaboradoresCols) {
    try {
      if (!hasColumn('colaboradores', name)) sqlite.exec(alterSql);
    } catch (e) {
      console.warn(`[SQLite] Aviso ao adicionar coluna ${name} em colaboradores:`, (e as any)?.message);
    }
  }

  // Testes: instrucoes
  if (!hasColumn('testes', 'instrucoes')) {
    try { sqlite.exec('ALTER TABLE testes ADD COLUMN instrucoes TEXT'); } catch (e) {
      console.warn(`[SQLite] Aviso ao adicionar coluna instrucoes em testes:`, (e as any)?.message);
    }
  }
}

// Seed de desenvolvimento: cria um admin padrão se não existir
async function seedDevAdmin() {
  try {
    const seedEmail = process.env.SEED_ADMIN_EMAIL || 'admin.dev@local.test';
    const seedNome = process.env.SEED_ADMIN_NOME || 'Admin Dev';
    const seedSenha = process.env.SEED_ADMIN_SENHA || 'Admin123!';
    const countStmt = sqlite.prepare('SELECT COUNT(1) as c FROM admins WHERE email = ?');
    const exists = countStmt.get(seedEmail) as { c: number } | undefined;
    if (!exists || exists.c === 0) {
      const senhaHash = await hashPassword(seedSenha);
      const insertStmt = sqlite.prepare('INSERT INTO admins (email, nome, senha) VALUES (?, ?, ?)');
      insertStmt.run(seedEmail, seedNome, senhaHash);
      console.log(`🌱 [SQLite] Admin de desenvolvimento criado: ${seedEmail}`);
    }
  } catch (e) {
    console.warn('⚠️ [SQLite] Falha ao criar admin de desenvolvimento:', (e as any)?.message);
  }
}

// Seed de desenvolvimento: cria uma empresa padrão se configurada via .env
async function seedDevEmpresa() {
  try {
    const seedEmail = process.env.SEED_EMPRESA_EMAIL;
    const seedNomeEmpresa = process.env.SEED_EMPRESA_NOME_EMPRESA;
    const seedSenha = process.env.SEED_EMPRESA_SENHA;

    if (!seedEmail || !seedNomeEmpresa || !seedSenha) {
      console.log('ℹ️ [SQLite] Seed de empresa não configurado (defina SEED_EMPRESA_EMAIL, SEED_EMPRESA_NOME_EMPRESA, SEED_EMPRESA_SENHA)');
      return;
    }

    const countStmt = sqlite.prepare('SELECT COUNT(1) as c FROM empresas WHERE email_contato = ?');
    const exists = countStmt.get(seedEmail) as { c: number } | undefined;
    if (!exists || exists.c === 0) {
      const senhaHash = await hashPassword(seedSenha);
      const insertStmt = sqlite.prepare('INSERT INTO empresas (nome_empresa, email_contato, senha, ativo, configuracoes) VALUES (?, ?, ?, 1, ?)');
      insertStmt.run(seedNomeEmpresa, seedEmail, senhaHash, JSON.stringify({ seeded: true }));
      console.log(`🌱 [SQLite] Empresa de desenvolvimento criada: ${seedEmail} (${seedNomeEmpresa})`);
    }
  } catch (e) {
    console.warn('⚠️ [SQLite] Falha ao criar empresa de desenvolvimento:', (e as any)?.message);
  }
}
