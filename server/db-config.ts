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

if (isProduction) {
  if (hasDatabaseUrl) {
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
      db = null as any;
      dbType = 'PostgreSQL (indisponível)';
    }
  } else {
    console.warn('⚠️ DATABASE_URL ausente em produção. Banco indisponível.');
    db = null as any;
    dbType = 'PostgreSQL (indisponível)';
  }
} else {
  const devDbType = (process.env.DATABASE_TYPE || 'sqlite').toLowerCase();
  if (devDbType === 'postgres' && hasDatabaseUrl) {
    console.log('🔗 Conectando ao PostgreSQL (dev)...');
    try {
      const client = postgres(normalizeDatabaseUrl(process.env.DATABASE_URL!), {
        max: 10,
        idle_timeout: 10,
        connect_timeout: 10,
      });
      db = drizzlePostgres(client, { schema });
      dbType = 'PostgreSQL (dev)';
      console.log('✅ PostgreSQL (dev) inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar PostgreSQL (dev):', error);
      db = null as any;
      dbType = 'PostgreSQL (indisponível)';
    }
  } else {
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
      db = null as any;
      dbType = 'SQLite (indisponível)';
    }
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
      if (process.env.NODE_ENV !== 'production') {
        const { runMigrations: runSQLiteMigrations } = await import('./db-sqlite');
        await runSQLiteMigrations();
      } else {
        console.log('⚠️ Tentativa de executar migrações SQLite em produção - ignorado');
      }
    } else if (dbType.includes('PostgreSQL')) {
      await pingPostgresWithRetry(3, 5000);
      await ensureTablesPostgres();
      console.log('✅ PostgreSQL disponível');
    } else {
      console.warn('⚠️ Banco de dados indisponível, migrações ignoradas');
    }
    console.log(`✅ Migrações ${dbType} concluídas com sucesso!`);
  } catch (error) {
    console.error(`❌ Erro ao executar migrações:`, error);
    throw error;
  }
}

async function pingPostgresWithRetry(retries: number, delayMs: number) {
  const url = process.env.DATABASE_URL;
  if (!url) return;
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      const client = postgres(normalizeDatabaseUrl(url), { idle_timeout: 5, connect_timeout: 5, max: 1 });
      await client`select 1`;
      await client.end();
      return;
    } catch (e) {
      lastError = e;
      await new Promise(res => setTimeout(res, Math.max(100, delayMs)));
    }
  }
  throw lastError;
}

async function ensureTablesPostgres() {
  if (!process.env.DATABASE_URL) return;
  try {
    const client = postgres(normalizeDatabaseUrl(process.env.DATABASE_URL), { max: 1 });
    // Criar tabela visitas_landing se não existir (auto-fix para produção)
    await client`
      CREATE TABLE IF NOT EXISTS visitas_landing (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_agent text,
        origem varchar(255),
        created_at timestamp with time zone DEFAULT now() NOT NULL
      );
    `;
    await client`CREATE INDEX IF NOT EXISTS idx_visitas_landing_created_at ON visitas_landing(created_at);`;
    await client.end();
    console.log('✅ Tabela visitas_landing verificada/criada no PostgreSQL');
  } catch (err) {
    console.warn('⚠️ Falha ao criar tabelas automáticas no Postgres:', err);
  }
}
