import 'dotenv/config'
import postgres from 'postgres'

function normalize(url) {
  try {
    const u = new URL(url)
    if (!u.searchParams.has('sslmode')) u.searchParams.set('sslmode', 'require')
    return u.toString()
  } catch {
    return url
  }
}

const conn = normalize(process.env.DATABASE_URL || '')
if (!conn) {
  console.error('DATABASE_URL ausente')
  process.exit(1)
}

const sql = postgres(conn, { max: 1, idle_timeout: 10, connect_timeout: 10 })

const testes = [
  { nome: 'HumaniQ - Clima', categoria: 'clima-organizacional', tempo: 20 },
  { nome: 'HumaniQ - Karasek-Siegrist', categoria: 'karasek-siegrist', tempo: 15 },
  { nome: 'HumaniQ EO – Estresse Ocupacional, Burnout e Resiliência', categoria: 'estresse-ocupacional', tempo: 25 },
  { nome: 'HumaniQ Insight', categoria: 'humaniq-insight', tempo: 20 },
  { nome: 'HumaniQ MGRP – Maturidade em Gestão de Riscos Psicossociais', categoria: 'maturidade-riscos-psicossociais', tempo: 20 },
  { nome: 'HumaniQ PAS – Percepção de Assédio Moral e Sexual', categoria: 'percepcao-assedio', tempo: 20 },
  { nome: 'HumaniQ QVT – Qualidade de Vida no Trabalho', categoria: 'qualidade-vida-trabalho', tempo: 20 },
  { nome: 'HumaniQ RPO – Riscos Psicossociais Ocupacionais', categoria: 'rpo', tempo: 20 }
]

async function ensure() {
  for (const t of testes) {
    const rows = await sql`SELECT id FROM testes WHERE nome = ${t.nome} LIMIT 1`
    if (rows.length === 0) {
      await sql`INSERT INTO testes (id, nome, descricao, categoria, tempo_estimado, instrucoes, ativo, created_at, updated_at) VALUES (gen_random_uuid(), ${t.nome}, ${''}, ${t.categoria}, ${t.tempo}, ${''}, ${true}, NOW(), NOW())`
      console.log(`criado: ${t.nome}`)
    } else {
      console.log(`existente: ${t.nome}`)
    }
  }
}

ensure()
  .then(() => sql.end({ timeout: 1 }))
  .then(() => console.log('ok'))
  .catch(async (e) => {
    console.error(e)
    try { await sql.end({ timeout: 1 }) } catch {}
    process.exit(1)
  })