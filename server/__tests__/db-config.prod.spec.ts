import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const originalEnv = { ...process.env }

describe('runMigrations em produção sem DATABASE_URL', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env.NODE_ENV = 'production'
    delete process.env.DATABASE_URL
  })

  afterEach(() => {
    Object.assign(process.env, originalEnv)
  })

  it('não deve lançar e deve indicar banco indisponível', async () => {
    const mod = await import('../db-config')
    expect(mod.dbType).toBeDefined()
    expect(String(mod.dbType).toLowerCase()).not.toContain('sqlite')
    await expect(mod.runMigrations()).resolves.toBeUndefined()
  })
})

