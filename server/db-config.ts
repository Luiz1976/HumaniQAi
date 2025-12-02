import { drizzle } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import Database from 'better-sqlite3';
import * as schema from '../shared/schema';
import { randomUUID } from 'crypto';

// Escolher banco baseado no ambiente
const isProduction = process.env.NODE_ENV === 'production';
const hasDatabaseUrl = !!process.env.DATABASE_URL;

let db: any;
let dbType: string;
let initialized = false;

function normalizeDatabaseUrl(input: string): string {
  let s = input.trim();
  s = s.replace(/^psql\s+/, '');
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }
  const match = s.match(/postgres(?:ql)?:\/\/[^\s]+/i);
  if (match) s = match[0];
  try {
    const u = new URL(s);
    u.searchParams.delete('channel_binding');
    if (!u.searchParams.has('sslmode')) u.searchParams.set('sslmode', 'require');
    return u.toString();
  } catch {
    return s;
  }
}

// Lazy initialization function
function initializeDatabase() {
  if (initialized) return;

  console.log('🔄 Inicializando conexão com banco de dados...');

  if (isProduction && hasDatabaseUrl) {
    // Usar PostgreSQL em produção (postgres-js)
    console.log('🔗 Conectando ao PostgreSQL (postgres-js)...');

    try {
      const client = postgres(normalizeDatabaseUrl(process.env.DATABASE_URL!), {
        max: 20,
        idle_timeout: 20,
        connect_timeout: 10,
      });

      db = drizzlePostgres(client, { schema });
      dbType = 'PostgreSQL (postgres-js)';
      console.log('✅ PostgreSQL inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar PostgreSQL:', error);
      throw error;
    }
  } else {
    // Usar SQLite em desenvolvimento
    console.log('🔗 Conectando ao SQLite (desenvolvimento)...');

    try {
      const sqlite = new Database('humaniq-dev.db');
      sqlite.pragma('journal_mode = WAL');
      sqlite.function('gen_random_uuid', () => randomUUID());

      db = drizzle(sqlite, { schema });
      dbType = 'SQLite (desenvolvimento)';
      console.log('✅ SQLite inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar SQLite:', error);
      throw error;
    }
  }

  initialized = true;
}

// Getter que garante inicialização lazy
function getDb() {
  if (!initialized) {
    initializeDatabase();
  }
  return db;
}

function getDbType() {
  if (!initialized) {
    initializeDatabase();
  }
  return dbType;
}

// Função para executar migrações
export async function runMigrations() {
  try {
    // Garantir que o DB está inicializado antes de migrar
    const currentDbType = getDbType();
    console.log(`🔄 Executando migrações ${currentDbType}...`);

    if (currentDbType.includes('SQLite')) {
      // Executar migrações SQLite
      const { runMigrations: runSQLiteMigrations } = await import('./db-sqlite');
      await runSQLiteMigrations();
    } else {
      // Para PostgreSQL, assumir que as tabelas já existem
      console.log('✅ PostgreSQL: assumindo que as tabelas já existem');
    }

    console.log(`✅ Migrações ${currentDbType} concluídas com sucesso!`);
  } catch (error) {
    console.error(`❌ Erro ao executar migrações:`, error);
    throw error;
  }
}

// Export usando getters
export { getDb as db, getDbType as dbType };