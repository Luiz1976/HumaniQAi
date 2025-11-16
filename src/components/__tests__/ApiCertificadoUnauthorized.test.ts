import { describe, it, expect, vi } from 'vitest'
import { apiRequest } from '@/lib/queryClient'

describe('Acesso direto ao certificado (segurança)', () => {
  it('deve bloquear acesso sem autenticação', async () => {
    const fetchMock = vi.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ error: 'Não autorizado' }),
    } as any)

    await expect(apiRequest('/api/cursos/certificado/comunicacao-nao-violenta', { method: 'GET' })).rejects.toThrow(/Não autorizado|Unauthorized/i)

    fetchMock.mockRestore()
  })
})