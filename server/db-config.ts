import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';
import { randomUUID } from 'crypto';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Escolher banco baseado no ambiente
const isProduction = process.env.NODE_ENV === 'production';
const hasDatabaseUrl = !!process.env.DATABASE_URL;

export let db: any;
export let dbType: string;

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
    const Database = require('better-sqlite3');
    const { drizzle } = require('drizzle-orm/better-sqlite3');

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

// Função para executar migrações
export async function runMigrations() {
  try {
    console.log(`🔄 Executando migrações ${dbType}...`);

    if (dbType.includes('SQLite')) {
      // Executar migrações SQLite
      const { runMigrations: runSQLiteMigrations } = await import('./db-sqlite');
      await runSQLiteMigrations();
    } else {
      // Para PostgreSQL, assumir que as tabelas já existem
      console.log('✅ PostgreSQL: assumindo que as tabelas já existem');
    }

    console.log(`✅ Migrações ${dbType} concluídas com sucesso!`);
  } catch (error) {
    console.error(`❌ Erro ao executar migrações:`, error);
    throw error;
  }
}