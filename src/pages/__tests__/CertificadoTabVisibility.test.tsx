import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import CursoDetalhes from '@/pages/colaborador/CursoDetalhes'
import { getCursoBySlug } from '@/data/cursosData'

describe('Aba de Certificado – visibilidade e comportamento', () => {
  it('fica desabilitada quando a avaliação não foi realizada', async () => {
    const curso = getCursoBySlug('fundamentos-legais-riscos-psicossociais')!
    const qc = new QueryClient()

    qc.setQueryData(['/api/cursos/progresso', (curso as any).slug], {
      id: 'prog-1',
      cursoSlug: (curso as any).slug,
      modulosCompletados: [],
      totalModulos: (curso as any).módulos.length,
      progressoPorcentagem: 0,
      avaliacaoFinalRealizada: false,
      avaliacaoFinalPontuacao: 0,
      dataInicio: new Date().toISOString(),
      dataUltimaAtualizacao: new Date().toISOString(),
      dataConclusao: null,
    })

    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={[`/colaborador/cursos/${(curso as any).slug}`]}>
          <Routes>
            <Route path="/colaborador/cursos/:slug" element={<CursoDetalhes />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    const tabCert = await screen.findByTestId('tab-certificado')
    expect(tabCert).toHaveAttribute('disabled')
  })

  it('fica desabilitada quando a avaliação foi realizada mas não aprovada', async () => {
    const curso = getCursoBySlug('fundamentos-legais-riscos-psicossociais')!
    const qc = new QueryClient()

    qc.setQueryData(['/api/cursos/progresso', (curso as any).slug], {
      id: 'prog-2',
      cursoSlug: (curso as any).slug,
      modulosCompletados: (curso as any).módulos.map((m: any) => m.id),
      totalModulos: (curso as any).módulos.length,
      progressoPorcentagem: 100,
      avaliacaoFinalRealizada: true,
      avaliacaoFinalPontuacao: 6,
      dataInicio: new Date().toISOString(),
      dataUltimaAtualizacao: new Date().toISOString(),
      dataConclusao: new Date().toISOString(),
    })

    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={[`/colaborador/cursos/${(curso as any).slug}`]}>
          <Routes>
            <Route path="/colaborador/cursos/:slug" element={<CursoDetalhes />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    const tabCert = await screen.findByTestId('tab-certificado')
    expect(tabCert).toHaveAttribute('disabled')
  })

  it('fica habilitada quando a avaliação foi realizada e aprovada', async () => {
    const curso = getCursoBySlug('fundamentos-legais-riscos-psicossociais')!
    const qc = new QueryClient()

    qc.setQueryData(['/api/cursos/progresso', (curso as any).slug], {
      id: 'prog-3',
      cursoSlug: (curso as any).slug,
      modulosCompletados: (curso as any).módulos.map((m: any) => m.id),
      totalModulos: (curso as any).módulos.length,
      progressoPorcentagem: 100,
      avaliacaoFinalRealizada: true,
      avaliacaoFinalPontuacao: 8,
      dataInicio: new Date().toISOString(),
      dataUltimaAtualizacao: new Date().toISOString(),
      dataConclusao: new Date().toISOString(),
    })

    qc.setQueryData(['/api/cursos/certificado', (curso as any).slug], null)

    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={[`/colaborador/cursos/${(curso as any).slug}`]}>
          <Routes>
            <Route path="/colaborador/cursos/:slug" element={<CursoDetalhes />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    const tabCert = await screen.findByTestId('tab-certificado')
    expect(tabCert).not.toHaveAttribute('disabled')
    const content = await screen.findByText(/Gerando seu certificado/i)
    expect(content).toBeDefined()
  })
})

