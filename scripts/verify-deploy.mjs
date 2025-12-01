import { performance } from 'node:perf_hooks'

const baseArg = process.argv.find(a => a.startsWith('--base='))
const baseEnv = process.env.DEPLOY_BASE_URL
const base = (baseArg ? baseArg.split('=')[1] : baseEnv || '').trim()

if (!base) {
  console.error('Erro: informe a base do deploy com --base=https://seu-dominio ou defina DEPLOY_BASE_URL')
  process.exit(2)
}

const routes = [
  '/',
  '/login',
  '/empresa',
  '/admin',
  '/health'
]

const expectations = {
  '/': { status: 200, maxMs: 1500 },
  '/login': { status: 200, maxMs: 1500 },
  '/empresa': { status: 200, maxMs: 1500 },
  '/admin': { status: 200, maxMs: 1500 },
  '/health': { status: 200, maxMs: 1000 }
}

async function checkRoute(path) {
  const url = base.replace(/\/$/, '') + path
  const start = performance.now()
  let status = 0
  let ok = false
  let size = 0
  let error = null
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'HumaniQ-Deploy-Check' } })
    status = res.status
    const buf = await res.arrayBuffer()
    size = buf.byteLength
    ok = res.ok
  } catch (e) {
    error = e?.message || String(e)
  }
  const ms = Math.round(performance.now() - start)
  const exp = expectations[path] || { status: 200, maxMs: 2000 }
  const pass = ok && status === exp.status && ms <= exp.maxMs && size > 128
  return { path, url, status, ms, size, pass, error }
}

async function main() {
  console.log(`Verificando deploy em: ${base}`)
  const results = []
  for (const r of routes) {
    const res = await checkRoute(r)
    results.push(res)
    const statusText = res.pass ? 'OK' : 'FALHA'
    console.log(`${statusText} ${r} -> status=${res.status} ms=${res.ms} size=${res.size}${res.error ? ` erro=${res.error}` : ''}`)
  }

  const failures = results.filter(r => !r.pass)
  if (failures.length) {
    console.error(`Falhas detectadas em ${failures.length} rotas: ${failures.map(f => f.path).join(', ')}`)
    process.exitCode = 1
  } else {
    console.log('Todas as verificações passaram.')
  }
}

main()

