import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AvaliacaoFinal from '@/components/cursos/AvaliacaoFinal'
import { getCursoBySlug } from '@/data/cursosData'
import * as queryClientMod from '@/lib/queryClient'

describe('Fluxo de Avaliação e Certificado', () => {
  const curso = getCursoBySlug('comunicacao-nao-violenta')!

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('deve desabilitar "Finalizar Avaliação" até todas questões respondidas', async () => {
    const progresso = {
      modulosCompletados: curso.modulos.map(m => m.id),
      totalModulos: curso.modulos.length,
      avaliacaoFinalRealizada: false,
      tentativasAvaliacao: 0,
    }

    const qc = new QueryClient()
    const view = render(
      <QueryClientProvider client={qc}>
        <AvaliacaoFinal curso={curso} progresso={progresso} avaliacaoRealizada={false} />
      </QueryClientProvider>
    )

    // Iniciar avaliação para renderizar perguntas
    const iniciar = await screen.findByTestId('button-iniciar-avaliacao')
    fireEvent.click(iniciar)

    const botaoFinalizar = await screen.findByTestId('button-finalizar-avaliacao')
    expect(botaoFinalizar).toBeDisabled()
  })

  it('deve aprovar e emitir certificado quando pontuação mínima for atingida', async () => {
    const progresso = {
      modulosCompletados: curso.modulos.map(m => m.id),
      totalModulos: curso.modulos.length,
      avaliacaoFinalRealizada: false,
      tentativasAvaliacao: 0,
    }

    const apiSpy = vi.spyOn(queryClientMod, 'apiRequest').mockImplementation(async (endpoint: string, options: RequestInit = {}) => {
      if (endpoint.startsWith('/api/cursos/avaliacao/')) {
        return {
          aprovado: true,
          pontuacao: 8,
          totalQuestoes: 10,
          tentativaAtual: 1,
          tentativasRestantes: 2,
        } as any
      }
      if (endpoint.startsWith('/api/cursos/certificado/')) {
        return {
          id: 'cert-123',
          cursoSlug: 'comunicacao-nao-violenta',
          cursoTitulo: curso.titulo,
          colaboradorNome: 'Usuário Teste',
          cargaHoraria: curso.duracao,
          dataEmissao: new Date().toISOString(),
          codigoAutenticacao: 'HQ-TEST-123',
        } as any
      }
      return {} as any
    })

    const qc = new QueryClient()
    render(
      <QueryClientProvider client={qc}>
        <AvaliacaoFinal curso={curso} progresso={progresso} avaliacaoRealizada={false} />
      </QueryClientProvider>
    )

    // Iniciar avaliação para renderizar perguntas
    const iniciar = await screen.findByTestId('button-iniciar-avaliacao')
    fireEvent.click(iniciar)

    // Responder rapidamente todas as questões com a primeira opção
    const radios = screen.getAllByRole('radio')
    for (const r of radios) {
      fireEvent.click(r)
    }

    const botaoFinalizar = await screen.findByTestId('button-finalizar-avaliacao')
    expect(botaoFinalizar).not.toBeDisabled()

    fireEvent.click(botaoFinalizar)

    // Verificar mensagem de aprovação
    expect(await screen.findByText(/Parabéns! Você foi aprovado!/)).toBeTruthy()

    apiSpy.mockRestore()
  })
})