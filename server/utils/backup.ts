import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import logger from './logger';

type BackupOptions = {
  enabled: boolean;
  scheduleCron?: string; // e.g., '0 2 * * *' para 02:00 diariamente
  outputDir: string;
  databaseUrl: string;
};

export function runPostgresBackupOnce(opts: BackupOptions) {
  if (!opts.enabled) {
    logger.info('Backup desabilitado via configuração.');
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `backup-${timestamp}.sql`;
  const fullPath = path.resolve(opts.outputDir, fileName);

  // Garante diretório
  fs.mkdirSync(opts.outputDir, { recursive: true });

  // Usa pg_dump através de DATABASE_URL (credenciais no .env)
  const cmd = `pg_dump "${opts.databaseUrl}" -F p -f "${fullPath}"`;
  logger.info(`Iniciando backup PostgreSQL: ${fullPath}`);

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      logger.error('Erro ao executar pg_dump:', error);
      logger.error('stderr:', stderr);
      return;
    }
    if (stderr) {
      logger.warn('pg_dump avisos:', stderr);
    }
    logger.info(`Backup concluído: ${fullPath}`);

    // Retenção: remover backups mais antigos que BACKUP_RETENTION_DAYS
    const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS || '7', 10);
    if (retentionDays > 0) {
      const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
      try {
        const files = fs.readdirSync(opts.outputDir);
        files.forEach(f => {
          if (f.endsWith('.sql')) {
            const p = path.join(opts.outputDir, f);
            const stat = fs.statSync(p);
            if (stat.mtimeMs < cutoff) {
              fs.unlinkSync(p);
              logger.info(`Retenção: removido backup antigo ${f}`);
            }
          }
        });
      } catch (retErr) {
        logger.warn('Falha ao aplicar retenção de backups:', retErr);
      }
    }
  });
}

export function scheduleBackupFromEnv() {
  const enabled = (process.env.BACKUP_ENABLED || 'false').toLowerCase() === 'true';
  if (!enabled) return;

  const outputDir = process.env.BACKUP_DIR || path.resolve(process.cwd(), 'backups');
  const databaseUrl = process.env.DATABASE_URL || '';
  const intervalMinutes = parseInt(process.env.BACKUP_INTERVAL_MINUTES || '1440', 10); // default: diário

  if (!databaseUrl) {
    logger.warn('BACKUP_ENABLED=true, porém DATABASE_URL não está configurada. Backup não será agendado.');
    return;
  }

  logger.info(`Agendando backup a cada ${intervalMinutes} minutos para diretório: ${outputDir}`);

  setInterval(() => {
    runPostgresBackupOnce({
      enabled: true,
      outputDir,
      databaseUrl,
    });
  }, Math.max(5, intervalMinutes) * 60 * 1000);
}