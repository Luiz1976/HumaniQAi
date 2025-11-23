import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// Sanitização da DATABASE_URL para evitar crashes em produção
function sanitizeDatabaseUrl(raw?: string): string | null {
  if (!raw) return null;
  // Remover possível prefixo "psql " e aspas simples/duplas ao redor
  const trimmed = raw.trim().replace(/^psql\s+/, '').replace(/^['"]|['"]$/g, '');
  try {
    // Validar formato com URL
    const u = new URL(trimmed);
    if (!u.protocol.startsWith('postgres')) return null;
    return trimmed;
  } catch {
    return null;
  }
}

const dbUrl = sanitizeDatabaseUrl(process.env.DATABASE_URL);

if (!dbUrl) {
  throw new Error('DATABASE_URL ausente ou inválida. Use uma URL PostgreSQL válida, ex: postgresql://user:pass@host/db?sslmode=require');
}

const client = postgres(dbUrl, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
});

const db = drizzle(client, { schema });

export { db, client };
