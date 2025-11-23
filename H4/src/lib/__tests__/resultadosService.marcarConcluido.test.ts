import { describe, it, expect, vi } from 'vitest'
import { resultadosService } from '@/lib/resultadosServiceNew'

describe('Marcação de conclusão dispara bloqueio', () => {
  it('deve chamar endpoint de bloqueio e disparar evento', async () => {
    const tokenSet = vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: any) => {
      if (key === 'authToken') return 'tok'
      if (key === 'currentUser') return JSON.stringify({ role: 'colaborador', userId: 'u1' })
      return null as any
    })
    const fetchMock = vi.spyOn(global, 'fetch').mockImplementation(async (url: any, init: any) => {
      if (String(url).includes('/api/testes/resultado')) {
        return new Response(JSON.stringify({ resultado: { id: 'res-1', pontuacaoTotal: 80, dataRealizacao: new Date().toISOString() } }), { status: 201 })
      }
      if (String(url).includes('/api/teste-disponibilidade/marcar-concluido')) {
        return new Response(JSON.stringify({ success: true }), { status: 200 })
      }
      return new Response('{}', { status: 200 })
    })
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')
    await resultadosService.salvarResultado({ teste_id: 'maturidade-riscos-psicossociais', usuario_id: null, session_id: 's1', pontuacao_total: 80, status: 'concluido', metadados: {} })
    expect(dispatchSpy).toHaveBeenCalled()
    const evt = dispatchSpy.mock.calls[0][0] as CustomEvent
    expect(evt.type).toBe('teste-concluido')
    fetchMock.mockRestore()
    tokenSet.mockRestore()
  })
})