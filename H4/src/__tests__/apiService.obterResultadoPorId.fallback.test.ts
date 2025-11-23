import { describe, it, expect, beforeEach, vi } from 'vitest'
import { apiService } from '@/services/apiService'

describe('apiService.obterResultadoPorId fallback', () => {
  const id = 'teste-id-cache'

  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('retorna do cache local quando API responde 401/403', async () => {
    const item = {
      id,
      pontuacao_total: 42,
      metadados: { teste_nome: 'Teste Simulado', tipo_teste: 'karasek-siegrist' },
      data_realizacao: new Date().toISOString()
    }
    localStorage.setItem('resultadosCache', JSON.stringify({ [id]: item }))

    vi.stubGlobal('fetch', async () => new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 403, headers: { 'Content-Type': 'application/json' } }))

    const res = await apiService.obterResultadoPorId(id)
    expect(res.resultado).toMatchObject(item)
    expect(Array.isArray(res.respostas)).toBe(true)
  })

  it('propaga erro quando não há cache local', async () => {
    vi.stubGlobal('fetch', async () => new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 401, headers: { 'Content-Type': 'application/json' } }))
    await expect(apiService.obterResultadoPorId('sem-cache')).rejects.toThrow()
  })
})