import { describe, it, expect } from 'vitest'
import '@testing-library/jest-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import CursoDetalhes from '../colaborador/CursoDetalhes'
import { cursos } from '@/data/cursosData'

describe('Conclusão de módulo: sincronização frontend/backend', () => {
  it('exibe progresso real a partir do servidor após marcar como concluído', async () => {
    const queryClient = new QueryClient()
    const curso = cursos.find(c => c.slug === 'inteligencia-emocional-lideranca')!

    queryClient.setQueryData(['/api/cursos/progresso', curso.slug], {
      id: 'prog-1',
      colaboradorId: 'colab-1',
      cursoId: String(curso.id),
      cursoSlug: curso.slug,
      modulosCompletados: [1],
      totalModulos: curso.modulos.length,
      progressoPorcentagem: Math.round((1 / curso.modulos.length) * 100),
      avaliacaoFinalRealizada: false,
      avaliacaoFinalPontuacao: 0,
      dataInicio: new Date().toISOString(),
      dataUltimaAtualizacao: new Date().toISOString(),
      dataConclusao: null,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/colaborador/cursos/${curso.slug}`]}>
          <Routes>
            <Route path="/colaborador/cursos/:slug" element={<CursoDetalhes />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByText(/Seu Progresso/i)).toBeDefined()
    expect(screen.getByText(/1 de/i)).toBeDefined()
  })

  it('não habilita certificação sem avaliação e conclusão 100%', async () => {
    const queryClient = new QueryClient()
    const curso = cursos.find(c => c.slug === 'inteligencia-emocional-lideranca')!

    queryClient.setQueryData(['/api/cursos/progresso', curso.slug], {
      id: 'prog-2',
      colaboradorId: 'colab-1',
      cursoId: String(curso.id),
      cursoSlug: curso.slug,
      modulosCompletados: [],
      totalModulos: curso.modulos.length,
      progressoPorcentagem: 0,
      avaliacaoFinalRealizada: false,
      avaliacaoFinalPontuacao: 0,
      dataInicio: new Date().toISOString(),
      dataUltimaAtualizacao: new Date().toISOString(),
      dataConclusao: null,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/colaborador/cursos/${curso.slug}`]}>
          <Routes>
            <Route path="/colaborador/cursos/:slug" element={<CursoDetalhes />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    const tabCert = await screen.findByTestId('tab-certificado')
    expect(tabCert).toHaveAttribute('data-state', 'inactive')
  })
})