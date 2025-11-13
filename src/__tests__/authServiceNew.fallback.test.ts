import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('authServiceNew fallback 5xx', () => {
  beforeEach(async () => {
    vi.resetModules()
    vi.restoreAllMocks()
    ;(import.meta as any).env = {
      VITE_API_URL: 'https://primary.example/api',
      VITE_API_FALLBACK_URL: 'https://fallback.example/api',
      PROD: false,
    }
  })

  it('tenta fallback quando primário retorna 5xx e login funciona', async () => {
    vi.stubGlobal('fetch', async (url: any, init?: any) => {
      const u = typeof url === 'string' ? url : ''
      if (u.startsWith('https://primary.example')) {
        return new Response('Bad Gateway', { status: 502 })
      }
      const body = JSON.stringify({
        token: 'token-ok',
        user: { id: '1', email: 'e@x.com', nome: 'N', role: 'admin' },
      })
      return new Response(body, {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    })

    const { authServiceNew } = await import('@/services/authServiceNew')
    const res = await authServiceNew.login('e@x.com', 'pass')
    expect(res.success).toBe(true)
    expect(res.token).toBe('token-ok')
    expect(res.user?.role).toBe('admin')
  })
})