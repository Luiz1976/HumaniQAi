import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Testes from '@/pages/Testes'
import * as queryClientMod from '@/lib/queryClient'

describe('Disponibilidade de Testes', () => {
  it('deve mostrar MGRP como bloqueado após conclusão', async () => {
    const mock = vi.spyOn(queryClientMod, 'apiRequest').mockResolvedValue({
      testes: [
        { id: 'maturidade-riscos-psicossociais', nome: 'Maturidade em Gestão de Riscos Psicossociais', descricao: '', categoria: 'Organizacional', tempoEstimado: 20, ativo: true, disponivel: false, motivo: 'teste_concluido', proximaDisponibilidade: null, dataConclusao: new Date().toISOString(), pontuacao: 70, periodicidadeDias: null },
      ]
    } as any)
    render(<Testes />)
    expect(await screen.findByText('Indisponível')).toBeTruthy()
    expect(screen.getByText('Teste Bloqueado')).toBeTruthy()
    mock.mockRestore()
  })
})