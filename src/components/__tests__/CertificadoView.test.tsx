import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CertificadoView from '@/components/cursos/CertificadoView'
import { getCursoBySlug } from '@/data/cursosData'

describe('CertificadoView', () => {
  it('exibe o nome completo do curso no certificado', async () => {
    const curso = getCursoBySlug('fundamentos-legais-riscos-psicossociais')!
    const titulo = (curso as any).título ?? (curso as any).titulo

    const certificado = {
      id: 'cert-001',
      cursoSlug: (curso as any).slug,
      cursoTitulo: titulo,
      colaboradorNome: 'Colaborador Teste',
      cargaHoraria: (curso as any).duração ?? (curso as any).duracao ?? '4h',
      dataEmissao: new Date().toISOString(),
      codigoAutenticacao: 'HQ-TEST-001',
      qrCodeUrl: 'https://humaniq.ai/validar/cert/HQ-TEST-001'
    }

    render(<CertificadoView certificado={certificado} curso={curso as any} />)

    expect(screen.getByText(/Concluiu com êxito o curso de/i)).toBeDefined()
    expect(screen.getByText(new RegExp(titulo))).toBeDefined()
    expect(screen.getByText(/HumaniQ AI/)).toBeDefined()
    expect(screen.getByText(/Código de Autenticação:/)).toBeDefined()
    expect(screen.getByText(certificado.codigoAutenticacao)).toBeDefined()
  })
})

