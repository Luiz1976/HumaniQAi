// Teste de Risco Psicossocial - HumaniQ Karasek-Siegrist
// Base científica: Karasek (1979), Siegrist (1996), Theorell & Karasek (1996)
// Modelos: Job Demand-Control-Support e Effort-Reward Imbalance

import { corrigirPTBR } from "../../utils/corrigirPTBR";

export interface DimensaoKarasekSiegrist {
  id: string;
  nome: string;
  descricao: string;
  perguntas: PerguntaKarasekSiegrist[];
  pontuacaoMaxima: number;
}

export interface PerguntaKarasekSiegrist {
  id: number;
  texto: string;
  dimensao: string;
  escala: 'likert4' | 'likert5';
}

export interface ResultadoKarasekSiegrist {
  dimensoes: Record<string, {
    pontuacao: number;
    percentual: number;
    nivel: 'baixo' | 'moderado' | 'alto';
    classificacao: string;
    cor: string;
  }>;
  riscoGeral: {
    percentual: number;
    nivel: 'baixo' | 'moderado' | 'alto';
    classificacao: string;
    cor: string;
  };
  hipercomprometimento: {
    percentual: number;
    nivel: 'baixo' | 'moderado' | 'alto';
    classificacao: string;
    cor: string;
  };
}

// Escalas de resposta
const escalaLikert4Raw = [
  "Nunca",
  "Raramente", 
  "Frequentemente",
  "Sempre"
];
export const escalaLikert4 = escalaLikert4Raw.map(corrigirPTBR);

const escalaLikert5Raw = [
  "Discordo totalmente",
  "Discordo",
  "Neutro",
  "Concordo",
  "Concordo totalmente"
];
export const escalaLikert5 = escalaLikert5Raw.map(corrigirPTBR);

// Classificação dos níveis de risco
const classificacaoRiscoRaw = {
  baixo: { min: 0, max: 39, label: "Baixo Risco", cor: "🟢" },
  moderado: { min: 40, max: 69, label: "Risco Moderado", cor: "🟡" },
  alto: { min: 70, max: 100, label: "Alto Risco", cor: "🔴" }
};
export const classificacaoRisco = {
  baixo: { ...classificacaoRiscoRaw.baixo, label: corrigirPTBR(classificacaoRiscoRaw.baixo.label) },
  moderado: { ...classificacaoRiscoRaw.moderado, label: corrigirPTBR(classificacaoRiscoRaw.moderado.label) },
  alto: { ...classificacaoRiscoRaw.alto, label: corrigirPTBR(classificacaoRiscoRaw.alto.label) }
};

// Dimensões e perguntas do teste
const dimensoesKarasekSiegristRaw: DimensaoKarasekSiegrist[] = [
  {
    id: "demanda-psicologica",
    nome: "Demanda Psicológica",
    descricao: "Avalia a carga psicológica e mental do trabalho",
    pontuacaoMaxima: 40,
    perguntas: [
      { id: 1, texto: "Tenho prazos curtos e frequentes.", dimensao: "demanda-psicologica", escala: "likert4" },
      { id: 2, texto: "Sinto pressão constante para aumentar minha produtividade.", dimensao: "demanda-psicologica", escala: "likert4" },
      { id: 3, texto: "Preciso realizar várias tarefas ao mesmo tempo.", dimensao: "demanda-psicologica", escala: "likert4" },
      { id: 4, texto: "Meu trabalho exige esforço mental intenso.", dimensao: "demanda-psicologica", escala: "likert4" },
      { id: 5, texto: "Costumo levar trabalho para casa ou pensar nele fora do expediente.", dimensao: "demanda-psicologica", escala: "likert4" },
      { id: 6, texto: "As tarefas mudam rapidamente e sem aviso.", dimensao: "demanda-psicologica", escala: "likert4" },
      { id: 7, texto: "Tenho muitas tarefas simultâneas que competem entre si.", dimensao: "demanda-psicologica", escala: "likert4" },
      { id: 8, texto: "A complexidade das atividades me deixa mentalmente exausto(a).", dimensao: "demanda-psicologica", escala: "likert4" },
      { id: 9, texto: "Sinto que não tenho tempo suficiente para cumprir minhas obrigações.", dimensao: "demanda-psicologica", escala: "likert4" },
      { id: 10, texto: "Minhas tarefas são emocionalmente exigentes.", dimensao: "demanda-psicologica", escala: "likert4" }
    ]
  },
  {
    id: "controle-autonomia",
    nome: "Controle e Autonomia",
    descricao: "Mede o nível de controle e autonomia no trabalho",
    pontuacaoMaxima: 40,
    perguntas: [
      { id: 11, texto: "Tenho liberdade para decidir como executar meu trabalho.", dimensao: "controle-autonomia", escala: "likert4" },
      { id: 12, texto: "Posso organizar minhas tarefas conforme minha preferência.", dimensao: "controle-autonomia", escala: "likert4" },
      { id: 13, texto: "Participo das decisões que afetam meu trabalho.", dimensao: "controle-autonomia", escala: "likert4" },
      { id: 14, texto: "Tenho autonomia para resolver problemas.", dimensao: "controle-autonomia", escala: "likert4" },
      { id: 15, texto: "Posso fazer pausas ou ajustes quando necessário.", dimensao: "controle-autonomia", escala: "likert4" },
      { id: 16, texto: "Sinto que meu conhecimento é valorizado nas decisões.", dimensao: "controle-autonomia", escala: "likert4" },
      { id: 17, texto: "Tenho espaço para propor melhorias ou mudanças.", dimensao: "controle-autonomia", escala: "likert4" },
      { id: 18, texto: "Recebo treinamentos para aprimorar minhas habilidades.", dimensao: "controle-autonomia", escala: "likert4" },
      { id: 19, texto: "Meu trabalho permite desenvolvimento profissional.", dimensao: "controle-autonomia", escala: "likert4" },
      { id: 20, texto: "Tenho clareza sobre o que é esperado de mim.", dimensao: "controle-autonomia", escala: "likert4" }
    ]
  },
  {
    id: "apoio-social",
    nome: "Apoio Social",
    descricao: "Avalia o suporte recebido de colegas e supervisores",
    pontuacaoMaxima: 40,
    perguntas: [
      { id: 21, texto: "Meus colegas me apoiam quando preciso.", dimensao: "apoio-social", escala: "likert4" },
      { id: 22, texto: "Minha liderança me orienta e dá suporte técnico.", dimensao: "apoio-social", escala: "likert4" },
      { id: 23, texto: "Me sinto parte da equipe.", dimensao: "apoio-social", escala: "likert4" },
      { id: 24, texto: "O clima no ambiente de trabalho é positivo.", dimensao: "apoio-social", escala: "likert4" },
      { id: 25, texto: "Posso conversar abertamente com meus colegas.", dimensao: "apoio-social", escala: "likert4" },
      { id: 26, texto: "Posso buscar ajuda da liderança sem medo.", dimensao: "apoio-social", escala: "likert4" },
      { id: 27, texto: "Me sinto respeitado(a) no ambiente de trabalho.", dimensao: "apoio-social", escala: "likert4" },
      { id: 28, texto: "Recebo reconhecimento pelo que faço bem.", dimensao: "apoio-social", escala: "likert4" },
      { id: 29, texto: "A empresa promove cooperação entre setores.", dimensao: "apoio-social", escala: "likert4" },
      { id: 30, texto: "Há canais claros para resolver conflitos ou problemas.", dimensao: "apoio-social", escala: "likert4" }
    ]
  },
  {
    id: "esforco-exigido",
    nome: "Esforço Exigido",
    descricao: "Mede o esforço físico e mental demandado pelo trabalho",
    pontuacaoMaxima: 50,
    perguntas: [
      { id: 31, texto: "Tenho que me esforçar ao máximo todos os dias.", dimensao: "esforco-exigido", escala: "likert5" },
      { id: 32, texto: "Costumo fazer horas extras sem reconhecimento.", dimensao: "esforco-exigido", escala: "likert5" },
      { id: 33, texto: "Me cobro demais por bons resultados.", dimensao: "esforco-exigido", escala: "likert5" },
      { id: 34, texto: "Faço muito mais do que me foi atribuído.", dimensao: "esforco-exigido", escala: "likert5" },
      { id: 35, texto: "Aceito demandas urgentes mesmo fora do horário.", dimensao: "esforco-exigido", escala: "likert5" },
      { id: 36, texto: "O ritmo do trabalho é desgastante.", dimensao: "esforco-exigido", escala: "likert5" },
      { id: 37, texto: "Estou sempre preocupado(a) com desempenho.", dimensao: "esforco-exigido", escala: "likert5" },
      { id: 38, texto: "Sinto que estou sob constante avaliação.", dimensao: "esforco-exigido", escala: "likert5" },
      { id: 39, texto: "Tenho dificuldade em equilibrar trabalho e vida pessoal.", dimensao: "esforco-exigido", escala: "likert5" },
      { id: 40, texto: "Faço sacrifícios pessoais para atender às exigências do trabalho.", dimensao: "esforco-exigido", escala: "likert5" }
    ]
  },
  {
    id: "recompensas-recebidas",
    nome: "Recompensas Recebidas",
    descricao: "Avalia o reconhecimento, salário e perspectivas de carreira",
    pontuacaoMaxima: 50,
    perguntas: [
      { id: 41, texto: "Sinto que sou bem pago pelo meu trabalho.", dimensao: "recompensas-recebidas", escala: "likert5" },
      { id: 42, texto: "Recebo reconhecimento quando atinjo metas.", dimensao: "recompensas-recebidas", escala: "likert5" },
      { id: 43, texto: "Tenho estabilidade no emprego.", dimensao: "recompensas-recebidas", escala: "likert5" },
      { id: 44, texto: "Tenho perspectivas reais de crescimento.", dimensao: "recompensas-recebidas", escala: "likert5" },
      { id: 45, texto: "Me sinto valorizado(a) pela liderança.", dimensao: "recompensas-recebidas", escala: "likert5" },
      { id: 46, texto: "As promoções são baseadas em mérito.", dimensao: "recompensas-recebidas", escala: "likert5" },
      { id: 47, texto: "Tenho acesso a benefícios compatíveis com meu esforço.", dimensao: "recompensas-recebidas", escala: "likert5" },
      { id: 48, texto: "Me sinto respeitado(a) independentemente da minha função.", dimensao: "recompensas-recebidas", escala: "likert5" },
      { id: 49, texto: "Sinto que sou tratado(a) de forma justa.", dimensao: "recompensas-recebidas", escala: "likert5" },
      { id: 50, texto: "Meus resultados são levados em consideração pela empresa.", dimensao: "recompensas-recebidas", escala: "likert5" }
    ]
  },
  {
    id: "hipercomprometimento",
    nome: "Hipercomprometimento",
    descricao: "Avalia o excesso de comprometimento e envolvimento com o trabalho",
    pontuacaoMaxima: 50,
    perguntas: [
      { id: 51, texto: "Me sinto culpado(a) quando não trabalho o suficiente.", dimensao: "hipercomprometimento", escala: "likert5" },
      { id: 52, texto: "Mesmo cansado(a) ou doente, insisto em manter o desempenho.", dimensao: "hipercomprometimento", escala: "likert5" },
      { id: 53, texto: "Não consigo recusar tarefas, mesmo já sobrecarregado(a).", dimensao: "hipercomprometimento", escala: "likert5" },
      { id: 54, texto: "Trabalho é minha principal fonte de identidade.", dimensao: "hipercomprometimento", escala: "likert5" },
      { id: 55, texto: "Não consigo relaxar fora do expediente.", dimensao: "hipercomprometimento", escala: "likert5" },
      { id: 56, texto: "Me cobro além do razoável.", dimensao: "hipercomprometimento", escala: "likert5" },
      { id: 57, texto: "Fico ansioso(a) quando não estou produzindo.", dimensao: "hipercomprometimento", escala: "likert5" },
      { id: 58, texto: "Coloco as demandas profissionais acima da minha saúde.", dimensao: "hipercomprometimento", escala: "likert5" },
      { id: 59, texto: "Tenho dificuldade de delegar tarefas.", dimensao: "hipercomprometimento", escala: "likert5" },
      { id: 60, texto: "Me sinto angustiado(a) quando deixo algo pendente.", dimensao: "hipercomprometimento", escala: "likert5" }
    ]
  }
];

function corrigirDimensaoKS(d: DimensaoKarasekSiegrist): DimensaoKarasekSiegrist {
  return {
    ...d,
    nome: corrigirPTBR(d.nome),
    descricao: corrigirPTBR(d.descricao),
    perguntas: d.perguntas.map(p => ({ ...p, texto: corrigirPTBR(p.texto) }))
  };
}

export const dimensoesKarasekSiegrist: DimensaoKarasekSiegrist[] = dimensoesKarasekSiegristRaw.map(corrigirDimensaoKS);

// Função para calcular resultado do teste Karasek-Siegrist
export function calcularResultadoKarasekSiegrist(respostas: Record<number, number>): ResultadoKarasekSiegrist {
  const resultadoDimensoes: Record<string, any> = {};
  
  // Calcular pontuação por dimensão
  dimensoesKarasekSiegrist.forEach(dimensao => {
    let pontuacaoTotal = 0;
    
    dimensao.perguntas.forEach(pergunta => {
      const resposta = respostas[pergunta.id] || 1;
      
      // Ajustar pontuação para perguntas invertidas (específicas do modelo)
      let pontuacaoAjustada = resposta;
      
      const perguntasInvertidas = [41, 42, 43, 44, 45, 46, 47, 48, 49, 50];
      
      if (perguntasInvertidas.includes(pergunta.id)) {
        if (pergunta.escala === 'likert4') {
          pontuacaoAjustada = 5 - resposta; // Inverte escala 1-4 para 4-1
        } else {
          pontuacaoAjustada = 6 - resposta; // Inverte escala 1-5 para 5-1
        }
      }
      
      pontuacaoTotal += pontuacaoAjustada;
    });
    
    // Calcular percentual
    const percentual = Math.round((pontuacaoTotal / dimensao.pontuacaoMaxima) * 100);
    
    // Determinar nível de risco
    let nivel: 'baixo' | 'moderado' | 'alto';
    let classificacao: string;
    let cor: string;
    
    if (percentual <= 39) {
      nivel = 'baixo';
      classificacao = 'Baixo Risco';
      cor = '🟢';
    } else if (percentual <= 69) {
      nivel = 'moderado';
      classificacao = 'Risco Moderado';
      cor = '🟡';
    } else {
      nivel = 'alto';
      classificacao = 'Alto Risco';
      cor = '🔴';
    }
    
    resultadoDimensoes[dimensao.id] = {
      pontuacao: pontuacaoTotal,
      percentual,
      nivel,
      classificacao,
      cor
    };
  });
  
  // Calcular risco psicossocial geral (média das primeiras 5 dimensões)
  const dimensoesRiscoGeral = ['demanda-psicologica', 'controle-autonomia', 'apoio-social', 'esforco-exigido', 'recompensas-recebidas'];
  const somaPercentuais = dimensoesRiscoGeral.reduce((soma, dim) => soma + resultadoDimensoes[dim].percentual, 0);
  const percentualGeral = Math.round(somaPercentuais / dimensoesRiscoGeral.length);
  
  let nivelGeral: 'baixo' | 'moderado' | 'alto';
  let classificacaoGeral: string;
  let corGeral: string;
  
  if (percentualGeral <= 39) {
    nivelGeral = 'baixo';
    classificacaoGeral = 'Baixo Risco';
    corGeral = '🟢';
  } else if (percentualGeral <= 69) {
    nivelGeral = 'moderado';
    classificacaoGeral = 'Risco Moderado';
    corGeral = '🟡';
  } else {
    nivelGeral = 'alto';
    classificacaoGeral = 'Alto Risco';
    corGeral = '🔴';
  }
  
  // Hipercomprometimento é analisado separadamente
  const hipercomprometimento = resultadoDimensoes['hipercomprometimento'];
  
  return {
    dimensoes: resultadoDimensoes,
    riscoGeral: {
      percentual: percentualGeral,
      nivel: nivelGeral,
      classificacao: classificacaoGeral,
      cor: corGeral
    },
    hipercomprometimento: {
      percentual: hipercomprometimento.percentual,
      nivel: hipercomprometimento.nivel,
      classificacao: hipercomprometimento.classificacao,
      cor: hipercomprometimento.cor
    }
  };
}

// Função para obter todas as perguntas em ordem
export function obterTodasPerguntasKS(): PerguntaKarasekSiegrist[] {
  return dimensoesKarasekSiegrist.flatMap(dimensao => dimensao.perguntas);
}

// Informações do teste
const infoTesteKarasekSiegristRaw = {
  id: "karasek-siegrist",
  nome: "HumaniQ - Karasek-Siegrist",
  descricao: "Avaliação avançada de risco psicossocial baseada nos modelos científicos de Karasek e Siegrist, analisando demanda, controle, apoio social, esforço-recompensa e hipercomprometimento.",
  duracao: "25 min",
  questoes: 60,
  categoria: "Psicossocial",
  dimensoes: dimensoesKarasekSiegrist.length,
  basesCientificas: [
    "Modelo Demanda-Controle-Apoio Social (Karasek, 1979; Theorell & Karasek, 1996)",
    "Modelo Desequilíbrio Esforço-Recompensa (Siegrist, 1996)",
    "Teoria do Estresse Ocupacional (Lazarus & Folkman, 1984)",
    "Modelo de Recursos e Demandas do Trabalho (Bakker & Demerouti, 2007)"
  ],
  objetivos: [
    "Identificar fatores de risco psicossocial no ambiente de trabalho",
    "Avaliar o equilíbrio entre demandas e recursos disponíveis",
    "Medir o nível de controle e autonomia no trabalho",
    "Analisar a qualidade do apoio social recebido",
    "Detectar desequilíbrios entre esforço e recompensa",
    "Identificar sinais de hipercomprometimento"
  ],
  instrucoes: [
    "Responda com base na sua experiência atual no trabalho",
    "Considere situações típicas dos últimos 6 meses",
    "Use as escalas conforme sua percepção real",
    "Seja honesto sobre suas condições de trabalho",
    "Suas respostas são confidenciais e anônimas"
  ]
};

export const infoTesteKarasekSiegrist = {
  ...infoTesteKarasekSiegristRaw,
  nome: corrigirPTBR(infoTesteKarasekSiegristRaw.nome),
  descricao: corrigirPTBR(infoTesteKarasekSiegristRaw.descricao),
  categoria: corrigirPTBR(infoTesteKarasekSiegristRaw.categoria),
  basesCientificas: infoTesteKarasekSiegristRaw.basesCientificas.map(corrigirPTBR),
  objetivos: infoTesteKarasekSiegristRaw.objetivos.map(corrigirPTBR),
  instrucoes: infoTesteKarasekSiegristRaw.instrucoes.map(corrigirPTBR)
};