// Script interativo: solicita email/senha da empresa, faz login e imprime JWT
import readline from 'readline';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

function ask(question, silent = false) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  if (silent) {
    // Em PowerShell, não há modo nativo oculto; pedimos normalmente.
  }
  return new Promise((resolve) => rl.question(question, (ans) => { rl.close(); resolve(ans); }));
}

async function main() {
  const email = process.env.TEST_EMPRESA_EMAIL || await ask('Email da empresa: ');
  const password = process.env.TEST_EMPRESA_PASSWORD || await ask('Senha: ');
  if (!email || !password) {
    console.error('❌ Email e senha são obrigatórios');
    process.exit(1);
  }

  const url = `${BASE_URL}/api/auth/login`;
  console.log('📡 POST', url, { email });
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
  console.log('🔎 Status:', res.status);
  if (!res.ok) {
    console.error('❌ Falha no login:', data);
    process.exit(1);
  }
  const token = data?.token;
  console.log('✅ Token JWT (copie para server/.env como EMPRESA_JWT_TOKEN):');
  console.log(token);
}

main().catch((e) => { console.error('❌ Erro inesperado', e); process.exit(1); });