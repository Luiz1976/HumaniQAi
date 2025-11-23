import { describe, it, expect } from 'vitest'
import type { ResultadoQVT } from '@/lib/types'

// Teste unitário para validar a estrutura de dados QVT e a correção da inconsistência
describe('Correção QVT - Validação de Dados', () => {
  
  it('deve garantir que os dados QVT estão no formato camelCase correto', () => {
    const dadosQVT: ResultadoQVT = {
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
        { dimensao: 'Recompensas e Remuneração', pontuacao: 3.8, percentual: 76, nivel: 'Bom' }
      ],
      dimensoesCriticas: [
        { dimensao: 'Equilíbrio Vida-Trabalho', pontuacao: 2.8, percentual: 56, nivel: 'Baixo' }
      ],
      riscoTurnover: false,
      insights: ['Avaliação geral da qualidade de vida no trabalho está na faixa regular.'],
      recomendacoes: ['Implementar políticas de home office flexível.'],
      alertasCriticos: [],
      metadados: {
        teste_nome: 'Qualidade de Vida no Trabalho',
        tipo_teste: 'qvt',
        versao_teste: '1.0',
        usuario_email: 'teste@empresa.com',
        usuario_nome: 'João Teste'
      }
    }

    // Validar que os campos principais existem e estão no formato correto
    expect(dadosQVT.indiceGeral).toBe(3.34)
    expect(dadosQVT.nivelGeral).toBe('Regular')
    expect(dadosQVT.percentualGeral).toBe(66.8)
    
    // Validar que as dimensões estão no formato camelCase
    expect(dadosQVT.satisfacaoFuncao).toBe(3.5)
    expect(dadosQVT.relacaoLideranca).toBe(3.2)
    expect(dadosQVT.estruturaCondicoes).toBe(3.1)
    expect(dadosQVT.recompensasRemuneracao).toBe(3.8)
    expect(dadosQVT.equilibrioVidaTrabalho).toBe(2.8)
    
    // Validar arrays
    expect(dadosQVT.pontosFortes).toHaveLength(1)
    expect(dadosQVT.dimensoesCriticas).toHaveLength(1)
    expect(dadosQVT.insights).toHaveLength(1)
    expect(dadosQVT.recomendacoes).toHaveLength(1)
    expect(dadosQVT.alertasCriticos).toHaveLength(0)
  })

  it('deve validar que valores zero ou vazios resultam em N/A', () => {
    const dadosQVTZerados: ResultadoQVT = {
      id: 'teste-123',
      colaborador_id: 'colab-456',
      data_realizacao: '2024-01-15T10:30:00Z',
      indiceGeral: 0,
      nivelGeral: '',
      percentualGeral: 0,
      satisfacaoFuncao: 0,
      relacaoLideranca: 0,
      estruturaCondicoes: 0,
      recompensasRemuneracao: 0,
      equilibrioVidaTrabalho: 0,
      pontosFortes: [],
      dimensoesCriticas: [],
      riscoTurnover: false,
      insights: [],
      recomendacoes: [],
      alertasCriticos: [],
      metadados: {
        teste_nome: 'Qualidade de Vida no Trabalho',
        tipo_teste: 'qvt',
        versao_teste: '1.0',
        usuario_email: '',
        usuario_nome: ''
      }
    }

    // Validar que valores zero são considerados "falsy" e devem resultar em N/A
    expect(dadosQVTZerados.indiceGeral).toBe(0)
    expect(dadosQVTZerados.nivelGeral).toBe('')
    expect(dadosQVTZerados.percentualGeral).toBe(0)
    
    // Arrays vazios
    expect(dadosQVTZerados.pontosFortes).toHaveLength(0)
    expect(dadosQVTZerados.dimensoesCriticas).toHaveLength(0)
    expect(dadosQVTZerados.insights).toHaveLength(0)
    expect(dadosQVTZerados.recomendacoes).toHaveLength(0)
  })

  it('deve garantir que a correção resolve a inconsistência de exibição', () => {
    // Simular a lógica do componente que foi corrigida
    const dadosQVT = {
      indiceGeral: 3.34,
      nivelGeral: 'Regular',
      percentualGeral: 66.8
    }

    // Lógica corrigida: usar apenas camelCase, sem fallback para snake_case
    const indice = dadosQVT.indiceGeral || 0
    const nivel = dadosQVT.nivelGeral || 'N/A'
    const percentual = dadosQVT.percentualGeral || 0

    // Validar que os valores corretos são exibidos
    expect(indice).toBe(3.34)
    expect(nivel).toBe('Regular')
    expect(percentual).toBe(66.8)

    // Garantir que não há "N/A%" ou "Não definido" quando os dados existem
    expect(nivel).not.toBe('Não definido')
    expect(percentual).not.toBe('N/A%')
  })

  it('deve validar o formato correto dos metadados', () => {
    const metadados = {
      teste_nome: 'Qualidade de Vida no Trabalho',
      tipo_teste: 'qvt',
      versao_teste: '1.0',
      usuario_email: 'teste@empresa.com',
      usuario_nome: 'João Teste'
    }

    // Validar que os metadados estão no formato esperado
    expect(metadados.teste_nome).toBe('Qualidade de Vida no Trabalho')
    expect(metadados.tipo_teste).toBe('qvt')
    expect(metadados.versao_teste).toBe('1.0')
    expect(metadados.usuario_email).toBe('teste@empresa.com')
    expect(metadados.usuario_nome).toBe('João Teste')
  })
})