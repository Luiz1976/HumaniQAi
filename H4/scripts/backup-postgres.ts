import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Lê DATABASE_URL do ambiente
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL não configurada. Configure no .env antes de executar o backup.');
  process.exit(1);
}

// Gera nome de arquivo com timestamp
const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, '-');
const backupsDir = path.join(process.cwd(), 'backups');
const outputFile = path.join(backupsDir, `humaniq-backup-${timestamp}.sql`);

// Garante diretório de backups
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

// Em Neon/Render, geralmente é necessário sslmode=require
// Se a URL não tiver sslmode, adiciona por segurança
function ensureSSL(url: string): string {
  try {
    const u = new URL(url);
    if (!u.searchParams.has('sslmode')) {
      u.searchParams.set('sslmode', 'require');
    }
    return u.toString();
  } catch {
    return url;
  }
}

const urlWithSSL = ensureSSL(DATABASE_URL);

// Usa pg_dump via child_process. Necessita pg_dump instalado no sistema.
const pgDumpArgs = [
  urlWithSSL,
  '-Fc', // formato custom (compactado) – mais eficiente
  '-f', outputFile,
];

console.log('Iniciando backup PostgreSQL...');
console.log(`Destino: ${outputFile}`);

const pgDump = spawn('pg_dump', pgDumpArgs, { stdio: 'inherit' });

pgDump.on('error', (err) => {
  console.error('Erro ao iniciar pg_dump. Verifique se pg_dump está instalado e no PATH.', err);
  process.exit(1);
});

pgDump.on('close', (code) => {
  if (code === 0) {
    console.log('Backup concluído com sucesso.');
  } else {
    console.error(`Backup falhou com código ${code}.`);
    process.exit(code || 1);
  }
});