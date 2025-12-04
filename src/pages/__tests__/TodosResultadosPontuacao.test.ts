import { describe, it, expect } from 'vitest';
import { normalizarPontuacaoResultado } from '../TodosResultados';

describe('normalizarPontuacaoResultado', () => {
  it('padroniza QVT para 1 casa e percentual correto', () => {
    const resultadoQVT: any = {
      pontuacao_total: 2.48,
      metadados: { tipo_teste: 'qvt', pontuacao: 2.48 }
    };
    const { valor5, valorPercentual } = normalizarPontuacaoResultado(resultadoQVT);
    expect(valor5).toBe(2.5);
    expect(valorPercentual).toBe(50);
  });

  it('usa pontuacao_total exata quando disponível (RPO)', () => {
    const resultadoRPO: any = {
      pontuacao_total: 2.3,
      metadados: { tipo_teste: 'rpo' }
    };
    const { valor5, valorPercentual } = normalizarPontuacaoResultado(resultadoRPO);
    expect(valor5).toBe(2.3);
    expect(valorPercentual).toBe(46);
  });

  it('faz fallback para analise_completa.indiceGeralRisco quando pontuacao_total ausente', () => {
    const resultadoRPOFallback: any = {
      metadados: { tipo_teste: 'rpo', analise_completa: { indiceGeralRisco: 2.34 } }
    };
    const { valor5, valorPercentual } = normalizarPontuacaoResultado(resultadoRPOFallback);
    expect(valor5).toBe(2.3);
    expect(valorPercentual).toBe(46);
  });

  it('prioriza analise_completa.indiceGeralRisco sobre pontuacao_total antiga (RPO)', () => {
    const resultadoAntigo: any = {
      pontuacao_total: 2.0,
      metadados: { tipo_teste: 'rpo', analise_completa: { indiceGeralRisco: 2.32 } }
    };
    const { valor5, valorPercentual } = normalizarPontuacaoResultado(resultadoAntigo);
    expect(valor5).toBe(2.3);
    expect(valorPercentual).toBe(46);
  });

  it('converte MGRP legado de pontuacaoGeral para escala 0-5 e percentual', () => {
    const resultadoMGRPLegado: any = {
      metadados: {
        tipo_teste: 'maturidade-gestao-riscos',
        pontuacaoGeral: 139,
        totalPerguntas: 40
      }
    };
    const { valor5, valorPercentual } = normalizarPontuacaoResultado(resultadoMGRPLegado);
    expect(valorPercentual).toBe(70);
    expect(valor5).toBe(3.5);
  });

  it('usa percentual da estrutura nova MGRP quando presente', () => {
    const resultadoMGRPNovo: any = {
      pontuacao_total: 70,
      metadados: {
        tipo_teste: 'maturidade-gestao-riscos',
        analise_completa: { maturidadeGeral: { percentual: 70 } }
      }
    };
    const { valor5, valorPercentual } = normalizarPontuacaoResultado(resultadoMGRPNovo);
    expect(valorPercentual).toBe(70);
    expect(valor5).toBe(3.5);
  });


});