import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ResultadoQVT from '@/components/ResultadoQVT'
import type { ResultadoQVT as ResultadoQVTType } from '@/lib/types'

// Mock dos dados de teste QVT com formato correto (camelCase)
const mockResultadoQVT: ResultadoQVTType = {
  id: '02b1b188-3269-4fd6-b3ec-ea66f00003bf',
  colaborador_id: 'colab-123',
  data_realizacao: '2024-01-15T10:30:00Z',
  indiceGeral: 3.34,
  nivelGeral: 'Regular',
  percentualGeral: 66.8,
  satisfacaoFuncao: 3.5,
  relacaoLideranca: 3.2,
  estruturaCondicoes: 3.1,
  recompensasRemuneracao: 3.8,
  equilibrioVidaTrabalho: 2.8,
  pontosFortes: [
    { dimensao: 'Recompensas e Remuneração', pontuacao: 3.8, percentual: 76, nivel: 'Bom' },
    { dimensao: 'Satisfação com a Função', pontuacao: 3.5, percentual: 70, nivel: 'Bom' }
  ],
  dimensoesCriticas: [
    { dimensao: 'Equilíbrio Vida-Trabalho', pontuacao: 2.8, percentual: 56, nivel: 'Baixo' }
  ],
  riscoTurnover: false,
  insights: [
    'Avaliação geral da qualidade de vida no trabalho está na faixa regular.',
    'Foco especial necessário na dimensão de equilíbrio entre vida pessoal e profissional.'
  ],
  recomendacoes: [
    'Implementar políticas de home office flexível.',
    'Revisar carga horária e distribuição de tarefas.'
  ],
  alertasCriticos: [],
  metadados: {
    teste_nome: 'Qualidade de Vida no Trabalho',
    tipo_teste: 'qvt',
    versao_teste: '1.0',
    usuario_email: 'teste@empresa.com',
    usuario_nome: 'João Teste'
  }
}

describe('ResultadoQVT Component', () => {
  it('deve renderizar corretamente os valores do resultado QVT', () => {
    render(<ResultadoQVT resultado={mockResultadoQVT} />)

    // Verificar se o título está presente
    expect(screen.getByText('Qualidade de Vida no Trabalho')).toBeInTheDocument()

    // Verificar se os valores principais estão sendo exibidos corretamente
    expect(screen.getByText('3.34')).toBeInTheDocument()
    expect(screen.getByText('66.8%')).toBeInTheDocument()
    expect(screen.getByText('Regular')).toBeInTheDocument()

    // Verificar se as dimensões estão presentes
    expect(screen.getByText('Satisfação com a Função')).toBeInTheDocument()
    expect(screen.getByText('Relação com Liderança')).toBeInTheDocument()
    expect(screen.getByText('Estrutura e Condições')).toBeInTheDocument()
    expect(screen.getByText('Recompensas e Remuneração')).toBeInTheDocument()
    expect(screen.getByText('Equilíbrio Vida-Trabalho')).toBeInTheDocument()

    // Verificar pontuações específicas das dimensões
    expect(screen.getByText('3.5')).toBeInTheDocument()
    expect(screen.getByText('3.2')).toBeInTheDocument()
    expect(screen.getByText('3.1')).toBeInTheDocument()
    expect(screen.getByText('3.8')).toBeInTheDocument()
    expect(screen.getByText('2.8')).toBeInTheDocument()

    // Verificar pontos fortes
    expect(screen.getByText('Recompensas e Remuneração')).toBeInTheDocument()
    expect(screen.getByText('Satisfação com a Função')).toBeInTheDocument()

    // Verificar dimensões críticas
    expect(screen.getByText('Equilíbrio Vida-Trabalho')).toBeInTheDocument()

    // Verificar insights
    expect(screen.getByText(/Avaliação geral da qualidade de vida no trabalho/i)).toBeInTheDocument()
    expect(screen.getByText(/Foco especial necessário/i)).toBeInTheDocument()

    // Verificar recomendações
    expect(screen.getByText(/Implementar políticas de home office/i)).toBeInTheDocument()
    expect(screen.getByText(/Revisar carga horária/i)).toBeInTheDocument()
  })

  it('não deve exibir "N/A%" ou "Não definido" quando os dados estão disponíveis', () => {
    render(<ResultadoQVT resultado={mockResultadoQVT} />)

    // Garantir que não há valores "N/A%" ou "Não definido" sendo exibidos
    expect(screen.queryByText('N/A%')).not.toBeInTheDocument()
    expect(screen.queryByText('Não definido')).not.toBeInTheDocument()
  })

  it('deve exibir "N/A" apenas quando os dados realmente não estão disponíveis', () => {
    const resultadoParcial = {
      ...mockResultadoQVT,
      indiceGeral: 0,
      nivelGeral: '',
      percentualGeral: 0
    }

    render(<ResultadoQVT resultado={resultadoParcial} />)

    // Quando os valores são zero ou vazios, deve exibir N/A
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('deve renderizar corretamente quando não há pontos fortes', () => {
    const resultadoSemPontosFortes = {
      ...mockResultadoQVT,
      pontosFortes: []
    }

    render(<ResultadoQVT resultado={resultadoSemPontosFortes} />)

    // A seção de pontos fortes não deve estar visível
    expect(screen.queryByText('Pontos Fortes')).not.toBeInTheDocument()
  })

  it('deve renderizar corretamente quando não há dimensões críticas', () => {
    const resultadoSemCriticos = {
      ...mockResultadoQVT,
      dimensoesCriticas: []
    }

    render(<ResultadoQVT resultado={resultadoSemCriticos} />)

    // A seção de alertas críticos não deve estar visível
    expect(screen.queryByText('Alertas Críticos')).not.toBeInTheDocument()
  })
})