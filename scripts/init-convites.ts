import Database from 'better-sqlite3';

// Inicializa tabelas de convites no SQLite de desenvolvimento
function ensureConvitesTables() {
  const sqlite = new Database('humaniq-dev.db');
  sqlite.pragma('journal_mode = WAL');

  // convites_empresa
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
      admin_id TEXT,
      validade TEXT NOT NULL,
      status TEXT DEFAULT 'pendente',
      metadados TEXT DEFAULT '{}',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_convites_empresa_token ON convites_empresa (token);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_convites_empresa_status ON convites_empresa (status);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_convites_empresa_validade ON convites_empresa (validade);`);

  // convites_colaborador
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS convites_colaborador (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      token TEXT UNIQUE NOT NULL,
      nome TEXT NOT NULL,
      email TEXT NOT NULL,
      cargo TEXT,
      departamento TEXT,
      empresa_id TEXT,
      validade TEXT NOT NULL,
      status TEXT DEFAULT 'pendente',
      metadados TEXT DEFAULT '{}',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_convites_colaborador_token ON convites_colaborador (token);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_convites_colaborador_empresa_id ON convites_colaborador (empresa_id);`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_convites_colaborador_validade ON convites_colaborador (validade);`);

  console.log('✅ [SQLite] Tabelas de convites garantidas com sucesso.');
}

ensureConvitesTables();