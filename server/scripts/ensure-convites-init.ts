// Inicializa tabelas de convites no SQLite de desenvolvimento
import dotenv from 'dotenv';
dotenv.config();

import { ensureConvitesTables } from '../init-convites-sqlite';

async function main() {
  try {
    await ensureConvitesTables();
    console.log('✅ Tabelas de convites inicializadas.');
    process.exit(0);
  } catch (e) {
    console.error('❌ Falha ao inicializar tabelas de convites:', e);
    process.exit(1);
  }
}

main();