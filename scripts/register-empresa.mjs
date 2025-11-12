// Registra uma empresa via /api/auth/register/empresa e grava o JWT em server/.env
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const EMAIL = process.env.TEST_EMPRESA_EMAIL || `empresa.auto+${Date.now()}@test.com`;
const PASSWORD = process.env.TEST_EMPRESA_PASSWORD || 'password';
const NOME = process.env.TEST_EMPRESA_NOME || 'Empresa Auto Test';

async function main() {
  const url = `${BASE_URL}/api/auth/register/empresa`;
  console.log('📡 POST', url, { EMAIL, NOME });
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nomeEmpresa: NOME, emailContato: EMAIL, senha: PASSWORD })
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!res.ok) {
    console.error('❌ Registro falhou', res.status, data);
    process.exit(1);
  }

  const token = data?.token;
  if (!token) {
    console.error('❌ Token não retornado', data);
    process.exit(1);
  }
  console.log('✅ Token obtido (início):', token.substring(0, 24) + '...');

  const envPath = path.join(process.cwd(), 'server', '.env');
  let envContent = '';
  try {
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch (e) {
    console.error('❌ Não foi possível ler server/.env', e.message);
    process.exit(1);
  }

  const lines = envContent.split(/\r?\n/);
  let updated = false;
  const newLines = lines.map((line) => {
    if (line.startsWith('EMPRESA_JWT_TOKEN=')) {
      updated = true;
      return `EMPRESA_JWT_TOKEN=${token}`;
    }
    return line;
  });
  if (!updated) newLines.push(`EMPRESA_JWT_TOKEN=${token}`);

  fs.writeFileSync(envPath, newLines.join('\n'), 'utf8');
  console.log('📝 Token salvo em server/.env (EMPRESA_JWT_TOKEN).');
}

main().catch((e) => {
  console.error('❌ Erro inesperado', e);
  process.exit(1);
});