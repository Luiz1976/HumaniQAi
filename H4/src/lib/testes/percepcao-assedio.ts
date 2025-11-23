import { corrigirPTBR } from "../../utils/corrigirPTBR";

export interface DimensaoPercepacaoAssedio {
  nome: string;
  pontuacao: number;
  percentual: number;
  nivel: 'Baixo Risco' | 'Risco Moderado' | 'Alto Risco' | 'Risco Crítico';
  descricao: string;
  interpretacao: string;
  alertaCritico: boolean;
  recomendacoes: string[];
  cor: string;
  icone: string;
}

export interface ResultadoPercepacaoAssedio {
  id: string;
  testeId: string;
  nomeTeste: string;
  dataRealizacao: string;
  indiceGeralAssedio: number;
  percentualGeral: number;
  nivelRiscoGeral: 'Baixo Risco' | 'Risco Moderado' | 'Alto Risco' | 'Risco Crítico';
  classificacaoGeral: string;
  dimensoes: DimensaoPercepacaoAssedio[];
  alertasCriticos: string[];
  insights: string[];
  recomendacoesEducativas: string[];
  recomendacoesDisciplinares: string[];
  relatorioESG: {
    conformidadeLegal: boolean;
    riscosIdentificados: string[];
    acoesPreventivasRecomendadas: string[];
    indicadoresESG: {
      diversidadeInclusao: number;
      segurancaPsicologica: number;
      culturaCorporativa: number;
    };
  };
  metadados: {
    versaoTeste: string;
    totalPerguntas: number;
    tempoResposta?: number;
    confiabilidade: number;
    validadeEstatistica: boolean;
  };
}

const configPercepacaoAssedioRaw = {
  id: "percepcao-assedio",
  nome: "HumaniQ PAS - Percepção de Assédio Moral e Sexual",
  descricao: "Identificação de condutas abusivas percebidas ou vivenciadas, com foco em assédio moral, institucional e sexual",
  categoria: "Riscos Psicossociais",
  tempoEstimado: "15-20 minutos",
  baseCientifica: ["OIT", "ISO 30415:2021", "NAQ-R (Negative Acts Questionnaire)", "Lei 14.457/22"],
  objetivos: [
    "Identificar condutas abusivas percebidas ou vivenciadas",
    "Mapear áreas críticas de risco de assédio",
    "Cumprir requisitos da Lei 14.457/22",
    "Prevenir danos à saúde mental dos colaboradores",
    "Proteger juridicamente a empresa"
  ],
  beneficios: [
    "Cumpre a Lei 14.457/22",
    "Reduz passivos trabalhistas e riscos reputacionais",
    "Fortalece cultura inclusiva e segura",
    "Diagnóstico de clima de respeito e segurança"
  ],
  dimensoes: [
    {
      id: "assedio-moral-direto",
      nome: "Assédio Moral Direto",
      descricao: "Agressões verbais e humilhações",
      perguntasIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    },
    {
      id: "assedio-moral-institucional",
      nome: "Assédio Moral Institucional",
      descricao: "Cultura abusiva e omissão",
      perguntasIds: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
    },
    {
      id: "assedio-sexual",
      nome: "Assédio Sexual",
      descricao: "Comentários, gestos e toques inapropriados",
      perguntasIds: [23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34]
    },
    {
      id: "percepcao-ambiente-denuncias",
      nome: "Percepção de Ambiente e Denúncias",
      descricao: "Canais e confiança",
      perguntasIds: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44]
    },
    {
      id: "impactos-emocionais",
      nome: "Impactos Emocionais",
      descricao: "Segurança e bem-estar",
      perguntasIds: [45, 46, 47, 48]
    }
  ],
  perguntas: [
    // Bloco 1 - Assédio Moral Direto (12 perguntas)
    {
      id: 1,
      texto: "Já fui exposto(a) a críticas constantes e desproporcionais sobre meu trabalho, com o intuito de humilhar.",
      dimensao: "assedio-moral-direto",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 2,
      texto: "Já fui gritado(a), ofendido(a) ou constrangido(a) por superiores ou colegas.",
      dimensao: "assedio-moral-direto",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 3,
      texto: "Me pedem tarefas humilhantes ou incompatíveis com minha função como forma de punição velada.",
      dimensao: "assedio-moral-direto",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 4,
      texto: "Me excluem propositalmente de reuniões ou informações importantes.",
      dimensao: "assedio-moral-direto",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 5,
      texto: "Já me senti ameaçado(a) ou coagido(a) a aceitar ordens abusivas para manter meu emprego.",
      dimensao: "assedio-moral-direto",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 6,
      texto: "Minhas falas ou ideias são constantemente ridicularizadas em público.",
      dimensao: "assedio-moral-direto",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 7,
      texto: "Recebo apelidos ou comentários maldosos sobre minha aparência ou personalidade no ambiente de trabalho.",
      dimensao: "assedio-moral-direto",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 8,
      texto: "Já fui isolado(a) socialmente ou impedido(a) de interagir com a equipe por decisão de um superior ou colega.",
      dimensao: "assedio-moral-direto",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 9,
      texto: "Sou alvo de fofocas maliciosas ou insinuações com o objetivo de prejudicar minha imagem.",
      dimensao: "assedio-moral-direto",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 10,
      texto: "Já tive metas inatingíveis impostas como forma de pressão ou punição.",
      dimensao: "assedio-moral-direto",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 11,
      texto: "Sinto que meu desempenho é sabotado ou boicotado de propósito por colegas ou gestores.",
      dimensao: "assedio-moral-direto",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 12,
      texto: "Já fui alvo de ameaças de demissão sem justificativa clara ou válida.",
      dimensao: "assedio-moral-direto",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    // Bloco 2 - Assédio Moral Institucional (10 perguntas)
    {
      id: 13,
      texto: "A cultura da empresa normaliza comportamentos abusivos sob a justificativa de 'pressão por resultados'.",
      dimensao: "assedio-moral-institucional",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 14,
      texto: "Sinto que há proteção ou conivência da liderança com atitudes humilhantes de certos gestores.",
      dimensao: "assedio-moral-institucional",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 15,
      texto: "Reclamações sobre condutas abusivas raramente são levadas a sério.",
      dimensao: "assedio-moral-institucional",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 16,
      texto: "Há tolerância com práticas como isolamento de funcionários ou desvalorização sistemática de alguns colaboradores.",
      dimensao: "assedio-moral-institucional",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 17,
      texto: "Muitos evitam relatar problemas por medo de retaliações ou perda de oportunidades.",
      dimensao: "assedio-moral-institucional",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 18,
      texto: "Existe uma percepção geral de que os abusadores são 'intocáveis' ou protegidos por cargos elevados.",
      dimensao: "assedio-moral-institucional",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 19,
      texto: "A comunicação interna não favorece a escuta ativa nem o acolhimento de queixas emocionais.",
      dimensao: "assedio-moral-institucional",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 20,
      texto: "Há discriminação velada relacionada à idade, gênero, aparência ou deficiência.",
      dimensao: "assedio-moral-institucional",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 21,
      texto: "A sobrecarga de trabalho é usada como forma de punição informal.",
      dimensao: "assedio-moral-institucional",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 22,
      texto: "A gestão por medo é uma prática comum na empresa.",
      dimensao: "assedio-moral-institucional",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    // Bloco 3 - Assédio Sexual (12 perguntas)
    {
      id: 23,
      texto: "Já recebi comentários de conotação sexual sem consentimento no ambiente de trabalho.",
      dimensao: "assedio-sexual",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 24,
      texto: "Já me senti constrangido(a) por olhares, gestos ou insinuações de cunho sexual.",
      dimensao: "assedio-sexual",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 25,
      texto: "Já recebi convites persistentes ou inapropriados para encontros com insinuação sexual.",
      dimensao: "assedio-sexual",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 26,
      texto: "Já fui tocado(a) sem consentimento por colegas ou superiores.",
      dimensao: "assedio-sexual",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 27,
      texto: "Mensagens de conteúdo impróprio já foram enviadas por colegas ou gestores.",
      dimensao: "assedio-sexual",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 28,
      texto: "Já sofri chantagens emocionais ou profissionais com conotação sexual.",
      dimensao: "assedio-sexual",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 29,
      texto: "Senti que minha aparência foi usada como critério de julgamento profissional.",
      dimensao: "assedio-sexual",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 30,
      texto: "A exposição de imagens, vídeos ou piadas sexuais ocorre de forma banalizada no ambiente de trabalho.",
      dimensao: "assedio-sexual",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 31,
      texto: "Já fui alvo de boatos sobre minha vida sexual dentro da empresa.",
      dimensao: "assedio-sexual",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 32,
      texto: "Já ouvi comentários sexistas ou misóginos em reuniões ou conversas informais.",
      dimensao: "assedio-sexual",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 33,
      texto: "Sinto que há tolerância institucional com o assédio sexual.",
      dimensao: "assedio-sexual",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 34,
      texto: "Já fui avaliado(a) profissionalmente com base em critérios relacionados ao meu corpo ou aparência.",
      dimensao: "assedio-sexual",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    // Bloco 4 - Percepção de Ambiente e Denúncias (10 perguntas)
    {
      id: 35,
      texto: "A empresa oferece canais seguros para denúncias de assédio.",
      dimensao: "percepcao-ambiente-denuncias",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 36,
      texto: "Confio que, se eu denunciar, haverá acolhimento e proteção contra retaliações.",
      dimensao: "percepcao-ambiente-denuncias",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 37,
      texto: "Já precisei denunciar uma situação de assédio e fui ouvido(a) com seriedade.",
      dimensao: "percepcao-ambiente-denuncias",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 38,
      texto: "Conheço alguém que sofreu assédio na empresa e não recebeu apoio adequado.",
      dimensao: "percepcao-ambiente-denuncias",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 39,
      texto: "O RH ou canal de ética atua com imparcialidade diante de denúncias.",
      dimensao: "percepcao-ambiente-denuncias",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 40,
      texto: "A cultura organizacional valoriza o respeito e a integridade nas relações.",
      dimensao: "percepcao-ambiente-denuncias",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 41,
      texto: "Já vi colegas sendo expostos(as) a situações constrangedoras sem que nada fosse feito.",
      dimensao: "percepcao-ambiente-denuncias",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 42,
      texto: "Os gestores são preparados para lidar com casos de assédio.",
      dimensao: "percepcao-ambiente-denuncias",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 43,
      texto: "Há treinamentos e campanhas internas sobre assédio moral e sexual.",
      dimensao: "percepcao-ambiente-denuncias",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 44,
      texto: "A empresa reforça valores éticos de forma constante e clara.",
      dimensao: "percepcao-ambiente-denuncias",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    // Bloco 5 - Impactos Emocionais (4 perguntas)
    {
      id: 45,
      texto: "Já considerei pedir demissão por conta do clima tóxico ou de situações abusivas.",
      dimensao: "impactos-emocionais",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 46,
      texto: "Sinto medo ou ansiedade ao interagir com determinadas pessoas na empresa.",
      dimensao: "impactos-emocionais",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 47,
      texto: "Já precisei buscar apoio psicológico por causa do ambiente de trabalho.",
      dimensao: "impactos-emocionais",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    },
    {
      id: 48,
      texto: "Sinto-me emocionalmente seguro(a) e respeitado(a) no ambiente de trabalho.",
      dimensao: "impactos-emocionais",
      tipo: "likert5",
      opcoes: [
        { valor: 1, texto: "Discordo totalmente" },
        { valor: 2, texto: "Discordo" },
        { valor: 3, texto: "Neutro" },
        { valor: 4, texto: "Concordo" },
        { valor: 5, texto: "Concordo totalmente" }
      ]
    }
  ]
};

export const configPercepacaoAssedio = {
  ...configPercepacaoAssedioRaw,
  nome: corrigirPTBR(configPercepacaoAssedioRaw.nome),
  descricao: corrigirPTBR(configPercepacaoAssedioRaw.descricao),
  categoria: corrigirPTBR(configPercepacaoAssedioRaw.categoria),
  tempoEstimado: corrigirPTBR(configPercepacaoAssedioRaw.tempoEstimado),
  baseCientifica: configPercepacaoAssedioRaw.baseCientifica.map(corrigirPTBR),
  objetivos: configPercepacaoAssedioRaw.objetivos.map(corrigirPTBR),
  beneficios: configPercepacaoAssedioRaw.beneficios.map(corrigirPTBR),
  dimensoes: configPercepacaoAssedioRaw.dimensoes.map(d => ({
    ...d,
    nome: corrigirPTBR(d.nome),
    descricao: corrigirPTBR(d.descricao)
  })),
  perguntas: configPercepacaoAssedioRaw.perguntas.map(p => ({
    ...p,
    texto: corrigirPTBR(p.texto),
    opcoes: p.opcoes.map(o => ({ ...o, texto: corrigirPTBR(o.texto) }))
  }))
};

// Função para calcular o resultado do teste
export function calcularResultadoPercepacaoAssedio(respostas: Record<number, number>): ResultadoPercepacaoAssedio {
  const dimensoes: DimensaoPercepacaoAssedio[] = [];
  
  // Calcular pontuação por dimensão
  configPercepacaoAssedio.dimensoes.forEach(dimensaoConfig => {
    const perguntasDimensao = dimensaoConfig.perguntasIds;
    let somaPontuacao = 0;
    let totalPerguntas = perguntasDimensao.length;
    
    perguntasDimensao.forEach(perguntaId => {
      const resposta = respostas[perguntaId] || 1;
      // Para a pergunta 48 (segurança emocional), inverter a pontuação
      if (perguntaId === 48) {
        somaPontuacao += (6 - resposta); // Inverte a escala
      } else {
        somaPontuacao += resposta;
      }
    });
    
    const mediaDimensao = somaPontuacao / totalPerguntas;
    
    // Determinar nível de risco
    let nivel: 'Baixo Risco' | 'Risco Moderado' | 'Alto Risco' | 'Risco Crítico';
    let alertaCritico = false;
    
    if (mediaDimensao <= 2.0) {
      nivel = 'Baixo Risco';
    } else if (mediaDimensao <= 3.0) {
      nivel = 'Risco Moderado';
    } else if (mediaDimensao <= 4.0) {
      nivel = 'Alto Risco';
      alertaCritico = true;
    } else {
      nivel = 'Risco Crítico';
      alertaCritico = true;
    }
    
    // Definir descrições e recomendações específicas por dimensão
    let descricao = '';
    let interpretacao = '';
    let recomendacoes: string[] = [];
    let cor = '';
    
    switch (dimensaoConfig.id) {
      case 'assedio-moral-direto':
        descricao = nivel === 'Baixo Risco' 
          ? 'Baixa percepção de assédio moral direto no ambiente de trabalho.'
          : nivel === 'Risco Moderado'
          ? 'Percepção moderada de situações de assédio moral direto.'
          : nivel === 'Alto Risco'
          ? 'Alta percepção de assédio moral direto - situação preocupante.'
          : 'Percepção crítica de assédio moral direto - intervenção urgente necessária.';
        
        interpretacao = corrigirPTBR('Avalia a exposição a agressões verbais, humilhações e comportamentos abusivos diretos.');
        
        recomendacoes = alertaCritico 
          ? [
              corrigirPTBR('Investigação imediata das situações relatadas'),
              corrigirPTBR('Treinamento urgente para gestores sobre conduta respeitosa'),
              corrigirPTBR('Implementação de medidas disciplinares quando necessário'),
              corrigirPTBR('Acompanhamento psicológico para colaboradores afetados')
            ]
          : [
              corrigirPTBR('Reforçar políticas de conduta respeitosa'),
              corrigirPTBR('Treinamentos preventivos sobre assédio moral'),
              corrigirPTBR('Monitoramento contínuo do clima organizacional')
            ];
        
        cor = 'from-red-500 to-rose-500';
        break;
        
      case 'assedio-moral-institucional':
        descricao = nivel === 'Baixo Risco'
          ? 'Cultura organizacional saudável com baixa tolerância a comportamentos abusivos.'
          : nivel === 'Risco Moderado'
          ? 'Alguns sinais de tolerância institucional a comportamentos inadequados.'
          : nivel === 'Alto Risco'
          ? 'Cultura organizacional com tolerância preocupante a comportamentos abusivos.'
          : 'Cultura institucional crítica - normalização de comportamentos abusivos.';
        
        interpretacao = corrigirPTBR('Avalia a cultura organizacional e a tolerância institucional a comportamentos abusivos.');
        
        recomendacoes = alertaCritico
          ? [
              'Revisão completa da cultura organizacional',
              'Treinamento de liderança sobre responsabilidade institucional',
              'Implementação de políticas anti-assédio mais rigorosas',
              'Auditoria dos processos de gestão de pessoas'
            ].map(corrigirPTBR)
          : [
              corrigirPTBR('Fortalecimento dos valores organizacionais'),
              corrigirPTBR('Comunicação clara sobre tolerância zero ao assédio'),
              corrigirPTBR('Capacitação contínua de lideranças')
            ];
        
        cor = 'from-orange-500 to-red-500';
        break;
        
      case 'assedio-sexual':
        descricao = nivel === 'Baixo Risco'
          ? 'Ambiente de trabalho com baixa percepção de assédio sexual.'
          : nivel === 'Risco Moderado'
          ? 'Algumas situações de desconforto relacionadas a assédio sexual.'
          : nivel === 'Alto Risco'
          ? 'Alta percepção de assédio sexual - situação grave.'
          : 'Percepção crítica de assédio sexual - intervenção imediata necessária.';
        
        interpretacao = corrigirPTBR('Avalia a exposição a comentários, gestos e comportamentos de cunho sexual inadequados.');
        
        recomendacoes = alertaCritico
          ? [
              'Investigação imediata e rigorosa das situações relatadas',
              'Medidas disciplinares severas para casos confirmados',
              'Treinamento obrigatório sobre assédio sexual',
              'Suporte psicológico especializado para vítimas',
              'Revisão das políticas de prevenção ao assédio sexual'
            ].map(corrigirPTBR)
          : [
              corrigirPTBR('Campanhas educativas sobre respeito e consentimento'),
              corrigirPTBR('Treinamentos preventivos regulares'),
              corrigirPTBR('Fortalecimento dos canais de denúncia')
            ];
        
        cor = 'from-purple-500 to-pink-500';
        break;
        
      case 'percepcao-ambiente-denuncias':
        descricao = nivel === 'Baixo Risco'
          ? 'Boa percepção dos canais de denúncia e confiança no sistema.'
          : nivel === 'Risco Moderado'
          ? 'Percepção moderada da efetividade dos canais de denúncia.'
          : nivel === 'Alto Risco'
          ? 'Baixa confiança nos canais de denúncia e processos.'
          : 'Desconfiança crítica nos sistemas de denúncia e proteção.';
        
        interpretacao = corrigirPTBR('Avalia a confiança nos canais de denúncia e na resposta organizacional.');
        
        recomendacoes = alertaCritico
          ? [
              'Reestruturação completa dos canais de denúncia',
              'Garantia de anonimato e proteção contra retaliações',
              'Treinamento especializado para equipes de RH e ética',
              'Comunicação transparente sobre processos e resultados'
            ].map(corrigirPTBR)
          : [
              corrigirPTBR('Melhoria da comunicação sobre canais disponíveis'),
              corrigirPTBR('Treinamento para gestores sobre acolhimento de denúncias'),
              corrigirPTBR('Feedback regular sobre ações tomadas')
            ];
        
        cor = 'from-blue-500 to-cyan-500';
        break;
        
      case 'impactos-emocionais':
        descricao = nivel === 'Baixo Risco'
          ? 'Baixo impacto emocional negativo do ambiente de trabalho.'
          : nivel === 'Risco Moderado'
          ? 'Alguns impactos emocionais relacionados ao ambiente de trabalho.'
          : nivel === 'Alto Risco'
          ? 'Alto impacto emocional negativo - bem-estar comprometido.'
          : 'Impacto emocional crítico - risco à saúde mental dos colaboradores.';
        
        interpretacao = corrigirPTBR('Avalia os impactos na segurança emocional e bem-estar dos colaboradores.');
        
        recomendacoes = alertaCritico
          ? [
              'Programa de apoio psicológico imediato',
              'Avaliação de riscos psicossociais urgente',
              'Implementação de medidas de proteção à saúde mental',
              'Monitoramento contínuo do bem-estar dos colaboradores'
            ].map(corrigirPTBR)
          : [
              corrigirPTBR('Programas de bem-estar e qualidade de vida'),
              corrigirPTBR('Suporte psicológico preventivo'),
              corrigirPTBR('Ações para melhoria do clima organizacional')
            ];
        
        cor = 'from-green-500 to-emerald-500';
        break;
    }
    
    // Calcular percentual da dimensão
    const percentualDimensao = ((mediaDimensao - 1) / 4) * 100;
    
    dimensoes.push({
      nome: corrigirPTBR(dimensaoConfig.nome),
      pontuacao: Math.round(mediaDimensao * 100) / 100,
      percentual: Math.round(percentualDimensao * 100) / 100,
      nivel,
      descricao: corrigirPTBR(descricao),
      interpretacao,
      alertaCritico,
      recomendacoes: recomendacoes.map(corrigirPTBR),
      cor,
      icone: dimensaoConfig.icone || 'AlertTriangle'
    });
  });
  
  // Calcular índice geral
  const somaTotal = Object.values(respostas).reduce((acc, valor) => {
    // Inverter pontuação da pergunta 48
    if (Object.keys(respostas).find(key => parseInt(key) === 48 && respostas[48] === valor)) {
      return acc + (6 - valor);
    }
    return acc + valor;
  }, 0);
  
  const indiceGeral = somaTotal / 48;
  
  // Determinar nível de risco geral
  let nivelRiscoGeral: 'Baixo Risco' | 'Risco Moderado' | 'Alto Risco' | 'Risco Crítico';
  if (indiceGeral <= 2.0) {
    nivelRiscoGeral = 'Baixo Risco';
  } else if (indiceGeral <= 3.0) {
    nivelRiscoGeral = 'Risco Moderado';
  } else if (indiceGeral <= 4.0) {
    nivelRiscoGeral = 'Alto Risco';
  } else {
    nivelRiscoGeral = 'Risco Crítico';
  }
  
  // Gerar alertas críticos
  const alertasCriticos = dimensoes
    .filter(d => d.alertaCritico)
    .map(d => corrigirPTBR(`Alerta crítico na dimensão "${d.nome}": ${d.descricao}`));
  
  // Gerar insights
  const insights = [
    corrigirPTBR(`Índice geral de percepção de assédio: ${Math.round(indiceGeral * 100) / 100} (${nivelRiscoGeral})`),
    corrigirPTBR(`${alertasCriticos.length} dimensão(ões) em estado crítico ou de alto risco`),
    dimensoes.find(d => d.nivel === 'Baixo Risco') 
      ? corrigirPTBR(`Pontos positivos identificados em: ${dimensoes.filter(d => d.nivel === 'Baixo Risco').map(d => d.nome).join(', ')}`)
      : corrigirPTBR('Todas as dimensões apresentam algum nível de risco - atenção necessária')
  ];
  
  // Gerar recomendações educativas
  const recomendacoesEducativas = [
    corrigirPTBR('Implementar programa abrangente de educação sobre assédio moral e sexual'),
    corrigirPTBR('Realizar campanhas de conscientização sobre respeito e diversidade'),
    corrigirPTBR('Desenvolver treinamentos específicos para lideranças sobre prevenção ao assédio'),
    corrigirPTBR('Criar materiais educativos sobre direitos e deveres no ambiente de trabalho'),
    corrigirPTBR('Estabelecer programa de mentoria e apoio entre colaboradores')
  ];
  
  // Gerar recomendações disciplinares
  const recomendacoesDisciplinares = alertasCriticos.length > 0 ? [
    corrigirPTBR('Investigar imediatamente todas as situações de risco crítico identificadas'),
    corrigirPTBR('Aplicar medidas disciplinares apropriadas para casos confirmados de assédio'),
    corrigirPTBR('Implementar política de tolerância zero para comportamentos abusivos'),
    corrigirPTBR('Estabelecer consequências claras e progressivas para violações'),
    corrigirPTBR('Documentar adequadamente todos os casos e ações tomadas')
  ] : [
    corrigirPTBR('Manter política preventiva de monitoramento comportamental'),
    corrigirPTBR('Estabelecer protocolos claros para situações futuras'),
    corrigirPTBR('Reforçar consequências para comportamentos inadequados')
  ];
  
  // Calcular percentual geral
  const percentualGeral = ((indiceGeral - 1) / 4) * 100;
  
  // Gerar classificação geral
  const classificacaoGeral = nivelRiscoGeral === 'Baixo Risco' 
    ? corrigirPTBR('Ambiente Seguro e Respeitoso')
    : nivelRiscoGeral === 'Risco Moderado'
    ? corrigirPTBR('Ambiente com Sinais de Alerta')
    : nivelRiscoGeral === 'Alto Risco'
    ? corrigirPTBR('Ambiente de Risco Elevado')
    : corrigirPTBR('Ambiente Altamente Tóxico');

  // Calcular indicadores ESG
  const indicadoresESG = {
    diversidadeInclusao: Math.max(0, 100 - percentualGeral),
    segurancaPsicologica: Math.max(0, 100 - (dimensoes.find(d => d.nome.includes('Impactos'))?.pontuacao || 0) * 25),
    culturaCorporativa: Math.max(0, 100 - (dimensoes.find(d => d.nome.includes('Institucional'))?.pontuacao || 0) * 25)
  };

  return {
    id: `pas-${Date.now()}`,
    testeId: 'percepcao-assedio',
    nomeTeste: corrigirPTBR('HumaniQ PAS - Percepção de Assédio Moral e Sexual'),
    dataRealizacao: new Date().toISOString(),
    indiceGeralAssedio: Math.round(indiceGeral * 100) / 100,
    percentualGeral: Math.round(percentualGeral * 100) / 100,
    nivelRiscoGeral,
    classificacaoGeral,
    dimensoes,
    alertasCriticos,
    insights,
    recomendacoesEducativas,
    recomendacoesDisciplinares,
    relatorioESG: {
      conformidadeLegal: nivelRiscoGeral === 'Baixo Risco' || nivelRiscoGeral === 'Risco Moderado',
      riscosIdentificados: dimensoes
        .filter(d => d.alertaCritico)
        .map(d => `${d.nome}: ${d.nivel}`),
      acoesPreventivasRecomendadas: [
        corrigirPTBR('Fortalecimento da cultura organizacional inclusiva'),
        corrigirPTBR('Implementação de políticas anti-assédio robustas'),
        corrigirPTBR('Treinamentos regulares para todos os colaboradores'),
        corrigirPTBR('Monitoramento contínuo do clima organizacional'),
        corrigirPTBR('Canais de denúncia seguros e efetivos')
      ],
      indicadoresESG
    },
    metadados: {
      versaoTeste: '1.0',
      totalPerguntas: 48,
      confiabilidade: 0.92,
      validadeEstatistica: true
    }
  };
}

// Escala Likert para o teste PAS
const escalaLikertPASRaw = [
  { valor: 1, texto: "Discordo totalmente" },
  { valor: 2, texto: "Discordo" },
  { valor: 3, texto: "Neutro" },
  { valor: 4, texto: "Concordo" },
  { valor: 5, texto: "Concordo totalmente" }
];
export const escalaLikertPAS = escalaLikertPASRaw.map(o => ({ ...o, texto: corrigirPTBR(o.texto) }));