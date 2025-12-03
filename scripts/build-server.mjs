import * as esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ler package.json para obter dependências externas
const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8'));
const dependencies = Object.keys(packageJson.dependencies || {});
dependencies.push('better-sqlite3'); // Excluir driver SQLite do bundle (lazy loaded)

console.log('🚀 Iniciando build do servidor com esbuild...');

try {
  await esbuild.build({
    entryPoints: ['server/index.ts'],
    outfile: 'dist/server.js',
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    external: dependencies, // Não incluir node_modules no bundle
    sourcemap: true,
    minify: false, // Manter legível para debug
    logLevel: 'info',
    banner: {
      js: `
        import { createRequire } from 'module';
        const require = createRequire(import.meta.url);
        import { fileURLToPath } from 'url';
        import { dirname } from 'path';
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
      `,
    },
  });
  console.log('✅ Build do servidor concluído: dist/server.js');
} catch (error) {
  console.error('❌ Erro no build:', error);
  process.exit(1);
}
