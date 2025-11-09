// Servidor simples para testar se o Node.js está funcionando
const express = require('express');
const cors = require('cors');
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const schema = require('./shared/schema');

const app = express();
const PORT = 3001;

// Configuração do banco de dados PostgreSQL
let db = null;
let client = null;

// Função para inicializar conexão com banco
try {
  if (process.env.DATABASE_URL) {
    client = postgres(process.env.DATABASE_URL, {
      max: 20,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    db = drizzle(client, { schema });
    console.log('✅ Conexão com PostgreSQL estabelecida');
  } else {
    console.log('⚠️  DATABASE_URL não configurada, usando dados mock');
  }
} catch (error) {
  console.error('❌ Erro ao conectar ao PostgreSQL:', error.message);
  console.log('⚠️  Usando dados mock como fallback');
}
// Sessão simples em memória para identificar o último usuário logado
let currentSession = null;

// Armazenamento de colaboradores por empresa (populado somente via convites aceitos)
const colaboradoresPorEmpresa = {
  'empresa-mock-1': [],
  'empresa-luiz-mock': []
};

// Middleware
app.use(cors({
  origin: 'http://localhost:5000',
  credentials: true
}));
app.use(express.json());

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Servidor temporário funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Health check também disponível sob /api/health
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API mock funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota de login temporária (mock)
app.post('/api/auth/login', (req, res) => {
  console.log('🔄 Tentativa de login recebida:', req.body);

  const email = String(req.body?.email || '').toLowerCase().trim();
  const nome = req.body?.nome || 'Usuário Teste';

  // Definição de role baseada em e-mail (mock confiável para dev)
  // Regra: empresa tem prioridade; admin somente para e-mails explicitamente admin
  let role = 'empresa';
  let empresaId = 'empresa-mock-1';

  if (email === 'admin@humaniq.com' || email.startsWith('admin@')) {
    role = 'admin';
    empresaId = undefined;
  }
  if (email === 'luiz@humaniq.com') {
    role = 'empresa';
    empresaId = 'empresa-luiz-mock';
  }

  // Mock de resposta de login com role correto
  currentSession = {
    id: '1',
    email,
    nome,
    role,
    empresaId,
  };
  res.json({
    token: 'mock_token_123',
    user: {
      id: '1',
      email,
      nome,
      role,
      empresaId,
    }
  });
});

// Registro de admin (mock)
app.post('/api/auth/register/admin', (req, res) => {
  const { email, nome } = req.body || {};
  res.json({
    token: 'mock_admin_token',
    user: {
      id: 'admin-1',
      email: email || 'admin@example.com',
      nome: nome || 'Administrador',
      role: 'admin'
    }
  });
});

// ====== Mocks de Convites ======
const convites = [];

app.post('/api/convites/empresa', (req, res) => {
  const { nomeEmpresa, emailContato, diasValidade = 7 } = req.body || {};
  const token = `empresa-${Date.now()}`;
  const convite = {
    id: `${convites.length + 1}`,
    token,
    nomeEmpresa: nomeEmpresa || 'Empresa Mock',
    emailContato: emailContato || 'contato@empresa.mock',
    validade: new Date(Date.now() + diasValidade * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    diasAcesso: diasValidade,
    status: 'pendente',
    tipo: 'empresa',
    linkConvite: `http://localhost:5000/cadastro?token=${token}`
  };
  convites.push(convite);
  res.json({ convite, linkConvite: convite.linkConvite });
});

app.post('/api/convites/colaborador', (req, res) => {
  const { nome, email, diasValidade = 7, cargo, departamento } = req.body || {};
  const empresaId = currentSession?.empresaId;
  if (!empresaId) {
    return res.status(401).json({ success: false, message: 'Empresa não autenticada' });
  }
  const token = `colab-${Date.now()}`;
  const convite = {
    id: `${convites.length + 1}`,
    token,
    nome: nome || '—',
    email: email || '—',
    cargo: cargo || '—',
    departamento: departamento || '—',
    validade: new Date(Date.now() + diasValidade * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    diasAcesso: diasValidade,
    status: 'pendente',
    tipo: 'colaborador',
    empresaId,
    linkConvite: `http://localhost:5000/cadastro?token=${token}`
  };
  convites.push(convite);
  res.json({ convite, linkConvite: convite.linkConvite });
});

app.get('/api/convites/token/:token', (req, res) => {
  const { token } = req.params;
  const { tipo = 'empresa' } = req.query;
  const convite = convites.find(c => c.token === token) || {
    id: '0', token, status: 'pendente', validade: new Date(Date.now() + 86400000).toISOString()
  };
  res.json({ convite, tipo });
});

app.post('/api/convites/empresa/aceitar/:token', (req, res) => {
  const { token } = req.params;
  res.json({ message: 'Convite de empresa aceito!', empresa: { id: 'emp-1', token } });
});

app.post('/api/convites/colaborador/aceitar/:token', (req, res) => {
  const { token } = req.params;
  // localizar convite
  const idx = convites.findIndex(c => c.token === token && c.tipo === 'colaborador');
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Convite não encontrado' });
  }
  const convite = convites[idx];
  const agora = new Date();
  if (new Date(convite.validade) < agora) {
    return res.status(400).json({ success: false, message: 'Convite expirado' });
  }
  // marcar como aceito
  convite.status = 'aceito';

  // criar colaborador real vinculado à empresa do convite
  const empresaId = convite.empresaId;
  if (!empresaId) {
    return res.status(400).json({ success: false, message: 'Convite sem empresa vinculada' });
  }

  if (!colaboradoresPorEmpresa[empresaId]) {
    colaboradoresPorEmpresa[empresaId] = [];
  }

  const novoColaborador = {
    id: `colab-${Date.now()}`,
    nome: convite.nome !== '—' ? convite.nome : (req.body?.nome || 'Colaborador'),
    email: convite.email !== '—' ? convite.email : (req.body?.email || ''),
    cargo: convite.cargo !== '—' ? convite.cargo : (req.body?.cargo || ''),
    departamento: convite.departamento !== '—' ? convite.departamento : (req.body?.departamento || ''),
    avatar: '',
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    total_testes: 0,
    ultimo_teste: null,
    situacaoPsicossocial: {
      status: 'nao_avaliado',
      descricao: 'Sem dados suficientes para análise.',
      cor: '#9E9E9E',
      totalTestes: 0,
      ultimoTeste: null,
      indicadores: []
    }
  };

  colaboradoresPorEmpresa[empresaId].push(novoColaborador);
  return res.json({ success: true, message: 'Convite de colaborador aceito!', colaborador: novoColaborador });
});

app.get('/api/convites/listar', (req, res) => {
  res.json({ convites, tipo: 'todos' });
});

app.delete('/api/convites/colaborador/:token', (req, res) => {
  const { token } = req.params;
  const idx = convites.findIndex(c => c.token === token);
  if (idx >= 0) convites.splice(idx, 1);
  res.json({ success: true, message: `Convite de colaborador ${token} cancelado` });
});

app.delete('/api/convites/empresa/:token', (req, res) => {
  const { token } = req.params;
  const idx = convites.findIndex(c => c.token === token);
  if (idx >= 0) convites.splice(idx, 1);
  res.json({ success: true, message: `Convite de empresa ${token} cancelado` });
});

// ====== Mocks de Testes ======
const testes = [
  { id: 'clima-bem-estar', nome: 'Clima e Bem-Estar' },
  { id: 'mgrp', nome: 'MGRP' }
];

app.get('/api/testes', async (req, res) => {
  try {
    // Se não houver conexão com banco, usar mock como fallback
    if (!db) {
      return res.json({ testes });
    }

    const { desc } = require('drizzle-orm');

    // Buscar todos os testes disponíveis
    const testesDoBanco = await db
      .select()
      .from(schema.testes)
      .orderBy(desc(schema.testes.createdAt));

    // Tratamento de estado vazio
    if (testesDoBanco.length === 0) {
      console.log('⚠️ [Real] Nenhum teste encontrado no banco de dados');
      return res.json({ 
        testes: [], 
        message: 'Nenhum teste disponível no momento',
        total: 0 
      });
    }

    console.log('📋 Testes encontrados no banco:', testesDoBanco.length);
    res.json({ testes: testesDoBanco, total: testesDoBanco.length });

  } catch (error) {
    console.error('❌ Erro ao buscar testes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar testes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/testes/:testeId/perguntas', async (req, res) => {
  try {
    // Se não houver conexão com banco, usar mock como fallback
    if (!db) {
      const perguntas = [
        { perguntaId: 'p1', texto: 'Pergunta 1', tipo: 'escala' },
        { perguntaId: 'p2', texto: 'Pergunta 2', tipo: 'escala' },
        { perguntaId: 'p3', texto: 'Pergunta 3', tipo: 'escala' }
      ];
      return res.json({ perguntas, total: perguntas.length });
    }

    const { testeId } = req.params;
    const { eq, desc } = require('drizzle-orm');

    // Verificar se o teste existe
    const testeResult = await db
      .select()
      .from(schema.testes)
      .where(eq(schema.testes.id, testeId))
      .limit(1);

    if (testeResult.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Teste não encontrado' 
      });
    }

    // Buscar perguntas do teste
    const perguntas = await db
      .select()
      .from(schema.perguntas)
      .where(eq(schema.perguntas.testeId, testeId))
      .orderBy(desc(schema.perguntas.createdAt));

    // Tratamento de estado vazio
    if (perguntas.length === 0) {
      console.log(`⚠️ [Real] Nenhuma pergunta encontrada para o teste: ${testeId}`);
      return res.json({ 
        perguntas: [], 
        message: 'Nenhuma pergunta encontrada para este teste',
        total: 0 
      });
    }

    console.log('❓ Perguntas encontradas para o teste:', perguntas.length);
    res.json({ perguntas, total: perguntas.length });

  } catch (error) {
    console.error('❌ Erro ao buscar perguntas do teste:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar perguntas do teste',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

const resultados = [];

app.post('/api/testes/resultado', async (req, res) => {
  try {
    // Se não houver conexão com banco, usar mock como fallback
    if (!db) {
      const { pontuacaoTotal = 0 } = req.body || {};
      const resultado = { id: `res-${Date.now()}`, pontuacaoTotal, dataRealizacao: new Date().toISOString() };
      resultados.push(resultado);
      return res.json({ message: 'Resultado salvo (mock)', resultado });
    }

    const { 
      colaboradorId, 
      testeId, 
      pontuacao, 
      pontuacaoMaxima, 
      percentual, 
      respostas,
      tempoDuracao 
    } = req.body;

    if (!colaboradorId || !testeId) {
      return res.status(400).json({ 
        success: false, 
        message: 'colaboradorId e testeId são obrigatórios' 
      });
    }

    const { eq } = require('drizzle-orm');

    // Verificar se o colaborador existe
    const colaboradorResult = await db
      .select()
      .from(schema.colaboradores)
      .where(eq(schema.colaboradores.id, colaboradorId))
      .limit(1);

    if (colaboradorResult.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Colaborador não encontrado' 
      });
    }

    // Verificar se o teste existe
    const testeResult = await db
      .select()
      .from(schema.testes)
      .where(eq(schema.testes.id, testeId))
      .limit(1);

    if (testeResult.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Teste não encontrado' 
      });
    }

    // Inserir resultado no banco
    const [novoResultado] = await db
      .insert(schema.resultados)
      .values({
        id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        colaboradorId,
        testeId,
        pontuacao: pontuacao || 0,
        pontuacaoMaxima: pontuacaoMaxima || 100,
        percentual: percentual || 0,
        dataRealizacao: new Date(),
        tempoDuracao: tempoDuracao || null
      })
      .returning();

    // Se houver respostas, salvar cada uma
    if (respostas && Array.isArray(respostas) && respostas.length > 0) {
      const respostasValues = respostas.map(resposta => ({
        id: `resp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        resultadoId: novoResultado.id,
        perguntaId: resposta.perguntaId,
        valor: resposta.valor,
        dataResposta: new Date()
      }));

      await db.insert(schema.respostas).values(respostasValues);
    }

    console.log('✅ Resultado salvo no banco:', novoResultado.id);
    res.json({ 
      success: true, 
      message: 'Resultado salvo com sucesso',
      resultado: novoResultado
    });

  } catch (error) {
    console.error('❌ Erro ao salvar resultado:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao salvar resultado',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post('/api/testes/resultado/anonimo', (req, res) => {
  const { pontuacaoTotal = 0 } = req.body || {};
  const resultado = { id: `res-anon-${Date.now()}`, pontuacaoTotal, dataRealizacao: new Date().toISOString() };
  resultados.push(resultado);
  res.json({ message: 'Resultado anônimo salvo', resultado });
});

app.get('/api/testes/resultados/meus', (req, res) => {
  res.json({ resultados, total: resultados.length });
});

app.get('/api/testes/resultado/:id', (req, res) => {
  const { id } = req.params;
  const empresaId = currentSession?.empresaId || 'empresa-mock-1';
  const empresaResultados = resultadosPorEmpresa[empresaId] || {};
  const todosResultadosLista = Object.values(empresaResultados).flat();

  // Tentar localizar um resultado específico pelo ID
  const resultadoDaLista = todosResultadosLista.find(r => r.id === id);
  const resultadoSimples = resultados.find(r => r.id === id);

  if (resultadoDaLista || resultadoSimples) {
    const resultado = resultadoDaLista || resultadoSimples;
    const respostas = [
      { perguntaId: 'p1', valor: '3' },
      { perguntaId: 'p2', valor: '4' }
    ];
    return res.json({ resultado, respostas });
  }

  // Caso não seja um ID de resultado, tratar como colaboradorId e retornar a lista
  const lista = empresaResultados[id] || [];
  console.log(`📈 [Mock] Listando resultados por colaboradorId=${id} na empresa ${empresaId} (total: ${lista.length})`);
  return res.json({ data: lista });
});

// ====== Mocks de Resultados por Colaborador ======
// Estrutura: resultados por empresa e colaborador, para suportar a página de resultados
const resultadosPorEmpresa = {
  'empresa-mock-1': {
    'colab-001': [
      {
        id: 'res-colab-001-1',
        testeId: 'clima-bem-estar',
        nomeTest: 'Clima e Bem-Estar',
        categoria: 'Clima Organizacional',
        pontuacao: 78,
        pontuacaoMaxima: 100,
        percentual: 78,
        status: 'concluido',
        dataRealizacao: new Date(Date.now() - 7 * 86400000).toISOString(),
        tempoDuracao: 25,
        observacoes: 'Indicadores positivos, manutenção recomendada',
        tipoTabela: 'resultados',
        nivel: 'bom'
      },
      {
        id: 'res-colab-001-2',
        testeId: 'mgrp',
        nomeTest: 'MGRP',
        categoria: 'Riscos Psicossociais',
        pontuacao: 62,
        pontuacaoMaxima: 100,
        percentual: 62,
        status: 'concluido',
        dataRealizacao: new Date(Date.now() - 20 * 86400000).toISOString(),
        tempoDuracao: 30,
        observacoes: 'Atenção moderada a estresse',
        tipoTabela: 'resultados_rpo',
        nivel: 'atencao'
      }
    ],
    'colab-002': [
      {
        id: 'res-colab-002-1',
        testeId: 'clima-bem-estar',
        nomeTest: 'Clima e Bem-Estar',
        categoria: 'Clima Organizacional',
        pontuacao: 84,
        pontuacaoMaxima: 100,
        percentual: 84,
        status: 'concluido',
        dataRealizacao: new Date(Date.now() - 15 * 86400000).toISOString(),
        tempoDuracao: 22,
        observacoes: 'Bom engajamento',
        tipoTabela: 'resultados',
        nivel: 'bom'
      }
    ],
    'colab-003': [
      {
        id: 'res-colab-003-1',
        testeId: 'mgrp',
        nomeTest: 'MGRP',
        categoria: 'Riscos Psicossociais',
        pontuacao: 40,
        pontuacaoMaxima: 100,
        percentual: 40,
        status: 'concluido',
        dataRealizacao: new Date(Date.now() - 40 * 86400000).toISOString(),
        tempoDuracao: 35,
        observacoes: 'Sem dados suficientes para análise conclusiva',
        tipoTabela: 'resultados_rpo',
        nivel: 'nao_avaliado'
      }
    ]
  },
  'empresa-luiz-mock': {
    // Caso não existam colaboradores mockados para esta empresa, retornar vazio sem erro
  }
};

// Listar resultados de testes por colaborador (compatível com frontend atual)
// Atenção: utiliza a mesma rota do detalhe de resultado, mas retorna lista quando recebe colaboradorId
app.get('/api/testes/resultado/:colaboradorId', (req, res) => {
  const { colaboradorId } = req.params;
  const empresaId = currentSession?.empresaId || 'empresa-mock-1';

  // Se existir um resultado com este ID exato na coleção simples de resultados, retorna o detalhe (retrocompatibilidade)
  const resultadoDireto = resultados.find(r => r.id === colaboradorId);
  if (resultadoDireto) {
    const respostas = [
      { perguntaId: 'p1', valor: '3' },
      { perguntaId: 'p2', valor: '4' }
    ];
    return res.json({ resultado: resultadoDireto, respostas });
  }

  // Caso contrário, tratar como colaboradorId e retornar lista
  const empresaResultados = resultadosPorEmpresa[empresaId] || {};
  const lista = empresaResultados[colaboradorId] || [];
  console.log(`📈 Listando resultados do colaborador ${colaboradorId} na empresa ${empresaId} (total: ${lista.length})`);
  return res.json({ data: lista });
});

// ====== Mock de Estado Psicossocial da Empresa ======
app.get('/api/empresas/estado-psicossocial', async (req, res) => {
  try {
    // Se não houver conexão com banco, usar mock como fallback
    if (!db) {
      const empresaId = currentSession?.empresaId || 'empresa-mock-1';
      const colaboradores = (colaboradoresPorEmpresa[empresaId] || []);
      const empresaResultados = resultadosPorEmpresa[empresaId] || {};
      const resultadosLista = Object.values(empresaResultados).flat();

      const totalColaboradores = colaboradores.length;
      const totalTestesRealizados = resultadosLista.length;
      const trintaDiasAtras = new Date(Date.now() - 30 * 86400000);
      const testesUltimos30Dias = resultadosLista.filter(r => new Date(r.dataRealizacao) >= trintaDiasAtras).length;

      // Cobertura: colaboradores com pelo menos 1 teste concluído
      const colaboradoresComTeste = new Set((resultadosLista || []).map(r => {
        const match = String(r.id).match(/res-colab-(\d+)-/);
        if (match) return `colab-${match[1]}`;
        return undefined;
      }).filter(Boolean));
      const cobertura = totalColaboradores > 0 ? Math.round((colaboradoresComTeste.size / totalColaboradores) * 100) : 0;

      // Dimensões simples agregadas a partir das categorias
      const dimensoesBase = [
        { dimensaoId: 'clima-organizacional', nome: 'Clima Organizacional' },
        { dimensaoId: 'riscos-psicossociais', nome: 'Riscos Psicossociais' },
        { dimensaoId: 'apoio-social', nome: 'Apoio Social' },
        { dimensaoId: 'equilibrio-vida-trabalho', nome: 'Equilíbrio Vida-Trabalho' }
      ];
      const dimensoes = dimensoesBase.map((d, idx) => {
        const relacionados = resultadosLista.filter(r => (r.categoria || '').toLowerCase().includes(d.nome.toLowerCase().split(' ')[0]));
        const media = relacionados.length > 0 ? Math.round(relacionados.reduce((acc, r) => acc + (r.percentual || 0), 0) / relacionados.length) : 0;
        let nivel = 'Bom';
        let cor = 'green';
        if (media < 40) { nivel = 'Crítico'; cor = 'red'; }
        else if (media < 60) { nivel = 'Atenção'; cor = 'orange'; }
        else if (media < 75) { nivel = 'Moderado'; cor = 'yellow'; }
        return { dimensaoId: d.dimensaoId, nome: d.nome, percentual: media, nivel, cor, total: relacionados.length };
      });

      const indiceGeralBemEstar = dimensoes.length > 0 ? Math.round(dimensoes.reduce((acc, d) => acc + d.percentual, 0) / dimensoes.length) : 0;

      const nr1Fatores = [
        { fator: 'Carga de Trabalho', nivel: 'Moderado', percentual: Math.max(0, indiceGeralBemEstar - 10) },
        { fator: 'Autonomia e Controle', nivel: 'Bom', percentual: Math.max(0, indiceGeralBemEstar - 5) },
        { fator: 'Suporte Social', nivel: 'Bom', percentual: indiceGeralBemEstar },
        { fator: 'Assédio e Violência', nivel: 'Atenção', percentual: Math.max(0, 60 - (indiceGeralBemEstar / 2)) }
      ];

      const proximaAvaliacao = new Date();
      proximaAvaliacao.setMonth(proximaAvaliacao.getMonth() + 24);

      const nr1Compliance = {
        status: totalTestesRealizados > 0 ? 'Conforme' : 'Pendente',
        ultimaAvaliacao: resultadosLista[0]?.dataRealizacao || null,
        proximaAvaliacao: proximaAvaliacao.toISOString(),
        testesRealizados: totalTestesRealizados,
        cobertura
      };

      const analise = {
        indiceGeralBemEstar,
        totalColaboradores,
        totalTestesRealizados,
        testesUltimos30Dias,
        cobertura,
        dimensoes,
        nr1Fatores,
        nr1Compliance,
        alertasCriticos: [],
        recomendacoes: [
          {
            categoria: 'Saúde Organizacional',
            prioridade: 'média',
            titulo: 'Manter ações de bem-estar',
            descricao: 'Consolidar práticas de apoio e prevenção a estresse.'
          }
        ],
        ultimaAtualizacao: new Date().toISOString()
      };

      console.log(`📊 [Mock] Estado psicossocial da empresa: ${empresaId}`);
      return res.json({ analise });
    }

    const empresaId = currentSession?.empresaId;
    if (!empresaId) {
      return res.status(401).json({ success: false, message: 'Empresa não autenticada' });
    }

    const { eq, and, desc, sql } = require('drizzle-orm');

    // Buscar colaboradores da empresa
    const colaboradores = await db
      .select()
      .from(schema.colaboradores)
      .where(eq(schema.colaboradores.empresaId, empresaId));

    // Buscar resultados de testes da empresa
    const resultados = await db
      .select({
        id: schema.resultados.id,
        colaboradorId: schema.resultados.colaboradorId,
        testeId: schema.resultados.testeId,
        dataRealizacao: schema.resultados.dataRealizacao,
        percentual: schema.resultados.percentual,
        categoria: schema.testes.categoria,
        nomeTest: schema.testes.nome
      })
      .from(schema.resultados)
      .innerJoin(schema.testes, eq(schema.resultados.testeId, schema.testes.id))
      .innerJoin(schema.colaboradores, eq(schema.resultados.colaboradorId, schema.colaboradores.id))
      .where(eq(schema.colaboradores.empresaId, empresaId))
      .orderBy(desc(schema.resultados.dataRealizacao));

    const totalColaboradores = colaboradores.length;
    const totalTestesRealizados = resultados.length;
    const trintaDiasAtras = new Date(Date.now() - 30 * 86400000);
    const testesUltimos30Dias = resultados.filter(r => new Date(r.dataRealizacao) >= trintaDiasAtras).length;

    // Cobertura: colaboradores com pelo menos 1 teste concluído
    const colaboradoresComTeste = new Set(resultados.map(r => r.colaboradorId));
    const cobertura = totalColaboradores > 0 ? Math.round((colaboradoresComTeste.size / totalColaboradores) * 100) : 0;

    // Dimensões baseadas nas categorias reais dos testes
    const dimensoesBase = [
      { dimensaoId: 'clima-organizacional', nome: 'Clima Organizacional' },
      { dimensaoId: 'riscos-psicossociais', nome: 'Riscos Psicossociais' },
      { dimensaoId: 'apoio-social', nome: 'Apoio Social' },
      { dimensaoId: 'equilibrio-vida-trabalho', nome: 'Equilíbrio Vida-Trabalho' }
    ];

    const dimensoes = dimensoesBase.map(d => {
      const relacionados = resultados.filter(r => 
        r.categoria && r.categoria.toLowerCase().includes(d.nome.toLowerCase().split(' ')[0])
      );
      const media = relacionados.length > 0 ? Math.round(relacionados.reduce((acc, r) => acc + (r.percentual || 0), 0) / relacionados.length) : 0;
      let nivel = 'Bom';
      let cor = 'green';
      if (media < 40) { nivel = 'Crítico'; cor = 'red'; }
      else if (media < 60) { nivel = 'Atenção'; cor = 'orange'; }
      else if (media < 75) { nivel = 'Moderado'; cor = 'yellow'; }
      return { dimensaoId: d.dimensaoId, nome: d.nome, percentual: media, nivel, cor, total: relacionados.length };
    });

    const indiceGeralBemEstar = dimensoes.length > 0 ? Math.round(dimensoes.reduce((acc, d) => acc + d.percentual, 0) / dimensoes.length) : 0;

    const nr1Fatores = [
      { fator: 'Carga de Trabalho', nivel: 'Moderado', percentual: Math.max(0, indiceGeralBemEstar - 10) },
      { fator: 'Autonomia e Controle', nivel: 'Bom', percentual: Math.max(0, indiceGeralBemEstar - 5) },
      { fator: 'Suporte Social', nivel: 'Bom', percentual: indiceGeralBemEstar },
      { fator: 'Assédio e Violência', nivel: 'Atenção', percentual: Math.max(0, 60 - (indiceGeralBemEstar / 2)) }
    ];

    const proximaAvaliacao = new Date();
    proximaAvaliacao.setMonth(proximaAvaliacao.getMonth() + 24);

    const nr1Compliance = {
      status: totalTestesRealizados > 0 ? 'Conforme' : 'Pendente',
      ultimaAvaliacao: resultados[0]?.dataRealizacao || null,
      proximaAvaliacao: proximaAvaliacao.toISOString(),
      testesRealizados: totalTestesRealizados,
      cobertura
    };

    const analise = {
      indiceGeralBemEstar,
      totalColaboradores,
      totalTestesRealizados,
      testesUltimos30Dias,
      cobertura,
      dimensoes,
      nr1Fatores,
      nr1Compliance,
      alertasCriticos: [],
      recomendacoes: [
        {
          categoria: 'Saúde Organizacional',
          prioridade: 'média',
          titulo: 'Manter ações de bem-estar',
          descricao: 'Consolidar práticas de apoio e prevenção a estresse.'
        }
      ],
      ultimaAtualizacao: new Date().toISOString()
    };

    console.log(`📊 [Real] Estado psicossocial da empresa: ${empresaId} (total colab: ${totalColaboradores}, testes: ${totalTestesRealizados})`);
    res.json({ analise });
  } catch (error) {
    console.error('❌ Erro ao buscar estado psicossocial:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar estado psicossocial' });
  }
});

// ====== Mock de PRG (Programa de Gerenciamento de Riscos Psicossociais) ======
// Contrato conforme EmpresaPRG.tsx: retorna { empresa: EmpresaData, prg: PRGData }
app.get('/api/empresas/pgr', async (req, res) => {
  try {
    // Se não houver conexão com banco, usar mock como fallback
    if (!db) {
      const empresaId = currentSession?.empresaId || 'empresa-mock-1';

      // Dados da empresa (mockados a partir dos colaboradores/resultados existentes)
      const empresaMap = {
        'empresa-mock-1': {
          nome: 'Empresa Mock 1',
          cnpj: '00.000.000/0001-01',
          endereco: 'Rua das Acácias, 100 - São Paulo/SP',
          setor: 'Tecnologia'
        },
        'empresa-luiz-mock': {
          nome: 'HumaniQ - Empresa Luiz',
          cnpj: '11.111.111/0001-11',
          endereco: 'Av. Paulista, 2000 - São Paulo/SP',
          setor: 'Serviços'
        }
      };

      const empresa = empresaMap[empresaId] || {
        nome: 'Empresa Desconhecida',
        cnpj: '00.000.000/0000-00',
        endereco: 'Não informado',
        setor: 'Não informado'
      };

      // Coleta de dados da empresa corrente
      const colaboradoresList = (colaboradoresPorEmpresa[empresaId] || []);
      const resultadosEmpresa = resultadosPorEmpresa[empresaId] || {};
      const resultadosList = Object.values(resultadosEmpresa).flat();

      // KPIs principais
      const totalColaboradores = colaboradoresList.length;
      const totalTestes = resultadosList.length;
      const cobertura = totalColaboradores > 0
        ? Math.round((new Set(resultadosList.map(r => {
            const match = String(r.id).match(/res-colab-(\d+)-/);
            return match ? `colab-${match[1]}` : undefined;
          })).size / totalColaboradores) * 100)
        : 0;

      const climaRel = resultadosList.filter(r => (r.categoria || '').toLowerCase().includes('clima'));
      const estresseRel = resultadosList.filter(r => (r.nomeTest || '').toLowerCase().includes('mgrp'));
      const burnoutRel = resultadosList.filter(r => (r.nomeTest || '').toLowerCase().includes('burnout'));
      const qvtRel = resultadosList.filter(r => (r.nomeTest || '').toLowerCase().includes('qvt'));
      const assedioRel = resultadosList.filter(r => (r.nomeTest || '').toLowerCase().includes('assedio'));
      const discRel = resultadosList.filter(r => (r.nomeTest || '').toLowerCase().includes('disc'));

      const mediaPercentual = arr => arr.length > 0 ? Math.round(arr.reduce((acc, r) => acc + (r.percentual || 0), 0) / arr.length) : 0;

      const kpis = {
        indiceEstresse: Math.max(0, 100 - mediaPercentual(estresseRel)),
        climaPositivo: mediaPercentual(climaRel),
        satisfacaoChefia: Math.min(90, Math.round((mediaPercentual(climaRel) + 10))),
        riscoBurnout: Math.max(0, 100 - mediaPercentual(burnoutRel)),
        maturidadePRG: Math.round((cobertura + 60) / 2),
        segurancaPsicologica: Math.round((mediaPercentual(climaRel) + 10))
      };

      const indiceGlobal = Math.round((
        kpis.climaPositivo * 0.25 +
        kpis.segurancaPsicologica * 0.25 +
        (100 - kpis.indiceEstresse) * 0.2 +
        (100 - kpis.riscoBurnout) * 0.15 +
        kpis.maturidadePRG * 0.15
      ) / 1);

      const dadosPorTipo = {
        clima: climaRel.length,
        estresse: estresseRel.length,
        burnout: burnoutRel.length,
        qvt: qvtRel.length,
        assedio: assedioRel.length,
        disc: discRel.length
      };

      const aiAnalysis = {
        sintese: 'A organização apresenta indicadores estáveis com atenção moderada a estresse em algumas áreas. Recomenda-se reforço em comunicação e práticas de suporte ao colaborador.',
        dataGeracao: new Date().toISOString()
      };

      const recomendacoes = [
        {
          categoria: 'Gestão de Pessoas',
          prioridade: 'Alta',
          titulo: 'Implementar check-ins semanais de bem-estar',
          descricao: 'Estabeleça rituais de acompanhamento com foco em carga de trabalho e percepção de apoio.',
          acoesPraticas: [
            'Definir agenda quinzenal por equipe',
            'Treinar líderes para escuta ativa',
            'Registrar percepções e acompanhar indicadores'
          ],
          prazo: '30 dias',
          responsavel: 'Gestores de equipe',
          impactoEsperado: 'Redução de sinais de estresse e melhora de clima'
        },
        {
          categoria: 'Comunicação',
          prioridade: 'Média',
          titulo: 'Divulgar políticas de assédio e canais de denúncia',
          descricao: 'Reforce canais formais e garanta acessibilidade e anonimato.',
          acoesPraticas: [
            'Campanha interna trimestral',
            'Atualizar materiais no onboarding',
            'Auditar processos de resposta'
          ]
        }
      ];

      const matrizRiscos = [
    { nome: 'Estresse por prazos', probabilidade: 'C', severidade: 3, categoria: 'Operacional' },
    { nome: 'Assédio interpessoal', probabilidade: 'B', severidade: 4, categoria: 'Cultural' },
    { nome: 'Burnout em squads críticos', probabilidade: 'B', severidade: 3, categoria: 'Operacional' }
  ];

  const distribuicaoRiscos = [
    { categoria: 'Operacional', critico: 1, alto: 2, moderado: 3, baixo: 4 },
    { categoria: 'Cultural', critico: 0, alto: 1, moderado: 2, baixo: 5 }
  ];

  const dimensoesPsicossociais = [
    { dimensao: 'Clima Organizacional', valor: mediaPercentual(climaRel), meta: 80 },
    { dimensao: 'Estresse', valor: Math.max(0, 100 - mediaPercentual(estresseRel)), meta: 70 },
    { dimensao: 'Segurança Psicológica', valor: Math.round((mediaPercentual(climaRel) + 10)), meta: 85 },
  ];

  // Dados para gráficos específicos
  // Distribuição Parliament baseada apenas em colaboradores avaliados
  const avaliadosIdsSet = new Set(resultadosList.map(r => {
    const match = String(r.id).match(/res-colab-(\d+)-/);
    return match ? `colab-${match[1]}` : undefined;
  }).filter(Boolean));
  const colaboradoresAvaliados = avaliadosIdsSet.size;
  const naoAvaliado = Math.max(0, totalColaboradores - colaboradoresAvaliados);

  const baixo = Math.floor(colaboradoresAvaliados * 0.5);
  const moderado = Math.floor(colaboradoresAvaliados * 0.35);
  const alto = Math.max(0, colaboradoresAvaliados - baixo - moderado);
  const dadosParliament = [
    { categoria: 'Baixo Risco', quantidade: baixo, cor: '#10b981' },
    { categoria: 'Risco Moderado', quantidade: moderado, cor: '#f59e0b' },
    { categoria: 'Alto Risco', quantidade: alto, cor: '#ef4444' },
    { categoria: 'Não Avaliado', quantidade: naoAvaliado, cor: '#6b7280' }
  ];

  // Fluxos Sankey baseados apenas em colaboradores avaliados (sem mínimos artificiais)
  const sankeyFlows = [
    Math.ceil(colaboradoresAvaliados * 0.2),
    Math.ceil(colaboradoresAvaliados * 0.15),
    Math.ceil(colaboradoresAvaliados * 0.1),
    Math.ceil(colaboradoresAvaliados * 0.18)
  ];

  const dadosSankey = {
    nodes: [
      { name: 'Ótimo' },
      { name: 'Bom' },
      { name: 'Atenção' },
      { name: 'Crítico' }
    ],
    links: [
      { source: 0, target: 1, value: sankeyFlows[0] },
      { source: 1, target: 2, value: sankeyFlows[1] },
      { source: 2, target: 3, value: sankeyFlows[2] },
      { source: 1, target: 0, value: sankeyFlows[3] }
    ]
  };

  const responseData = {
    empresa: {
      nome: empresa.nome,
      cnpj: empresa.cnpj,
      endereco: empresa.endereco,
      setor: empresa.setor
    },
    prg: {
      indiceGlobal,
      kpis,
      totalColaboradores,
      totalTestes,
      cobertura,
      dadosPorTipo,
      aiAnalysis,
      recomendacoes,
      matrizRiscos,
      distribuicaoRiscos,
      dimensoesPsicossociais,
      dadosParliament,
      dadosSankey,
      ultimaAtualizacao: new Date().toISOString()
    }
  };

  console.log('📤 [DB PRG] Resposta gerada para empresa:', empresaId);
  console.log('📤 [DB PRG] totalColaboradores:', responseData.prg.totalColaboradores, 'totalTestes:', responseData.prg.totalTestes);
  return res.json(responseData);
    }

    const empresaId = currentSession?.empresaId;
    if (!empresaId) {
      return res.status(401).json({ success: false, message: 'Empresa não autenticada' });
    }

    const { eq, desc } = require('drizzle-orm');

    // Buscar dados da empresa
    const empresaResult = await db
      .select()
      .from(schema.empresas)
      .where(eq(schema.empresas.id, empresaId))
      .limit(1);

    if (empresaResult.length === 0) {
      return res.status(404).json({ success: false, message: 'Empresa não encontrada' });
    }

    const empresa = empresaResult[0];

    // Buscar colaboradores da empresa
    const colaboradores = await db
      .select()
      .from(schema.colaboradores)
      .where(eq(schema.colaboradores.empresaId, empresaId));

    // Tratamento de estado vazio - empresa sem colaboradores
    if (colaboradores.length === 0) {
      console.log(`⚠️ [DB PRG] Empresa ${empresaId} não possui colaboradores`);
      return res.json({
        empresa: {
          nome: empresa.nome,
          cnpj: empresa.cnpj,
          endereco: empresa.endereco,
          setor: empresa.setor
        },
        prg: {
          indiceGlobal: 0,
          kpis: {
            indiceEstresse: 0,
            climaPositivo: 0,
            satisfacaoChefia: 0,
            riscoBurnout: 0,
            maturidadePRG: 0,
            segurancaPsicologica: 0
          },
          totalColaboradores: 0,
          totalTestes: 0,
          cobertura: 0,
          dadosPorTipo: {
            clima: 0,
            estresse: 0,
            burnout: 0,
            qvt: 0,
            assedio: 0,
            disc: 0
          },
          aiAnalysis: {
            sintese: 'Não há dados suficientes para análise. Cadastre colaboradores e realize testes para gerar indicadores.',
            dataGeracao: new Date().toISOString()
          },
          recomendacoes: [{
            categoria: 'Cadastro',
            prioridade: 'Alta',
            titulo: 'Cadastrar colaboradores',
            descricao: 'É necessário cadastrar colaboradores para começar a coletar dados psicossociais.',
            acoesPraticas: ['Acessar página de colaboradores', 'Importar ou cadastrar colaboradores', 'Convidar colaboradores para testes'],
            prazo: '7 dias',
            responsavel: 'Administrador',
            impactoEsperado: 'Início da coleta de dados para análise'
          }],
          matrizRiscos: [],
          distribuicaoRiscos: [],
          dimensoesPsicossociais: [],
          dadosParliament: [],
          dadosSankey: { nodes: [], links: [] },
          ultimaAtualizacao: new Date().toISOString()
        }
      });
    }

    // Buscar resultados de testes da empresa
    const resultados = await db
      .select({
        id: schema.resultados.id,
        colaboradorId: schema.resultados.colaboradorId,
        testeId: schema.resultados.testeId,
        dataRealizacao: schema.resultados.dataRealizacao,
        percentual: schema.resultados.percentual,
        categoria: schema.testes.categoria,
        nomeTest: schema.testes.nome
      })
      .from(schema.resultados)
      .innerJoin(schema.testes, eq(schema.resultados.testeId, schema.testes.id))
      .innerJoin(schema.colaboradores, eq(schema.resultados.colaboradorId, schema.colaboradores.id))
      .where(eq(schema.colaboradores.empresaId, empresaId))
      .orderBy(desc(schema.resultados.dataRealizacao));

    // Tratamento de estado vazio - empresa sem resultados de testes
    if (resultados.length === 0) {
      console.log(`⚠️ [DB PRG] Empresa ${empresaId} não possui resultados de testes`);
      return res.json({
        empresa: {
          nome: empresa.nome,
          cnpj: empresa.cnpj,
          endereco: empresa.endereco,
          setor: empresa.setor
        },
        prg: {
          indiceGlobal: 0,
          kpis: {
            indiceEstresse: 0,
            climaPositivo: 0,
            satisfacaoChefia: 0,
            riscoBurnout: 0,
            maturidadePRG: Math.round((0 + 60) / 2), // Baseado apenas na cobertura 0%
            segurancaPsicologica: 0
          },
          totalColaboradores: colaboradores.length,
          totalTestes: 0,
          cobertura: 0,
          dadosPorTipo: {
            clima: 0,
            estresse: 0,
            burnout: 0,
            qvt: 0,
            assedio: 0,
            disc: 0
          },
          aiAnalysis: {
            sintese: 'Os colaboradores foram cadastrados, mas ainda não há testes realizados. Convide os colaboradores para realizar os testes psicossociais.',
            dataGeracao: new Date().toISOString()
          },
          recomendacoes: [{
            categoria: 'Testes',
            prioridade: 'Alta',
            titulo: 'Realizar testes psicossociais',
            descricao: 'Convidar colaboradores para realizar testes e coletar dados sobre o clima organizacional e bem-estar.',
            acoesPraticas: ['Acessar página de testes', 'Enviar convites para colaboradores', 'Acompanhar resultados'],
            prazo: '15 dias',
            responsavel: 'Administrador',
            impactoEsperado: 'Geração de indicadores para análise'
          }],
          matrizRiscos: [],
          distribuicaoRiscos: [],
          dimensoesPsicossociais: [],
          dadosParliament: [
            { categoria: 'Baixo Risco', quantidade: colaboradores.length, cor: '#10b981' },
            { categoria: 'Risco Moderado', quantidade: 0, cor: '#f59e0b' },
            { categoria: 'Alto Risco', quantidade: 0, cor: '#ef4444' }
          ],
          dadosSankey: { nodes: [], links: [] },
          ultimaAtualizacao: new Date().toISOString()
        }
      });
    }

    // KPIs principais
    const totalColaboradores = colaboradores.length;
    const totalTestes = resultados.length;
    const cobertura = totalColaboradores > 0 
      ? Math.round((new Set(resultados.map(r => r.colaboradorId)).size / totalColaboradores) * 100)
      : 0;

    const climaRel = resultados.filter(r => r.categoria && r.categoria.toLowerCase().includes('clima'));
    const estresseRel = resultados.filter(r => r.nomeTest && r.nomeTest.toLowerCase().includes('mgrp'));
    const burnoutRel = resultados.filter(r => r.nomeTest && r.nomeTest.toLowerCase().includes('burnout'));
    const qvtRel = resultados.filter(r => r.nomeTest && r.nomeTest.toLowerCase().includes('qvt'));
    const assedioRel = resultados.filter(r => r.nomeTest && r.nomeTest.toLowerCase().includes('assedio'));
    const discRel = resultados.filter(r => r.nomeTest && r.nomeTest.toLowerCase().includes('disc'));

    const mediaPercentual = arr => arr.length > 0 ? Math.round(arr.reduce((acc, r) => acc + (r.percentual || 0), 0) / arr.length) : 0;

    const kpis = {
      indiceEstresse: Math.max(0, 100 - mediaPercentual(estresseRel)),
      climaPositivo: mediaPercentual(climaRel),
      satisfacaoChefia: Math.min(90, Math.round((mediaPercentual(climaRel) + 10))),
      riscoBurnout: Math.max(0, 100 - mediaPercentual(burnoutRel)),
      maturidadePRG: Math.round((cobertura + 60) / 2),
      segurancaPsicologica: Math.round((mediaPercentual(climaRel) + 10))
    };

    const indiceGlobal = Math.round((
      kpis.climaPositivo * 0.25 +
      kpis.segurancaPsicologica * 0.25 +
      (100 - kpis.indiceEstresse) * 0.2 +
      (100 - kpis.riscoBurnout) * 0.15 +
      kpis.maturidadePRG * 0.15
    ) / 1);

    const dadosPorTipo = {
      clima: climaRel.length,
      estresse: estresseRel.length,
      burnout: burnoutRel.length,
      qvt: qvtRel.length,
      assedio: assedioRel.length,
      disc: discRel.length
    };

    const aiAnalysis = {
      sintese: 'A organização apresenta indicadores estáveis com atenção moderada a estresse em algumas áreas. Recomenda-se reforço em comunicação e práticas de suporte ao colaborador.',
      dataGeracao: new Date().toISOString()
    };

    const recomendacoes = [
      {
        categoria: 'Gestão de Pessoas',
        prioridade: 'Alta',
        titulo: 'Implementar check-ins semanais de bem-estar',
        descricao: 'Estabeleça rituais de acompanhamento com foco em carga de trabalho e percepção de apoio.',
        acoesPraticas: [
          'Definir agenda quinzenal por equipe',
          'Treinar líderes para escuta ativa',
          'Registrar percepções e acompanhar indicadores'
        ],
        prazo: '30 dias',
        responsavel: 'Gestores de equipe',
        impactoEsperado: 'Redução de sinais de estresse e melhora de clima'
      },
      {
        categoria: 'Comunicação',
        prioridade: 'Média',
        titulo: 'Divulgar políticas de assédio e canais de denúncia',
        descricao: 'Reforce canais formais e garanta acessibilidade e anonimato.',
        acoesPraticas: [
          'Campanha interna trimestral',
          'Atualizar materiais no onboarding',
          'Auditar processos de resposta'
        ]
      }
    ];

  const matrizRiscos = [
    { nome: 'Estresse por prazos', probabilidade: 'C', severidade: 3, categoria: 'Operacional' },
    { nome: 'Assédio interpessoal', probabilidade: 'B', severidade: 4, categoria: 'Cultural' },
    { nome: 'Burnout em squads críticos', probabilidade: 'B', severidade: 3, categoria: 'Operacional' }
  ];

  const distribuicaoRiscos = [
    { categoria: 'Operacional', critico: 1, alto: 2, moderado: 3, baixo: 4 },
    { categoria: 'Cultural', critico: 0, alto: 1, moderado: 2, baixo: 5 }
  ];

  const dimensoesPsicossociais = [
    { dimensao: 'Clima Organizacional', valor: mediaPercentual(climaRel), meta: 80 },
    { dimensao: 'Estresse', valor: Math.max(0, 100 - mediaPercentual(estresseRel)), meta: 70 },
    { dimensao: 'Segurança Psicológica', valor: Math.round((mediaPercentual(climaRel) + 10)), meta: 85 },
  ];

  // Dados para gráficos específicos
  // Distribuição Parliament somando exatamente ao total de colaboradores
  const baixo = Math.floor(totalColaboradores * 0.5);
  const moderado = Math.floor(totalColaboradores * 0.35);
  const alto = Math.max(0, totalColaboradores - baixo - moderado);
  const dadosParliament = [
    { categoria: 'Baixo Risco', quantidade: baixo, cor: '#10b981' },
    { categoria: 'Risco Moderado', quantidade: moderado, cor: '#f59e0b' },
    { categoria: 'Alto Risco', quantidade: alto, cor: '#ef4444' }
  ];

  // Garante valores mínimos para evitar somatório 0 (causa NaN no layout)
  const sankeyFlows = [
    Math.max(1, Math.ceil(totalColaboradores * 0.2)),
    Math.max(1, Math.ceil(totalColaboradores * 0.15)),
    Math.max(1, Math.ceil(totalColaboradores * 0.1)),
    Math.max(1, Math.ceil(totalColaboradores * 0.18))
  ];

  const dadosSankey = {
    nodes: [
      { name: 'Ótimo' },
      { name: 'Bom' },
      { name: 'Atenção' },
      { name: 'Crítico' }
    ],
    links: [
      { source: 0, target: 1, value: sankeyFlows[0] },
      { source: 1, target: 2, value: sankeyFlows[1] },
      { source: 2, target: 3, value: sankeyFlows[2] },
      { source: 1, target: 0, value: sankeyFlows[3] }
    ]
  };

  const responseData = {
    empresa: {
      nome: empresa.nome,
      cnpj: empresa.cnpj,
      endereco: empresa.endereco,
      setor: empresa.setor
    },
    prg: {
      indiceGlobal,
      kpis,
      totalColaboradores,
      totalTestes,
      cobertura,
      dadosPorTipo,
      aiAnalysis,
      recomendacoes,
      matrizRiscos,
      distribuicaoRiscos,
      dimensoesPsicossociais,
      dadosParliament,
      dadosSankey,
      ultimaAtualizacao: new Date().toISOString()
    }
  };

  console.log('📤 [DB PRG] Resposta gerada para empresa:', empresaId);
  console.log('📤 [DB PRG] totalColaboradores:', responseData.prg.totalColaboradores, 'totalTestes:', responseData.prg.totalTestes);
  res.json(responseData);
    } catch (error) {
      console.error('❌ Erro ao buscar dados do PGR:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro ao buscar dados do PGR',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
});

// ====== Mocks de Empresas ======
let empresas = [
  {
    id: 'emp-001',
    nome_empresa: 'Alpha Tech Ltda',
    email_contato: 'contato@alphatech.com',
    telefone: '+55 11 4000-1001',
    ativo: true,
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    total_colaboradores: 42
  },
  {
    id: 'emp-002',
    nome_empresa: 'Beta Consultoria',
    email_contato: 'admin@betaconsult.com',
    telefone: '+55 21 3000-2002',
    ativo: true,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    total_colaboradores: 27
  },
  {
    id: 'emp-003',
    nome_empresa: 'Gamma Indústria S/A',
    email_contato: 'suporte@gamma-industria.com',
    telefone: '+55 31 2000-3003',
    ativo: false,
    created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
    total_colaboradores: 85
  },
  {
    id: 'emp-004',
    nome_empresa: 'Delta Serviços',
    email_contato: 'contato@deltaservicos.com.br',
    telefone: '+55 41 1000-4004',
    ativo: true,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    total_colaboradores: 12
  },
  {
    id: 'emp-005',
    nome_empresa: 'Epsilon Digital',
    email_contato: 'hello@epsilon.digital',
    telefone: '+55 51 5000-5005',
    ativo: false,
    created_at: new Date(Date.now() - 200 * 86400000).toISOString(),
    total_colaboradores: 5
  }
];

app.get('/api/empresas', (req, res) => {
  res.json({ data: empresas });
});

app.delete('/api/empresas/:id', (req, res) => {
  const { id } = req.params;
  const idx = empresas.findIndex(e => e.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Empresa não encontrada' });
  }
  const [removida] = empresas.splice(idx, 1);
  console.log(`🗑️ Empresa removida: ${id}`);
  res.json({ success: true, message: `Empresa ${id} excluída permanentemente`, removed: removida });
});

app.get('/api/empresas/me', (req, res) => {
  res.json({ empresa: { id: 'emp-1', nome: 'Empresa Mock', emailContato: 'contato@empresa.mock' } });
});

app.get('/api/empresas/colaboradores', (req, res) => {
  const empresaId = currentSession?.empresaId;
  if (!empresaId) {
    return res.status(401).json({ success: false, message: 'Empresa não autenticada' });
  }
  const lista = colaboradoresPorEmpresa[empresaId] || [];
  res.json({ data: lista, total: lista.length });
});

app.get('/api/empresas/estatisticas', (req, res) => {
  res.json({ estatisticas: { totalColaboradores: 2, testesRealizados: resultados.length } });
});

// ====== Armazenamento de Colaboradores (inicialmente vazio, populado por convites aceitos) ======
// (declarado no topo do arquivo para evitar referências antes da definição)

// Lista de colaboradores da empresa logada
app.get('/api/colaboradores', async (req, res) => {
  try {
    // Se não houver conexão com banco, usar mock como fallback
    if (!db) {
      const empresaId = currentSession?.empresaId;
      if (!empresaId) {
        return res.status(401).json({ success: false, message: 'Empresa não autenticada' });
      }
      const lista = colaboradoresPorEmpresa[empresaId] || [];
      console.log(`👥 [Mock] Listando colaboradores da empresa: ${empresaId} (total: ${lista.length})`);
      return res.json({ data: lista });
    }

    // Buscar empresa autenticada
    const empresaId = currentSession?.empresaId;
    if (!empresaId) {
      return res.status(401).json({ success: false, message: 'Empresa não autenticada' });
    }

    // Buscar colaboradores reais do banco
    const { eq } = require('drizzle-orm');
    const colaboradoresReais = await db
      .select()
      .from(schema.colaboradores)
      .where(eq(schema.colaboradores.empresaId, empresaId))
      .orderBy(schema.colaboradores.createdAt);

    console.log(`👥 [Real] Listando colaboradores da empresa: ${empresaId} (total: ${colaboradoresReais.length})`);
    
    // Tratamento de estado vazio
    if (colaboradoresReais.length === 0) {
      console.log(`⚠️ [Real] Nenhum colaborador encontrado para empresa: ${empresaId}`);
      return res.json({ 
        data: [], 
        message: 'Nenhum colaborador encontrado',
        total: 0 
      });
    }
    
    // Transformar para formato esperado pelo frontend
    const colaboradoresFormatados = colaboradoresReais.map(colab => ({
      id: colab.id,
      nome: colab.nome,
      email: colab.email,
      cargo: colab.cargo || '—',
      departamento: colab.departamento || '—',
      avatar: colab.avatar || '',
      ativo: colab.ativo,
      created_at: colab.createdAt,
      updated_at: colab.updatedAt,
      total_testes: 0, // Será calculado posteriormente
      ultimo_teste: null, // Será calculado posteriormente
      situacaoPsicossocial: {
        status: 'nao_avaliado',
        descricao: 'Sem dados suficientes para análise.',
        cor: '#9E9E9E',
        totalTestes: 0,
        ultimoTeste: null,
        indicadores: []
      }
    }));

    res.json({ data: colaboradoresFormatados, total: colaboradoresFormatados.length });
  } catch (error) {
    console.error('❌ Erro ao buscar colaboradores:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar colaboradores' });
  }
});

// Detalhes de um colaborador específico
app.get('/api/colaboradores/:id', async (req, res) => {
  try {
    // Se não houver conexão com banco, usar mock como fallback
    if (!db) {
      const empresaId = currentSession?.empresaId;
      if (!empresaId) {
        return res.status(401).json({ success: false, message: 'Empresa não autenticada' });
      }
      const lista = colaboradoresPorEmpresa[empresaId] || [];
      const { id } = req.params;
      const colab = lista.find(c => c.id === id);
      if (!colab) {
        return res.status(404).json({ success: false, message: 'Colaborador não encontrado' });
      }
      return res.json({ data: colab });
    }

    const empresaId = currentSession?.empresaId;
    if (!empresaId) {
      return res.status(401).json({ success: false, message: 'Empresa não autenticada' });
    }

    const { eq, and } = require('drizzle-orm');
    const { id } = req.params;
    
    // Buscar colaborador específico
    const colaboradorResult = await db
      .select()
      .from(schema.colaboradores)
      .where(and(
        eq(schema.colaboradores.id, id),
        eq(schema.colaboradores.empresaId, empresaId)
      ))
      .limit(1);

    if (colaboradorResult.length === 0) {
      return res.status(404).json({ success: false, message: 'Colaborador não encontrado' });
    }

    const colab = colaboradorResult[0];
    
    // Formatar para o formato esperado
    const colaboradorFormatado = {
      id: colab.id,
      nome: colab.nome,
      email: colab.email,
      cargo: colab.cargo || '—',
      departamento: colab.departamento || '—',
      avatar: colab.avatar || '',
      ativo: colab.ativo,
      created_at: colab.createdAt,
      updated_at: colab.updatedAt,
      total_testes: 0,
      ultimo_teste: null,
      situacaoPsicossocial: {
        status: 'nao_avaliado',
        descricao: 'Sem dados suficientes para análise.',
        cor: '#9E9E9E',
        totalTestes: 0,
        ultimoTeste: null,
        indicadores: []
      }
    };

    res.json({ data: colaboradorFormatado });
  } catch (error) {
    console.error('❌ Erro ao buscar colaborador:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar colaborador' });
  }
});

// ====== Mocks de Admin ======
app.get('/api/admin/dashboard', (req, res) => {
  const empresasAtivas = 12;
  const novasEsteMes = 3;
  const visitantesLanding = 1200;
  const testesDemonstracao = 300;
  const checkoutsIniciados = 90;
  const comprasFinalizadas = 45;

  const planosDistribuicao = [
    { plano: 'Essencial', quantidade: 6, receita: 6000 },
    { plano: 'Profissional', quantidade: 4, receita: 8000 },
    { plano: 'Enterprise', quantidade: 2, receita: 20000 },
  ];

  const receitaMensal = [
    { mes: 'Mai', receita: 12000, empresas: 8 },
    { mes: 'Jun', receita: 15000, empresas: 9 },
    { mes: 'Jul', receita: 18000, empresas: 10 },
    { mes: 'Ago', receita: 21000, empresas: 11 },
    { mes: 'Set', receita: 24000, empresas: 12 },
    { mes: 'Out', receita: 27000, empresas: 12 },
  ];

  const crescimentoEmpresa = [
    { mes: 'Mai', novas: 2, canceladas: 1 },
    { mes: 'Jun', novas: 3, canceladas: 1 },
    { mes: 'Jul', novas: 4, canceladas: 2 },
    { mes: 'Ago', novas: 3, canceladas: 1 },
    { mes: 'Set', novas: 2, canceladas: 1 },
    { mes: 'Out', novas: 3, canceladas: 1 },
  ];

  const financeiro = {
    mrr: receitaMensal[receitaMensal.length - 1].receita,
    arr: receitaMensal.reduce((acc, cur) => acc + cur.receita, 0),
    receitaMensal: receitaMensal[receitaMensal.length - 1].receita,
    receitaTotal: receitaMensal.reduce((acc, cur) => acc + cur.receita, 0),
    ticketMedio: Math.round((planosDistribuicao.reduce((acc, cur) => acc + cur.receita, 0)) / empresasAtivas),
    crescimentoMRR: 12.5,
    projecaoProximoMes: Math.round(receitaMensal[receitaMensal.length - 1].receita * 1.08),
    projecaoTrimestre: Math.round(receitaMensal.slice(-3).reduce((acc, cur) => acc + cur.receita, 0) * 1.1),
  };

  res.json({
    financeiro,
    empresas: {
      total: 20,
      ativas: empresasAtivas,
      inativas: 8,
      novasEsteMes,
      crescimentoMensal: 5.2,
      churnRate: 1.3,
    },
    colaboradores: {
      total: 240,
      ativos: 220,
      mediaPorEmpresa: 18.5,
      crescimentoMensal: 3.1,
    },
    conversao: {
      visitantesLanding,
      testesDemonstracao,
      checkoutsIniciados,
      comprasFinalizadas,
      taxaLandingParaDemo: Math.round((testesDemonstracao / visitantesLanding) * 100),
      taxaDemoParaCheckout: Math.round((checkoutsIniciados / testesDemonstracao) * 100),
      taxaCheckoutParaCompra: Math.round((comprasFinalizadas / checkoutsIniciados) * 100),
      taxaConversaoGeral: Math.round((comprasFinalizadas / visitantesLanding) * 100),
    },
    planos: {
      distribuicao: planosDistribuicao,
      essencial: planosDistribuicao[0].quantidade,
      profissional: planosDistribuicao[1].quantidade,
      enterprise: planosDistribuicao[2].quantidade,
    },
    tendencias: {
      receitaMensal,
      crescimentoEmpresa,
    },
    kpis: {
      ltv: 4200,
      cac: 900,
      ltvCacRatio: 4.67,
      paybackPeriod: 3.2,
    },
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor temporário rodando em http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 Health check (API): http://localhost:${PORT}/api/health`);
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log(`✅ CORS configurado para: http://localhost:5000`);
});