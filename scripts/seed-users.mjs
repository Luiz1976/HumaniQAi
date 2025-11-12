import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

// Caminho do banco SQLite local
const dbPath = 'humaniq-dev.db';
const sqlite = new Database(dbPath);

function ensureTables() {
  // Apenas cria se não existirem (espelha estrutura mínima necessária)
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
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS empresas (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      nome_empresa TEXT NOT NULL,
      email_contato TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      ativo BOOLEAN DEFAULT 1,
      configuracoes TEXT DEFAULT '{}',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function upsertAdmin(email, nome, senhaPlano) {
  const stmt = sqlite.prepare('SELECT id FROM admins WHERE email = ?');
  const existing = stmt.get(email);
  if (existing) {
    console.log(`Admin já existe: ${email}`);
    return existing.id;
  }
  const hash = await bcrypt.hash(senhaPlano, 10);
  const insert = sqlite.prepare('INSERT INTO admins (email, nome, senha) VALUES (?, ?, ?)');
  insert.run(email, nome, hash);
  console.log(`Admin inserido: ${email}`);
}

async function upsertEmpresa(emailContato, nomeEmpresa, senhaPlano) {
  const stmt = sqlite.prepare('SELECT id FROM empresas WHERE email_contato = ?');
  const existing = stmt.get(emailContato);
  if (existing) {
    console.log(`Empresa já existe: ${emailContato}`);
    return existing.id;
  }
  const hash = await bcrypt.hash(senhaPlano, 10);
  const insert = sqlite.prepare('INSERT INTO empresas (nome_empresa, email_contato, senha, ativo, configuracoes) VALUES (?, ?, ?, 1, ?)');
  insert.run(nomeEmpresa, emailContato, hash, JSON.stringify({ seeded: true }));
  console.log(`Empresa inserida: ${emailContato}`);
}

async function main() {
  ensureTables();
  await upsertAdmin('admin@humaniq.com', 'Admin', 'Luiz@1976');
  await upsertEmpresa('luiz@humaniq.com', 'Humaniq', 'Luiz@1222');
  console.log('Seed concluído