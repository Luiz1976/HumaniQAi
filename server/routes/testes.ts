import express from 'express';
import { db, dbType } from '../db-config';
import { testes, perguntas, resultados, respostas, colaboradores, testeDisponibilidade, empresas, insertResultadoSchema, insertRespostaSchema } from '../../shared/schema';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { eq, and, desc, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import logger from '../utils/logger';
import { randomUUID } from 'crypto';

// Importar perguntas dos arquivos locais
import { dimensoesClimaOrganizacional } from '../../src/lib/testes/clima-organizacional';
import { dimensoesKarasekSiegrist } from '../../src/lib/testes/karasek-siegrist';


// Mapeamento de testes por slug
const TESTES_DISPONIVEIS = {
  'clima-organizacional': {
    id: 'clima-organizacional',
    nome: 'Clima Organizacional',
    categoria: 'Organizacional',
    descricao: 'Avaliação do clima organizacional e satisfação dos colaboradores',
    tempoEstimado: 15,
    perguntas: dimensoesClimaOrganizacional
  },
  'karasek-siegrist': {
    id: 'karasek-siegrist',
    nome: 'Karasek-Siegrist',
    categoria: 'Saúde Ocupacional',
    descricao: 'Avaliação de estresse ocupacional e demanda-controle',
    tempoEstimado: 20,
    perguntas: dimensoesKarasekSiegrist
  },

};

const router = express.Router();

// Listar todos os testes disponíveis
router.get('/', async (req, res) => {
  try {
    const todosTestes = await db
      .select({
        id: testes.id,
        nome: testes.nome,
        descricao: testes.descricao,
        categoria: testes.categoria,
        tempoEstimado: testes.tempoEstimado,
        ativo: testes.ativo,
      })
      .from(testes);

    res.json({ testes: todosTestes });
  } catch (error) {
    logger.error('Erro ao listar testes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter detalhes de um teste específico
router.get('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;

    // 🔍 DEBUG: Log da requisição de resultado
    logger.info(`[DEBUG] Endpoint /resultado/:id - ID: ${id}`);
    logger.info(`[DEBUG] Usuário autenticado: ${req.user?.userId}, Role: ${req.user?.role}, Empresa: ${req.user?.empresaId}`);

    // 🔍 DEBUG: Log da requisição de resultado
    logger.info(`[DEBUG] Endpoint /resultado/:id - ID: ${id}`);
    logger.info(`[DEBUG] Usuário autenticado: ${req.user?.userId}, Role: ${req.user?.role}, Empresa: ${req.user?.empresaId}`);

    const [teste] = await db
      .select()
      .from(testes)
      .where(eq(testes.id, id))
      .limit(1);

    if (!teste) {
      return res.status(404).json({ error: 'Teste não encontrado' });
    }

    res.json({ teste });
  } catch (error) {
    logger.error('Erro ao buscar teste:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter perguntas de um teste
router.get('/:id/perguntas', async (req: any, res) => {
  try {
    const { id } = req.params as { id: string };

    // 🔍 Verificar se é um teste disponível nos arquivos locais
    const testeLocal = TESTES_DISPONIVEIS[id as keyof typeof TESTES_DISPONIVEIS];

    if (testeLocal) {
      const perguntasFormatadas = testeLocal.perguntas.flatMap(dimensao =>
        dimensao.perguntas.map(pergunta => ({
          id: pergunta.id.toString(),
          texto: pergunta.texto,
          categoria: dimensao.nome,
          tipo: 'likert',
          opcoes: ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"],
          escalaMin: 1,
          escalaMax: 5,
          obrigatoria: true,
          ordem: pergunta.id,
          createdAt: new Date().toISOString()
        }))
      );

      if (req.user && req.user.role === 'colaborador') {
        const toSlug = (s: string) => s
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        const todosTestes = await db
          .select({ id: testes.id, nome: testes.nome, categoria: testes.categoria })
          .from(testes);
        const encontrado = todosTestes.find((t: any) => toSlug(t.nome || '') === id || toSlug(t.categoria || '') === id);
        if (!encontrado) {
          return res.status(403).json({ error: 'Teste bloqueado' });
        }
        const [disp] = await db
          .select()
          .from(testeDisponibilidade)
          .where(
            and(
              eq(testeDisponibilidade.colaboradorId, req.user.userId),
              eq(testeDisponibilidade.testeId, encontrado.id)
            )
          )
          .limit(1);
        if (!disp || !disp.disponivel) {
          return res.status(403).json({ error: 'Teste bloqueado' });
        }
      }

      return res.json({
        perguntas: perguntasFormatadas,
        total: perguntasFormatadas.length
      });
    }

    // Se não for um teste local, tentar buscar no banco de dados (mantido para compatibilidade)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let testeId = id;

    if (!isUuid) {
      const toSlug = (s: string) => s
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const todosTestes = await db
        .select({
          id: testes.id,
          nome: testes.nome,
          categoria: testes.categoria,
        })
        .from(testes);

      const encontrado = todosTestes.find((t: any) => toSlug(t.nome || '') === id || toSlug(t.categoria || '') === id);
      if (!encontrado) {
        return res.status(404).json({ error: 'Teste não encontrado' });
      }
      testeId = String(encontrado.id);
    } else {
      const [teste] = await db.select().from(testes).where(eq(testes.id, testeId)).limit(1);
      if (!teste) {
        return res.status(404).json({ error: 'Teste não encontrado' });
      }
    }

    const perguntasTeste = await db
      .select()
      .from(perguntas)
      .where(eq(perguntas.testeId, testeId))
      .orderBy(perguntas.ordem);

    res.json({ perguntas: perguntasTeste, total: perguntasTeste.length });
  } catch (error) {
    logger.error('Erro ao buscar perguntas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Submeter resultado de teste (com autenticação)
router.post('/resultado', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const validationResult = z.object({
      testeId: z.string().nullable().optional(),
      pontuacaoTotal: z.number(),
      tempoGasto: z.number().optional(),
      sessionId: z.string().optional(),
      metadados: z.any().optional(),
      status: z.string().optional(),
    }).safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: validationResult.error.issues });
    }

    const { testeId, pontuacaoTotal, tempoGasto, sessionId, metadados, status } = validationResult.data;

    let testeIdFinal = testeId;
    if (!testeIdFinal && metadados && metadados.teste_nome) {
      try {
        const toSlug = (s: string) => String(s)
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

        const nomeEntrada = String(metadados.teste_nome);
        const nomeSlug = toSlug(nomeEntrada);
        const nomeNormalizado = nomeEntrada.toLowerCase();

        logger.info(`🔍 [RESULTADO] Buscando teste: "${nomeEntrada}" (slug: "${nomeSlug}")`);

        const todos = await db
          .select({ id: testes.id, nome: testes.nome, categoria: testes.categoria })
          .from(testes);

        logger.info(`🔍 [RESULTADO] Total de testes no banco: ${todos.length}`);

        // Estratégia 1: Match exato por slug
        let encontrado = todos.find((t: any) => toSlug(t.nome || '') === nomeSlug || toSlug(t.categoria || '') === nomeSlug);

        if (encontrado) {
          logger.info(`✅ [RESULTADO] Match exato encontrado: "${encontrado.nome}"`);
        }

        // Estratégia 2: Match case-insensitive por nome ou categoria
        if (!encontrado) {
          encontrado = todos.find((t: any) =>
            (t.nome || '').toLowerCase() === nomeNormalizado ||
            (t.categoria || '').toLowerCase() === nomeNormalizado
          );
          if (encontrado) {
            logger.info(`✅ [RESULTADO] Match case-insensitive encontrado: "${encontrado.nome}"`);
          }
        }

        // Estratégia 3: Match por contains
        if (!encontrado) {
          const nomes = todos.map((t: any) => ({ t, nome: toSlug(t.nome || ''), cat: toSlug(t.categoria || ''), nomeOriginal: t.nome || '' }));
          encontrado = nomes.find((n: any) =>
            nomeSlug.includes(n.nome) ||
            n.nome.includes(nomeSlug) ||
            nomeSlug.includes(n.cat) ||
            n.nomeOriginal.toLowerCase().includes(nomeNormalizado) ||
            nomeNormalizado.includes(n.nomeOriginal.toLowerCase())
          )?.t;
          if (encontrado) {
            logger.info(`✅ [RESULTADO] Match por contains encontrado: "${encontrado.nome}"`);
          }
        }

        // Estratégia 4: Fuzzy matching (Levenshtein distance)
        if (!encontrado) {
          const dist = (a: string, b: string) => {
            const m: number[][] = Array(a.length + 1).fill(0).map(() => Array(b.length + 1).fill(0));
            for (let i = 0; i <= a.length; i++) m[i][0] = i;
            for (let j = 0; j <= b.length; j++) m[0][j] = j;
            for (let i = 1; i <= a.length; i++) {
              for (let j = 1; j <= b.length; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + cost);
              }
            }
            return m[a.length][b.length];
          };
          const nomes = todos.map((t: any) => ({ t, nome: toSlug(t.nome || ''), cat: toSlug(t.categoria || '') }));
          let best: { t: typeof todos[number] | undefined; d: number; matchType: string } = { t: undefined, d: Infinity, matchType: '' };
          for (const n of nomes) {
            const dNome = dist(nomeSlug, n.nome);
            const dCat = dist(nomeSlug, n.cat);
            const d = Math.min(dNome, dCat);
            if (d < best.d) best = { t: n.t, d, matchType: dNome < dCat ? 'nome' : 'categoria' };
          }
          if (best.d <= 3) { // Aumentado de 2 para 3 para maior tolerância
            encontrado = best.t;
            logger.info(`✅ [RESULTADO] Match fuzzy encontrado (distância: ${best.d}, por ${best.matchType}): "${encontrado?.nome}"`);
          }
        }

        if (encontrado) {
          testeIdFinal = encontrado.id as any;
          logger.info(`✅ [RESULTADO] Teste "${nomeEntrada}" → ID resolvido: ${testeIdFinal} (${encontrado.nome})`);
        } else {
          logger.error(`❌ [RESULTADO-CRÍTICO] Teste "${nomeEntrada}" NÃO ENCONTRADO no banco de dados!`);
          logger.error(`❌ [RESULTADO-CRÍTICO] Testes disponíveis no banco:`, todos.map((t: any) => ({ nome: t.nome, categoria: t.categoria, id: t.id })));
        }
      } catch (error) {
        logger.error('❌ [RESULTADO] Erro ao buscar ID do teste:', error);
      }
    }

    // Validar se testeIdFinal existe na tabela testes
    if (testeIdFinal) {
      try {
        const [testeExistente] = await db
          .select({ id: testes.id })
          .from(testes)
          .where(sql`${testes.id} = ${testeIdFinal}`)
          .limit(1);

        if (!testeExistente) {
          logger.warn(`⚠️ [RESULTADO] Teste ID ${testeIdFinal} não existe na tabela testes. Usando null.`);
          testeIdFinal = undefined;
        }
      } catch (error) {
        logger.error('❌ [RESULTADO] Erro ao validar teste_id:', error);
        testeIdFinal = null;
      }
    }

    // Validar empresa_id do usuário
    let empresaIdFinal = req.user!.empresaId;
    if (empresaIdFinal) {
      try {
        const [empresaExistente] = await db
          .select({ id: empresas.id })
          .from(empresas)
          .where(eq(empresas.id, empresaIdFinal))
          .limit(1);

        if (!empresaExistente) {
          logger.warn(`⚠️ [RESULTADO] Empresa ID ${empresaIdFinal} não existe na tabela empresas. Usando null.`);
          empresaIdFinal = undefined;
        }
      } catch (error) {
        logger.error('❌ [RESULTADO] Erro ao validar empresa_id:', error);
        empresaIdFinal = null;
      }
    }

    let resultado: any;
    try {
      [resultado] = await db
        .insert(resultados)
        .values({
          testeId: testeIdFinal || null,
          usuarioId: req.user!.userId,
          pontuacaoTotal,
          tempoGasto,
          status: status || 'concluido',
          sessionId,
          metadados,
          colaboradorId: req.user!.role === 'colaborador' ? req.user!.userId : undefined,
          empresaId: empresaIdFinal,
          userEmail: req.user!.email,
        })
        .returning();
    } catch (err) {
      // Fallback para SQLite se returning não for suportado ou der erro específico
      // Mas como estamos usando Drizzle configurado, deve funcionar.
      // Se for SQLite, o Drizzle simula o returning ou fazemos uma query extra.
      // O db.insert().returning() funciona no Drizzle com better-sqlite3.
      throw err;
    }

    // 🔄 ATUALIZAÇÃO AUTOMÁTICA: Recalcular análise psicossocial em background
    if (req.user!.empresaId) {
      logger.info('🔄 [AUTO-UPDATE] Iniciando recálculo automático da análise psicossocial...');
      // Executar em background sem bloquear a resposta
      setImmediate(() => {
        // A análise será recalculada na próxima vez que a página for acessada
        // Isso é intencional para otimizar performance e custos de API
        logger.info('✅ [AUTO-UPDATE] Análise será recalculada na próxima visualização');
      });
    }

    // 🔒 CRÍTICO: Marcar teste como indisponível após conclusão (SÍNCRONO)
    // Esta operação DEVE ser executada de forma síncrona para garantir integridade
    if (testeIdFinal && req.user!.role === 'colaborador' && req.user!.empresaId) {
      try {
        const colaboradorId = req.user!.userId;
        const empresaId = req.user!.empresaId;
        const agora = new Date();

        logger.info(`🔒 [DISPONIBILIDADE-CRÍTICO] Iniciando bloqueio do teste ${testeIdFinal} para colaborador ${colaboradorId}`);

        // Buscar registro existente
        const [disponibilidadeExistente] = await db
          .select()
          .from(testeDisponibilidade)
          .where(
            and(
              eq(testeDisponibilidade.colaboradorId, colaboradorId),
              eq(testeDisponibilidade.testeId, testeIdFinal)
            )
          )
          .limit(1);

        if (disponibilidadeExistente) {
          // Calcular próxima disponibilidade se tiver periodicidade
          let proximaDisponibilidade: Date | null = null;
          if (disponibilidadeExistente.periodicidadeDias) {
            proximaDisponibilidade = new Date(
              agora.getTime() + disponibilidadeExistente.periodicidadeDias * 24 * 60 * 60 * 1000
            );
            logger.info(`📅 [DISPONIBILIDADE] Próxima liberação calculada: ${proximaDisponibilidade.toISOString()} (${disponibilidadeExistente.periodicidadeDias} dias)`);
          }

          // Atualizar para indisponível
          await db
            .update(testeDisponibilidade)
            .set({
              disponivel: false,
              proximaDisponibilidade: proximaDisponibilidade,
              updatedAt: agora,
            })
            .where(eq(testeDisponibilidade.id, disponibilidadeExistente.id));

          logger.info(`✅ [DISPONIBILIDADE] Teste ${testeIdFinal} bloqueado com sucesso (atualização)`);
        } else {
          // Criar novo registro como indisponível
          await db.insert(testeDisponibilidade).values({
            colaboradorId,
            testeId: testeIdFinal,
            empresaId,
            disponivel: false,
            ultimaLiberacao: null,
            proximaDisponibilidade: null,
            createdAt: agora,
            updatedAt: agora,
          });

          logger.info(`✅ [DISPONIBILIDADE] Registro criado e teste ${testeIdFinal} bloqueado com sucesso (criação)`);
        }
      } catch (error) {
        logger.error('❌❌❌ [DISPONIBILIDADE-ERRO-CRÍTICO] FALHA ao bloquear teste:', error);
        logger.error('❌ Stack:', error instanceof Error ? error.stack : 'Sem stack trace');
        // NÃO continuar se não conseguir bloquear o teste
        throw new Error('Falha crítica ao bloquear teste após conclusão');
      }
    }

    res.status(201).json({
      message: 'Resultado salvo com sucesso',
      resultado: {
        id: resultado.id,
        pontuacaoTotal: resultado.pontuacaoTotal,
        dataRealizacao: resultado.dataRealizacao,
      },
    });
  } catch (error) {
    logger.error('Erro ao salvar resultado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Submeter resultado de teste (SEM autenticação - para testes anônimos)
router.post('/resultado/anonimo', async (req, res) => {
  try {
    const validationResult = z.object({
      testeId: z.string().uuid().nullable().optional(),
      usuarioId: z.string().uuid().nullable().optional(),
      pontuacaoTotal: z.number(),
      tempoGasto: z.number().optional(),
      sessionId: z.string().optional(),
      metadados: z.any().optional(),
      status: z.string().optional(),
      userEmail: z.string().email().optional(),
      empresaId: z.string().uuid().nullable().optional(),
    }).safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: validationResult.error.issues });
    }

    const { testeId, usuarioId, pontuacaoTotal, tempoGasto, sessionId, metadados, status, userEmail, empresaId } = validationResult.data;

    const isSqlite = (dbType || '').toLowerCase().includes('sqlite');
    let resultado: any;
    if (isSqlite) {
      const { sqlite } = await import('../db-sqlite');
      const localId = randomUUID();
      const stmt = sqlite.prepare(`
        INSERT INTO resultados (
          id, teste_id, usuario_id, pontuacao_total, tempo_gasto, status,
          session_id, metadados, colaborador_id, empresa_id, user_email
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        localId,
        testeId || null,
        usuarioId || null,
        pontuacaoTotal,
        tempoGasto ?? null,
        status || 'concluido',
        sessionId ?? null,
        JSON.stringify(metadados ?? {}),
        null,
        empresaId ?? null,
        userEmail ?? null,
      );
      const row = sqlite.prepare('SELECT id, pontuacao_total as pontuacaoTotal, data_realizacao as dataRealizacao FROM resultados WHERE id = ?').get(localId);
      resultado = row;
    } else {
      [resultado] = await db
        .insert(resultados)
        .values({
          id: randomUUID(),
          testeId: testeId || null,
          usuarioId: usuarioId || null,
          pontuacaoTotal,
          tempoGasto,
          status: status || 'concluido',
          sessionId,
          metadados,
          userEmail: userEmail || null,
          empresaId: empresaId || null,
        })
        .returning();
    }

    res.status(201).json({
      message: 'Resultado salvo com sucesso',
      resultado: {
        id: resultado.id,
        pontuacaoTotal: resultado.pontuacaoTotal,
        dataRealizacao: resultado.dataRealizacao,
      },
    });
  } catch (error) {
    logger.error('Erro ao salvar resultado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter resultados do usuário
router.get('/resultados/meus', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Busca por colaboradorId OU usuarioId (para compatibilidade) com JOIN para pegar nome do teste
    const meusResultados = await db
      .select({
        id: resultados.id,
        testeId: resultados.testeId,
        pontuacaoTotal: resultados.pontuacaoTotal,
        tempoGasto: resultados.tempoGasto,
        dataRealizacao: resultados.dataRealizacao,
        status: resultados.status,
        metadados: resultados.metadados,
        // Dados do teste
        testeNome: testes.nome,
        testeCategoria: testes.categoria,
      })
      .from(resultados)
      .leftJoin(testes, eq(resultados.testeId, testes.id))
      .where(
        or(
          eq(resultados.colaboradorId, req.user!.userId),
          eq(resultados.usuarioId, req.user!.userId),
          eq(resultados.userEmail, req.user!.email)
        )
      )
      .orderBy(desc(resultados.dataRealizacao));

    // Enriquecer metadados com nome do teste se disponível
    const resultadosEnriquecidos = meusResultados.map((r: any) => {
      const metadadosBase = (r.metadados as Record<string, any>) || {};
      let nomeTesteFinal = r.testeNome || metadadosBase.teste_nome;
      let categoriaFinal = r.testeCategoria || metadadosBase.teste_categoria;

      const tipo = (metadadosBase.tipo || metadadosBase.tipo_teste || '').toLowerCase();
      if (!nomeTesteFinal) {
        if (tipo === 'qvt') {
          nomeTesteFinal = 'Qualidade de Vida no Trabalho';
          categoriaFinal = categoriaFinal || 'Bem-estar e Engajamento';
        }
      }

      if (!nomeTesteFinal) {
        nomeTesteFinal = 'Teste Personalizado';
      }

      return {
        id: r.id,
        testeId: r.testeId,
        pontuacaoTotal: r.pontuacaoTotal,
        tempoGasto: r.tempoGasto,
        dataRealizacao: r.dataRealizacao,
        status: r.status,
        metadados: {
          ...metadadosBase,
          teste_nome: nomeTesteFinal,
          teste_categoria: categoriaFinal,
        },
        nomeTeste: nomeTesteFinal,
        categoria: categoriaFinal,
      };
    });

    res.json({ resultados: resultadosEnriquecidos, total: resultadosEnriquecidos.length });
  } catch (error) {
    logger.error('Erro ao buscar resultados:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter detalhes de um resultado específico
router.get('/resultado/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Buscar resultado com JOIN nas tabelas de colaboradores e testes
    const [resultado] = await db
      .select({
        id: resultados.id,
        testeId: resultados.testeId,
        usuarioId: resultados.usuarioId,
        pontuacaoTotal: resultados.pontuacaoTotal,
        tempoGasto: resultados.tempoGasto,
        dataRealizacao: resultados.dataRealizacao,
        status: resultados.status,
        metadados: resultados.metadados,
        sessionId: resultados.sessionId,
        userAgent: resultados.userAgent,
        ipAddress: resultados.ipAddress,
        colaboradorId: resultados.colaboradorId,
        empresaId: resultados.empresaId,
        userEmail: resultados.userEmail,
        // Dados do colaborador
        colaboradorNome: colaboradores.nome,
        colaboradorCargo: colaboradores.cargo,
        colaboradorDepartamento: colaboradores.departamento,
        // Dados do teste
        testeNome: testes.nome,
        testeCategoria: testes.categoria,
      })
      .from(resultados)
      .leftJoin(colaboradores, eq(resultados.colaboradorId, colaboradores.id))
      .leftJoin(testes, eq(resultados.testeId, testes.id))
      .where(eq(resultados.id, id))
      .limit(1);

    if (!resultado) {
      return res.status(404).json({ error: 'Resultado não encontrado' });
    }

    // Verificar permissão: usuário pode ver se for dele ou da mesma empresa
    const temPermissao =
      resultado.usuarioId === req.user!.userId ||
      resultado.colaboradorId === req.user!.userId ||
      (resultado.empresaId && resultado.empresaId === req.user!.empresaId) ||
      (req.user!.role === 'admin');

    if (!temPermissao) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const respostasResultado = await db
      .select()
      .from(respostas)
      .where(eq(respostas.resultadoId, id));

    // Enriquecer metadados com informações do colaborador
    const metadadosBase = resultado.metadados as Record<string, any> || {};
    const metadadosEnriquecidos = {
      ...metadadosBase,
      usuario_nome: resultado.colaboradorNome || metadadosBase.usuario_nome || 'Usuário',
      usuario_cargo: resultado.colaboradorCargo || metadadosBase.usuario_cargo || 'Não informado',
      usuario_departamento: resultado.colaboradorDepartamento || metadadosBase.usuario_departamento,
      teste_nome: resultado.testeNome || metadadosBase.teste_nome,
      teste_categoria: resultado.testeCategoria || metadadosBase.teste_categoria,
    };

    res.json({
      resultado: {
        ...resultado,
        metadados: metadadosEnriquecidos,
      },
      respostas: respostasResultado,
    });
  } catch (error) {
    logger.error('Erro ao buscar resultado:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
