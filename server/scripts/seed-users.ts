import dotenv from 'dotenv'
dotenv.config()
import { sqlite } from '../db-sqlite'
import { hashPassword } from '../utils/auth'
import crypto from 'crypto'

async function ensureAdmin(email: string, nome: string, senha: string) {
  const row = sqlite.prepare('SELECT id FROM admins WHERE email = ? LIMIT 1').get(email) as any
  const senhaHash = await hashPassword(senha)
  if (row && row.id) {
    sqlite.prepare('UPDATE admins SET nome = ?, senha = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(nome, senhaHash, row.id)
    return row.id as string
  }
  const id = crypto.randomUUID()
  sqlite.prepare('INSERT INTO admins (id, email, nome, senha) VALUES (?, ?, ?, ?)').run(id, email, nome, senhaHash)
  return id
}

async function ensureEmpresa(nomeEmpresa: string, emailContato: string, senha: string) {
  const row = sqlite.prepare('SELECT id FROM empresas WHERE email_contato = ? LIMIT 1').get(emailContato) as any
  const senhaHash = await hashPassword(senha)
  if (row && row.id) {
    sqlite.prepare('UPDATE empresas SET nome_empresa = ?, senha = ?, updated_at = CURRENT_TIMESTAMP, ativo = 1 WHERE id = ?').run(nomeEmpresa, senhaHash, row.id)
    return row.id as string
  }
  const id = crypto.randomUUID()
  sqlite.prepare('INSERT INTO empresas (id, nome_empresa, email_contato, senha, ativo, created_at, updated_at) VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)').run(id, nomeEmpresa, emailContato, senhaHash)
  return id
}

async function ensureColaborador(nome: string, email: string, senha: string, empresaId: string | null) {
  const row = sqlite.prepare('SELECT id FROM colaboradores WHERE email = ? LIMIT 1').get(email) as any
  const senhaHash = await hashPassword(senha)
  if (row && row.id) {
    sqlite.prepare('UPDATE colaboradores SET nome = ?, senha = ?, empresa_id = ?, updated_at = CURRENT_TIMESTAMP, ativo = 1 WHERE id = ?').run(nome, senhaHash, empresaId, row.id)
    return row.id as string
  }
  const id = crypto.randomUUID()
  sqlite.prepare('INSERT INTO colaboradores (id, nome, email, senha, cargo, departamento, empresa_id, permissoes, ativo, created_at, updated_at) VALUES (?, ?, ?, ?, NULL, NULL, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)').run(id, nome, email, senhaHash, empresaId, JSON.stringify({}))
  return id
}

async function main() {
  const adminId = await ensureAdmin('admin@humaniq.com', 'Admin', 'Luiz@1976')
  const empresaId = await ensureEmpresa('Humaniq', 'luiz@humaniq.com', 'Luiz@1222')
  const colabId = await ensureColaborador('Carlos', 'Carlos@gmail.com', 'Carlos@123', empresaId)
  process.stdout.write(JSON.stringify({ adminId, empresaId, colabId }))
}

main().catch(e => {
  process.stderr.write(String(e?.message || e))
  process.exit(1)
})