import express from 'express';
import { db, dbType } from '../db-config';
import { cursoProgresso, cursoAvaliacoes, cursoCertificados, colaboradores, cursoDisponibilidade } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';
import { randomUUID } from 'crypto';
import { cursos } from '../../src/data/cursosData';

const router = express.Router();

// Helper: Verificar se curso está disponível para o colaborador
async function verificarDisponibilidadeCurso(
  colaboradorId: string,
  cursoSlug: string
): Promise<{ disponivel: boolean; motivo?: string }> {
  try {
    const isDev = String(process.env.NODE_ENV || '').toLowerCase() === 'development';
    if (isDev) {
      return { disponivel: true };
    }
    // Buscar registro de disponibilidade
    const [disponibilidade] = await db
      .select()
      .from(cursoDisponibilidade)
      .where(
        and(
          eq(cursoDisponibilidade.colaboradorId, colaboradorId),
          eq(cursoDisponibilidade.cursoId, cursoSlug)
        )
      )
      .limit(1);

    if (!disponibilidade) {
      return { disponivel: false, motivo: 'Curso não liberado pela empresa' };
    }

    if (!disponibilidade.disponivel) {
      return { disponivel: false, motivo: 'Curso bloqueado pela empresa' };
    }

    return { disponivel: true };
  } catch (error) {
    logger.error('Erro ao verificar disponibilidade:', error);
    return { disponivel: false, motivo: 'Erro ao verificar disponibilidade' };
  }
}

// Obter progresso de um curso específico
router.get('/progresso/:cursoSlug', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { cursoSlug } = req.params;
    const colaboradorId = req.user?.userId;

    if (!colaboradorId) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    // Permitir leitura do progresso mesmo se o curso estiver bloqueado
    const isSqlite = (dbType || '').toLowerCase().includes('sqlite');
    let progresso: any = null;
    if (isSqlite) {
      const { sqlite } = await import('../db-sqlite');
      const row = sqlite.prepare(
        'SELECT * FROM curso_progresso WHERE colaborador_id = ? AND curso_slug = ? LIMIT 1'
      ).get(colaboradorId, String(cursoSlug));
      if (row) {
        let mods: number[] = [];
        if (typeof row.modulos_completados === 'string') {
          try { mods = JSON.parse(row.modulos_completados) || []; } catch { mods = []; }
        }
        progresso = {
          id: row.id,
          colaboradorId: row.colaborador_id,
          cursoId: row.curso_id,
          cursoSlug: row.curso_slug,
          modulosCompletados: mods,
          totalModulos: Number(row.total_modulos || 0),
          progressoPorcentagem: Number(row.progresso_porcentagem || 0),
          avaliacaoFinalRealizada: !!row.avaliacao_final_realizada,
          avaliacaoFinalPontuacao: Number(row.avaliacao_final_pontuacao || 0),
          dataInicio: row.data_inicio,
          dataUltimaAtualizacao: row.data_ultima_atualizacao,
          dataConclusao: row.data_conclusao || null,
        };
      } else {
        progresso = null;
      }
    } else {
      progresso = await db.query.cursoProgresso.findFirst({
        where: and(
          eq(cursoProgresso.colaboradorId, colaboradorId),
          eq(cursoProgresso.cursoSlug, cursoSlug)
        )
      });
    }

    if (!progresso) {
      return res.status(404).json({ error: 'Progresso não encontrado' });
    }

    return res.json(progresso);
  } catch (error) {
    logger.error('Erro ao buscar progresso:', error);
    return res.status(500).json({ error: 'Erro ao buscar progresso' });
  }
});

// Iniciar ou atualizar progresso de um curso
router.post('/progresso', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const colaboradorId = req.user?.userId;
    const { cursoId, cursoSlug, totalModulos } = req.body;

    if (!colaboradorId) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    // Verificar disponibilidade do curso
    const { disponivel, motivo } = await verificarDisponibilidadeCurso(colaboradorId, cursoSlug);
    if (!disponivel) {
      return res.status(403).json({ error: motivo || 'Curso não disponível' });
    }

    // Verificar se já existe progresso
    const progressoExistente = await db.query.cursoProgresso.findFirst({
      where: and(
        eq(cursoProgresso.colaboradorId, colaboradorId),
        eq(cursoProgresso.cursoId, cursoId)
      )
    });

    if (progressoExistente) {
      return res.json(progressoExistente);
    }

    const isSqlite = (dbType || '').toLowerCase().includes('sqlite');
    if (isSqlite) {
      const { sqlite } = await import('../db-sqlite');
      const id = randomUUID();
      const stmt = sqlite.prepare(`
        INSERT INTO curso_progresso (
          id, colaborador_id, curso_id, curso_slug, modulos_completados,
          total_modulos, progresso_porcentagem, avaliacao_final_realizada,
          tentativas_avaliacao, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      stmt.run(
        id,
        colaboradorId,
        String(cursoId),
        String(cursoSlug),
        JSON.stringify([]),
        Number(totalModulos),
        0
      );
      const novo = sqlite.prepare('SELECT * FROM curso_progresso WHERE id = ?').get(id);
      return res.status(201).json(novo);
    } else {
      const [novoProgresso] = await db.insert(cursoProgresso).values({
        id: randomUUID(),
        colaboradorId,
        cursoId,
        cursoSlug,
        totalModulos,
        modulosCompletados: [],
        progressoPorcentagem: 0,
      }).returning();
      return res.status(201).json(novoProgresso);
    }
  } catch (error) {
    logger.error('Erro ao criar progresso:', error);
    return res.status(500).json({ error: 'Erro ao criar progresso' });
  }
});

// Marcar módulo como completado
router.post('/progresso/:cursoSlug/modulo/:moduloId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    logger.info('📝 [CURSOS] Requisição para marcar módulo como concluído recebida');
    const { cursoSlug, moduloId } = req.params;
    const colaboradorId = req.user?.userId;
    const { totalModulos } = req.body; // Aceitar totalModulos do frontend

    logger.info('📝 [CURSOS] Params:', { cursoSlug, moduloId, colaboradorId, totalModulos });

    if (!colaboradorId) {
      logger.error('❌ [CURSOS] Colaborador não autenticado');
      return res.status(401).json({ error: 'Não autorizado' });
    }

    const cursoCatalogo = cursos.find((c) => c.slug === cursoSlug);
    if (!cursoCatalogo) {
      logger.warn('⚠️  [CURSOS] Curso não encontrado no catálogo:', cursoSlug);
      return res.status(404).json({ error: 'Curso não encontrado' });
    }
    const modulosCatalogo = Array.isArray(cursoCatalogo['módulos'])
      ? cursoCatalogo['módulos'].map((mod) => Number((mod as any).id)).filter(Number.isFinite)
      : [];

    // Verificar disponibilidade do curso
    const { disponivel, motivo } = await verificarDisponibilidadeCurso(colaboradorId, cursoSlug);
    if (!disponivel) {
      logger.error('❌ [CURSOS] Curso não disponível:', motivo);
      return res.status(403).json({ error: motivo || 'Curso não disponível' });
    }

    logger.info('📝 [CURSOS] Buscando progresso no banco...');
    const isSqliteFind = (dbType || '').toLowerCase().includes('sqlite');
    let progresso: any = null;
    if (isSqliteFind) {
      const { sqlite } = await import('../db-sqlite');
      const row = sqlite.prepare(
        'SELECT * FROM curso_progresso WHERE colaborador_id = ? AND curso_slug = ? LIMIT 1'
      ).get(colaboradorId, String(cursoSlug));
      progresso = row || null;
    } else {
      progresso = await db.query.cursoProgresso.findFirst({
        where: and(
          eq(cursoProgresso.colaboradorId, colaboradorId),
          eq(cursoProgresso.cursoSlug, cursoSlug)
        )
      });
    }

    if (!progresso) {
      logger.warn('⚠️  [CURSOS] Progresso não encontrado, criando automaticamente...');

      if (!totalModulos) {
        logger.error('❌ [CURSOS] totalModulos não foi fornecido');
        return res.status(400).json({ error: 'totalModulos é obrigatório para criar progresso' });
      }

      const isSqlite = (dbType || '').toLowerCase().includes('sqlite');
      if (isSqlite) {
        const { sqlite } = await import('../db-sqlite');
        const id = randomUUID();
        const stmt = sqlite.prepare(`
          INSERT INTO curso_progresso (
            id, colaborador_id, curso_id, curso_slug, modulos_completados,
            total_modulos, progresso_porcentagem, avaliacao_final_realizada,
            tentativas_avaliacao, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);
        stmt.run(
          id,
          colaboradorId,
          String(cursoSlug),
          String(cursoSlug),
          JSON.stringify([]),
          Number(totalModulos)
        );
        progresso = sqlite.prepare('SELECT * FROM curso_progresso WHERE id = ?').get(id);
      } else {
        const [novoProgresso] = await db.insert(cursoProgresso).values({
          id: randomUUID(),
          colaboradorId,
          cursoId: cursoSlug,
          cursoSlug,
          totalModulos,
          modulosCompletados: [],
          progressoPorcentagem: 0,
        }).returning();
        logger.info('✅ [CURSOS] Progresso criado automaticamente:', novoProgresso.id);
        progresso = novoProgresso as any;
      }
    }

    logger.info('✅ [CURSOS] Progresso encontrado:', progresso.id);

    let modulosCompletadosArray: number[] = [];
    if (isSqliteFind) {
      if (typeof progresso.modulos_completados === 'string') {
        try { modulosCompletadosArray = JSON.parse(progresso.modulos_completados) || []; } catch { modulosCompletadosArray = []; }
      }
    } else {
      modulosCompletadosArray = Array.isArray(progresso.modulosCompletados) ? progresso.modulosCompletados : [];
    }

    logger.info('📝 [CURSOS] Módulos completados antes:', modulosCompletadosArray);

    const moduloIdNum = parseInt(moduloId);
    if (isNaN(moduloIdNum)) {
      logger.warn('⚠️  [CURSOS] moduloId inválido recebido:', moduloId);
      return res.status(400).json({ error: 'ID do módulo inválido' });
    }
    if (moduloIdNum < 1) {
      logger.warn('⚠️  [CURSOS] moduloId fora do intervalo (mínimo 1):', moduloIdNum);
      return res.status(400).json({ error: 'Módulo inexistente para este curso' });
    }

    let totalMods = Number(isSqliteFind ? progresso.total_modulos : progresso.totalModulos);
    const providedTotal = typeof totalModulos === 'number' ? Number(totalModulos) : undefined;
    if ((!Number.isFinite(totalMods) || totalMods <= 0) && providedTotal && Number.isFinite(providedTotal) && providedTotal > 0) {
      if (isSqliteFind) {
        const { sqlite } = await import('../db-sqlite');
        sqlite.prepare(
          'UPDATE curso_progresso SET total_modulos = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).run(providedTotal, progresso.id);
      } else {
        await db
          .update(cursoProgresso)
          .set({ totalModulos: providedTotal, dataUltimaAtualizacao: new Date() })
          .where(eq(cursoProgresso.id, progresso.id));
      }
      totalMods = providedTotal;
    }
    if (typeof totalMods !== 'number' || !Number.isFinite(totalMods) || totalMods <= 0) {
      return res.status(400).json({ error: 'Total de módulos inválido para este curso' });
    }
    if (providedTotal && Number.isFinite(providedTotal) && providedTotal > totalMods) {
      if (isSqliteFind) {
        const { sqlite } = await import('../db-sqlite');
        sqlite.prepare(
          'UPDATE curso_progresso SET total_modulos = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).run(providedTotal, progresso.id);
      } else {
        await db
          .update(cursoProgresso)
          .set({ totalModulos: providedTotal, dataUltimaAtualizacao: new Date() })
          .where(eq(cursoProgresso.id, progresso.id));
      }
      totalMods = providedTotal;
    }


    if (modulosCatalogo.length > 0 && !modulosCatalogo.includes(moduloIdNum)) {
      return res.status(400).json({ error: 'Módulo não pertence a este curso' });
    }

    if (!modulosCompletadosArray.includes(moduloIdNum)) {
      modulosCompletadosArray.push(moduloIdNum);
      logger.info('✅ [CURSOS] Módulo adicionado:', moduloIdNum);
    } else {
      logger.warn('⚠️  [CURSOS] Módulo já estava completado:', moduloIdNum);
    }
    const novaProgresso = Math.round((modulosCompletadosArray.length / (totalMods || 1)) * 100);
    logger.info('📊 [CURSOS] Novo progresso calculado:', novaProgresso + '%');

    logger.info('📝 [CURSOS] Atualizando banco de dados...');
    const isSqlite = (dbType || '').toLowerCase().includes('sqlite');
    if (isSqlite) {
      const { sqlite } = await import('../db-sqlite');
      const stmt = sqlite.prepare(`
        UPDATE curso_progresso
        SET modulos_completados = ?,
            progresso_porcentagem = ?,
            data_ultima_atualizacao = CURRENT_TIMESTAMP,
            data_conclusao = ?
        WHERE id = ?
      `);
      stmt.run(
        JSON.stringify(modulosCompletadosArray),
        novaProgresso,
        modulosCompletadosArray.length === totalMods ? new Date().toISOString() : null,
        progresso.id
      );
      const atualizado = sqlite.prepare('SELECT * FROM curso_progresso WHERE id = ?').get(progresso.id);
      logger.info('✅ [CURSOS] Progresso atualizado (SQLite) com sucesso!');
      let mods: number[] = [];
      if (typeof atualizado.modulos_completados === 'string') {
        try { mods = JSON.parse(atualizado.modulos_completados) || []; } catch { mods = []; }
      }
      return res.json({
        id: atualizado.id,
        colaboradorId: atualizado.colaborador_id,
        cursoId: atualizado.curso_id,
        cursoSlug: atualizado.curso_slug,
        modulosCompletados: mods,
        totalModulos: Number(atualizado.total_modulos || 0),
        progressoPorcentagem: Number(atualizado.progresso_porcentagem || 0),
        avaliacaoFinalRealizada: !!atualizado.avaliacao_final_realizada,
        avaliacaoFinalPontuacao: Number(atualizado.avaliacao_final_pontuacao || 0),
        dataInicio: atualizado.data_inicio,
        dataUltimaAtualizacao: atualizado.data_ultima_atualizacao,
        dataConclusao: atualizado.data_conclusao || null,
      });
    } else {
      const [progressoAtualizado] = await db
        .update(cursoProgresso)
        .set({
          modulosCompletados: modulosCompletadosArray,
          progressoPorcentagem: novaProgresso,
          dataUltimaAtualizacao: new Date(),
          dataConclusao: modulosCompletadosArray.length === totalMods ? new Date() : null,
        })
        .where(eq(cursoProgresso.id, progresso.id))
        .returning();
      logger.info('✅ [CURSOS] Progresso atualizado (Postgres) com sucesso!');
      return res.json(progressoAtualizado);
    }
  } catch (error) {
    logger.error('❌ [CURSOS] Erro ao atualizar progresso:', error);
    logger.error('❌ [CURSOS] Stack trace:', (error as Error).stack);
    return res.status(500).json({
      error: 'Erro ao atualizar progresso',
      details: (error as Error).message
    });
  }
});

// Submeter avaliação final
router.post('/avaliacao/:cursoSlug', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { cursoSlug } = req.params;
    const colaboradorId = req.user?.userId;
    const { cursoId, respostas, pontuacao, totalQuestoes, tempoGasto } = req.body;

    if (!colaboradorId) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    // Verificar se todos os módulos foram completados
    const progresso = await db.query.cursoProgresso.findFirst({
      where: and(
        eq(cursoProgresso.colaboradorId, colaboradorId),
        eq(cursoProgresso.cursoSlug, cursoSlug)
      )
    });

    if (!progresso) {
      return res.status(400).json({ error: 'Complete todos os módulos antes da avaliação' });
    }

    // Se o colaborador já tem progresso, significa que o curso foi liberado em algum momento
    // Permitir avaliação mesmo se disponibilidade foi alterada posteriormente

    const modulosCompletadosArray = Array.isArray(progresso.modulosCompletados)
      ? progresso.modulosCompletados
      : [];

    if (modulosCompletadosArray.length < progresso.totalModulos) {
      return res.status(400).json({
        error: 'Complete todos os módulos antes da avaliação',
        modulosCompletados: modulosCompletadosArray.length,
        totalModulos: progresso.totalModulos
      });
    }

    // Validação: respostas completas e pontuação mínima
    const respostasCount = Array.isArray(respostas)
      ? respostas.length
      : (respostas && typeof respostas === 'object')
        ? Object.keys(respostas).length
        : 0;
    if (typeof totalQuestoes !== 'number' || totalQuestoes <= 0) {
      return res.status(400).json({ error: 'Total de questões inválido' });
    }
    if (respostasCount !== totalQuestoes) {
      return res.status(400).json({
        error: 'Avaliação incompleta: todas as questões devem ser respondidas',
        respondidas: respostasCount,
        totalQuestoes
      });
    }
    if (typeof pontuacao !== 'number' || pontuacao < 0 || pontuacao > totalQuestoes) {
      return res.status(400).json({ error: 'Pontuação inválida' });
    }

    // Verificar número de tentativas (máximo 3)
    const tentativasAtuais = progresso.tentativasAvaliacao || 0;

    if (tentativasAtuais >= 3) {
      return res.status(400).json({
        error: 'Você já utilizou todas as 3 tentativas disponíveis para esta avaliação',
        tentativasRestantes: 0
      });
    }

    // Verificar se já foi aprovado anteriormente
    if (progresso.avaliacaoFinalRealizada && progresso.avaliacaoFinalPontuacao && progresso.avaliacaoFinalPontuacao >= (totalQuestoes * 0.7)) {
      return res.status(400).json({
        error: 'Avaliação já aprovada anteriormente',
        aprovado: true
      });
    }

    // Aprovar se pontuação >= 70%
    const aprovado = pontuacao >= (totalQuestoes * 0.7);
    const novaTentativa = tentativasAtuais + 1;

    // Criar avaliação
    const isSqliteEval = (process.env.NODE_ENV !== 'production') || ((dbType || '').toLowerCase().includes('sqlite'));
    let avaliacao: any;
    try { logger.info('🧪 [AVALIACAO] DB detection', { dbType, nodeEnv: process.env.NODE_ENV, isSqliteEval }); } catch (_) { }
    if (isSqliteEval) {
      const { sqlite } = await import('../db-sqlite');
      const insertStmt = sqlite.prepare(
        `INSERT INTO curso_avaliacoes (
          colaborador_id, curso_id, curso_slug, respostas, pontuacao, total_questoes,
          aprovado, tempo_gasto, data_realizacao, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      );
      insertStmt.run(
        colaboradorId,
        String(cursoId),
        String(cursoSlug),
        JSON.stringify(respostas ?? {}),
        Number(pontuacao),
        Number(totalQuestoes),
        aprovado ? 1 : 0,
        typeof tempoGasto === 'number' ? tempoGasto : null
      );
      const row = sqlite.prepare(
        `SELECT * FROM curso_avaliacoes WHERE colaborador_id = ? AND curso_slug = ? ORDER BY data_realizacao DESC LIMIT 1`
      ).get(colaboradorId, String(cursoSlug));
      avaliacao = {
        id: row?.id,
        colaboradorId,
        cursoId,
        cursoSlug,
        respostas,
        pontuacao,
        totalQuestoes,
        aprovado,
        tempoGasto,
        dataRealizacao: new Date(row?.data_realizacao || Date.now()),
      };
      const updateStmt = sqlite.prepare(
        `UPDATE curso_progresso SET
          avaliacao_final_realizada = ?,
          avaliacao_final_pontuacao = ?,
          tentativas_avaliacao = ?,
          data_ultima_atualizacao = CURRENT_TIMESTAMP
        WHERE id = ?`
      );
      updateStmt.run(aprovado ? 1 : 0, Number(pontuacao), Number(novaTentativa), progresso.id);
    } else {
      const [av] = await db.insert(cursoAvaliacoes).values({
        colaboradorId,
        cursoId,
        cursoSlug,
        respostas,
        pontuacao,
        totalQuestoes,
        aprovado,
        tempoGasto,
        dataRealizacao: new Date(),
      }).returning();
      avaliacao = av;
      await db
        .update(cursoProgresso)
        .set({
          avaliacaoFinalRealizada: aprovado,
          avaliacaoFinalPontuacao: pontuacao,
          tentativasAvaliacao: novaTentativa,
          dataUltimaAtualizacao: new Date(),
        })
        .where(eq(cursoProgresso.id, progresso.id));
    }

    // 🔒 BLOQUEIO AUTOMÁTICO: Se aprovado, bloquear o curso automaticamente
    if (aprovado) {
      try {
        const isSqliteBlock = (dbType || '').toLowerCase().includes('sqlite');
        if (isSqliteBlock) {
          const { sqlite } = await import('../db-sqlite');
          const disp = sqlite.prepare(
            `SELECT * FROM curso_disponibilidade WHERE colaborador_id = ? AND curso_id = ? LIMIT 1`
          ).get(colaboradorId, String(cursoSlug));
          if (disp) {
            sqlite.prepare(
              `UPDATE curso_disponibilidade SET disponivel = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
            ).run(disp.id);
          }
        } else {
          const disponibilidadeExistente = await db.query.cursoDisponibilidade.findFirst({
            where: and(
              eq(cursoDisponibilidade.colaboradorId, colaboradorId),
              eq(cursoDisponibilidade.cursoId, cursoSlug)
            )
          });
          if (disponibilidadeExistente) {
            await db
              .update(cursoDisponibilidade)
              .set({
                disponivel: false,
                updatedAt: new Date()
              })
              .where(eq(cursoDisponibilidade.id, disponibilidadeExistente.id));
          }
        }
      } catch (_) { }
    }

    return res.status(201).json({
      ...avaliacao,
      aprovado,
      tentativaAtual: novaTentativa,
      tentativasRestantes: 3 - novaTentativa
    });
  } catch (error) {
    logger.error('Erro ao salvar avaliação:', error);
    return res.status(500).json({ error: 'Erro ao salvar avaliação' });
  }
});

// Emitir certificado
router.post('/certificado/:cursoSlug', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { cursoSlug } = req.params;
    const colaboradorId = req.user?.userId;
    const { cursoId } = req.body;

    if (!colaboradorId) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    // Verificar se avaliação foi aprovada
    let avaliacao: any = null;
    const isSqliteEnv = (dbType || '').toLowerCase().includes('sqlite');
    if (isSqliteEnv) {
      const { sqlite } = await import('../db-sqlite');
      const avRow = sqlite.prepare(
        'SELECT * FROM curso_avaliacoes WHERE colaborador_id = ? AND curso_slug = ? AND aprovado = 1 ORDER BY data_realizacao DESC LIMIT 1'
      ).get(colaboradorId, String(cursoSlug));
      avaliacao = avRow ? { id: avRow.id, aprovado: !!avRow.aprovado } : null;
    } else {
      avaliacao = await db.query.cursoAvaliacoes.findFirst({
        where: and(
          eq(cursoAvaliacoes.colaboradorId, colaboradorId),
          eq(cursoAvaliacoes.cursoSlug, cursoSlug),
          eq(cursoAvaliacoes.aprovado, true)
        )
      });
    }

    if (!avaliacao) {
      return res.status(400).json({ error: 'Avaliação não aprovada ou não realizada' });
    }

    const isSqliteForProgress = (dbType || '').toLowerCase().includes('sqlite');
    let progressoAny: any = null;
    if (isSqliteForProgress) {
      const { sqlite } = await import('../db-sqlite');
      const stmt = sqlite.prepare(
        'SELECT * FROM curso_progresso WHERE colaborador_id = ? AND curso_slug = ? LIMIT 1'
      );
      progressoAny = stmt.get(colaboradorId, String(cursoSlug));
    } else {
      progressoAny = await db.query.cursoProgresso.findFirst({
        where: and(
          eq(cursoProgresso.colaboradorId, colaboradorId),
          eq(cursoProgresso.cursoSlug, cursoSlug)
        )
      });
    }

    if (!progressoAny) {
      return res.status(400).json({ error: 'Complete todos os módulos antes da certificação' });
    }

    const totalModulosVal = Number(progressoAny.totalModulos || progressoAny.total_modulos || 0);
    let modulosCompletadosCount = 0;
    if (Array.isArray(progressoAny.modulosCompletados)) {
      modulosCompletadosCount = progressoAny.modulosCompletados.length;
    } else if (typeof progressoAny.modulos_completados === 'string') {
      try { modulosCompletadosCount = JSON.parse(progressoAny.modulos_completados).length || 0; } catch { modulosCompletadosCount = 0; }
    }
    const porcent = Number(progressoAny.progressoPorcentagem || progressoAny.progresso_porcentagem || 0);
    const conclusao = progressoAny.dataConclusao || progressoAny.data_conclusao || null;

    if (modulosCompletadosCount < totalModulosVal || porcent < 100 || !conclusao) {
      return res.status(400).json({ error: 'Curso não concluído. Conclua todos os módulos para emitir o certificado' });
    }

    // Verificar se certificado já existe
    let certificadoExistente: any = null;
    const isSqliteCert = (dbType || '').toLowerCase().includes('sqlite');
    if (isSqliteCert) {
      const { sqlite } = await import('../db-sqlite');
      const certRow = sqlite.prepare(
        'SELECT * FROM curso_certificados WHERE colaborador_id = ? AND curso_slug = ? LIMIT 1'
      ).get(colaboradorId, String(cursoSlug));
      if (certRow) {
        certificadoExistente = {
          id: certRow.id,
          colaboradorId: certRow.colaborador_id,
          cursoId: certRow.curso_id,
          cursoSlug: certRow.curso_slug,
          cursoTitulo: certRow.curso_titulo,
          colaboradorNome: certRow.colaborador_nome,
          cargaHoraria: String(certRow.carga_horaria || ''),
          codigoAutenticacao: certRow.codigo_autenticacao,
          qrCodeUrl: certRow.qr_code_url,
          assinaturaDigital: certRow.assinatura_digital,
          validado: !!certRow.validado,
          dataEmissao: new Date(certRow.data_emissao || Date.now()).toISOString(),
        };
      }
    } else {
      certificadoExistente = await db.query.cursoCertificados.findFirst({
        where: and(
          eq(cursoCertificados.colaboradorId, colaboradorId),
          eq(cursoCertificados.cursoSlug, cursoSlug)
        )
      });
    }

    if (certificadoExistente) {
      try {
        logger.info('AUDIT_CERTIFICADO_JA_EXISTENTE', {
          ts: new Date().toISOString(),
          colaboradorId,
          cursoSlug,
          certificadoId: certificadoExistente.id,
          codigoAutenticacao: certificadoExistente.codigoAutenticacao
        });
      } catch (_) { }
      return res.json(certificadoExistente);
    }

    // Buscar nome do colaborador
    let colaborador: any = null;
    if (isSqliteCert) {
      const { sqlite } = await import('../db-sqlite');
      const colRow = sqlite.prepare(
        'SELECT id, nome FROM colaboradores WHERE id = ? LIMIT 1'
      ).get(colaboradorId);
      if (colRow) {
        colaborador = { id: colRow.id, nome: colRow.nome };
      }
    } else {
      colaborador = await db.query.colaboradores.findFirst({
        where: eq(colaboradores.id, colaboradorId)
      });
    }

    if (!colaborador) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    // Validar curso e obter dados confiáveis (evitar manipulação de corpo da requisição)
    let cursoTitulo: string = '';
    let cargaHoraria: string = '';
    try {
      const { cursos } = await import('../../src/data/cursosData');
      const cursoInfo = (cursos as any[]).find((c) => c.slug === cursoSlug);
      if (!cursoInfo) {
        return res.status(404).json({ error: 'Curso não encontrado' });
      }
      cursoTitulo = String(cursoInfo.titulo || 'Curso');
      cargaHoraria = String(cursoInfo.duracao || '1h');
    } catch (e) {
      logger.warn('⚠️ Falha ao carregar dados do curso pelo catálogo:', e);
      cursoTitulo = String(req.body?.cursoTitulo || 'Curso');
      cargaHoraria = String(req.body?.cargaHoraria || '1h');
    }

    // Gerar código de autenticação único
    const codigoAutenticacao = `HQ-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const isSqlite = (dbType || '').toLowerCase().includes('sqlite');
    // Montar metadados de auditoria
    const cursoConclusaoEm = progressoAny?.dataConclusao || progressoAny?.data_conclusao || null;
    const auditMeta = {
      cursoConclusaoEm: cursoConclusaoEm ? new Date(cursoConclusaoEm).toISOString() : null,
      certificadoLiberadoEm: new Date().toISOString(),
      colaboradorId,
      cursoSlug,
      origem: 'post_emitir_certificado',
      userAgent: req.headers['user-agent'] || null,
      ip: (req as any).ip || null,
    };
    if (isSqlite) {
      const { sqlite } = await import('../db-sqlite');
      const id = randomUUID();
      const stmt = sqlite.prepare(`
        INSERT INTO curso_certificados (
          id, colaborador_id, curso_id, curso_slug, curso_titulo, colaborador_nome,
          carga_horaria, codigo_autenticacao, qr_code_url, assinatura_digital,
          validado, data_emissao, metadados
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      `);
      try {
        stmt.run(
          id,
          colaboradorId,
          String(cursoId),
          String(cursoSlug),
          String(cursoTitulo),
          String(colaborador.nome),
          String(cargaHoraria),
          String(codigoAutenticacao),
          `${process.env.REPLIT_DEV_DOMAIN || 'https://humaniq.ai'}/validar-certificado/${codigoAutenticacao}`,
          'Dr. Carlos Silva - Diretor de Educação HumaniQ AI',
          new Date().toISOString(),
          JSON.stringify(auditMeta)
        );
      } catch (e: any) {
        const msg = String(e?.message || '');
        if (msg.includes('UNIQUE') || msg.includes('unique')) {
          const existing = sqlite.prepare(
            'SELECT * FROM curso_certificados WHERE colaborador_id = ? AND curso_slug = ? LIMIT 1'
          ).get(colaboradorId, String(cursoSlug));
          return res.json(existing);
        }
        throw e;
      }
      const certificado = sqlite.prepare('SELECT * FROM curso_certificados WHERE id = ?').get(id);
      try {
        logger.info('AUDIT_CERTIFICADO_LIBERADO', {
          ts: new Date().toISOString(),
          colaboradorId,
          cursoSlug,
          certificadoId: certificado.id,
          codigoAutenticacao,
          ip: (req as any).ip,
          userAgent: req.headers['user-agent']
        });
      } catch (_) { }
      return res.status(201).json(certificado);
    } else {
      const [certificado] = await db.insert(cursoCertificados).values({
        id: randomUUID(),
        colaboradorId,
        cursoId,
        cursoSlug,
        cursoTitulo,
        colaboradorNome: colaborador.nome,
        cargaHoraria,
        codigoAutenticacao,
        qrCodeUrl: `${process.env.REPLIT_DEV_DOMAIN || 'https://humaniq.ai'}/validar-certificado/${codigoAutenticacao}`,
        assinaturaDigital: 'Dr. Carlos Silva - Diretor de Educação HumaniQ AI',
        validado: true,
        dataEmissao: new Date(),
        metadados: auditMeta,
      }).returning();
      try {
        logger.info('AUDIT_CERTIFICADO_LIBERADO', {
          ts: new Date().toISOString(),
          colaboradorId,
          cursoSlug,
          certificadoId: certificado.id,
          codigoAutenticacao,
          ip: (req as any).ip,
          userAgent: req.headers['user-agent']
        });
      } catch (_) { }
      return res.status(201).json(certificado);
    }
  } catch (error) {
    logger.error('Erro ao emitir certificado:', error);
    return res.status(500).json({ error: 'Erro ao emitir certificado' });
  }
});

// Buscar certificado por colaborador e curso
router.get('/certificado/:cursoSlug', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { cursoSlug } = req.params;
    const colaboradorId = req.user?.userId;

    logger.info('🎓 [BACKEND-CERTIFICADO] Buscando certificado');
    logger.info('🎓 [BACKEND-CERTIFICADO] Curso slug:', cursoSlug);
    logger.info('🎓 [BACKEND-CERTIFICADO] Colaborador ID:', colaboradorId);

    // Validar slug contra catálogo de cursos para evitar manipulação de URL
    try {
      const { cursos } = await import('../../src/data/cursosData');
      const exists = cursos.some(c => c.slug === cursoSlug);
      if (!exists) {
        return res.status(404).json({ error: 'Curso não encontrado' });
      }
    } catch (_) { }

    if (!colaboradorId) {
      logger.error('❌ [BACKEND-CERTIFICADO] Colaborador não autorizado');
      return res.status(401).json({ error: 'Não autorizado' });
    }

    const isSqlite = (dbType || '').toLowerCase().includes('sqlite');

    let avaliacaoOk: boolean = false;
    let totalQuestoes = 0;
    let pontuacaoObtida = 0;
    if (isSqlite) {
      const { sqlite } = await import('../db-sqlite');
      const av = sqlite.prepare(
        'SELECT pontuacao, total_questoes FROM curso_avaliacoes WHERE colaborador_id = ? AND curso_slug = ? AND aprovado = 1 ORDER BY data_realizacao DESC LIMIT 1'
      ).get(colaboradorId, String(cursoSlug));
      if (av) {
        totalQuestoes = Number(av.total_questoes || 0);
        pontuacaoObtida = Number(av.pontuacao || 0);
        avaliacaoOk = pontuacaoObtida >= Math.ceil(totalQuestoes * 0.7) && totalQuestoes > 0;
      }
    } else {
      const av = await db.query.cursoAvaliacoes.findFirst({
        where: and(
          eq(cursoAvaliacoes.colaboradorId, colaboradorId),
          eq(cursoAvaliacoes.cursoSlug, cursoSlug),
          eq(cursoAvaliacoes.aprovado, true)
        )
      });
      if (av) {
        totalQuestoes = Number(av.totalQuestoes || 0);
        pontuacaoObtida = Number(av.pontuacao || 0);
        avaliacaoOk = pontuacaoObtida >= Math.ceil(totalQuestoes * 0.7) && totalQuestoes > 0;
      }
    }

    if (!avaliacaoOk) {
      return res.status(404).json({ error: 'Certificado não disponível: avaliação não aprovada' });
    }

    let progressoOk: boolean = false;
    let avaliacaoFinalOkComProgresso: boolean = false;
    if (isSqlite) {
      const { sqlite } = await import('../db-sqlite');
      const pr = sqlite.prepare(
        'SELECT total_modulos, modulos_completados, progresso_porcentagem, data_conclusao, avaliacao_final_realizada, avaliacao_final_pontuacao FROM curso_progresso WHERE colaborador_id = ? AND curso_slug = ? LIMIT 1'
      ).get(colaboradorId, String(cursoSlug));
      if (pr) {
        let comp = 0;
        if (typeof pr.modulos_completados === 'string') {
          try { comp = JSON.parse(pr.modulos_completados).length || 0; } catch { comp = 0; }
        }
        const tm = Number(pr.total_modulos || 0);
        const pct = Number(pr.progresso_porcentagem || 0);
        const concl = pr.data_conclusao || null;
        progressoOk = comp >= tm && pct >= 100 && !!concl;
        avaliacaoFinalOkComProgresso = !!pr.avaliacao_final_realizada && Number(pr.avaliacao_final_pontuacao || 0) >= Math.ceil(totalQuestoes * 0.7);
      }
    } else {
      const pr = await db.query.cursoProgresso.findFirst({
        where: and(
          eq(cursoProgresso.colaboradorId, colaboradorId),
          eq(cursoProgresso.cursoSlug, cursoSlug)
        )
      });
      if (pr) {
        const tm = Number(pr.totalModulos || 0);
        const comp = Array.isArray(pr.modulosCompletados) ? pr.modulosCompletados.length : 0;
        const pct = Number(pr.progressoPorcentagem || 0);
        const concl = pr.dataConclusao || null;
        progressoOk = comp >= tm && pct >= 100 && !!concl;
        avaliacaoFinalOkComProgresso = !!pr.avaliacaoFinalRealizada && Number(pr.avaliacaoFinalPontuacao || 0) >= Math.ceil(totalQuestoes * 0.7);
      }
    }

    if (!progressoOk || !avaliacaoFinalOkComProgresso) {
      return res.status(404).json({ error: 'Certificado não disponível: curso não concluído ou avaliação não aprovada' });
    }

    let certificado: any = null;
    if (isSqlite) {
      const { sqlite } = await import('../db-sqlite');
      const stmt = sqlite.prepare(
        'SELECT * FROM curso_certificados WHERE colaborador_id = ? AND curso_slug = ? LIMIT 1'
      );
      const row = stmt.get(colaboradorId, String(cursoSlug));
      if (row) {
        let carga = row.carga_horaria;
        if (!carga) {
          try {
            const { cursos } = await import('../../src/data/cursosData');
            const ci = (cursos as any[]).find((c: any) => c.slug === cursoSlug);
            carga = String(ci?.['duração'] || '1h');
          } catch (_) {
            carga = '1h';
          }
        }
        certificado = {
          id: row.id,
          colaboradorId: row.colaborador_id,
          cursoId: row.curso_id,
          cursoSlug: row.curso_slug,
          cursoTitulo: row.curso_titulo,
          colaboradorNome: row.colaborador_nome,
          cargaHoraria: carga,
          dataEmissao: new Date(row.data_emissao || Date.now()).toISOString(),
          codigoAutenticacao: row.codigo_autenticacao,
          qrCodeUrl: row.qr_code_url,
          assinaturaDigital: row.assinatura_digital,
          validado: row.validado,
          metadados: row.metadados,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      }
    } else {
      certificado = await db.query.cursoCertificados.findFirst({
        where: and(
          eq(cursoCertificados.colaboradorId, colaboradorId),
          eq(cursoCertificados.cursoSlug, cursoSlug)
        )
      });
    }

    logger.info('🎓 [BACKEND-CERTIFICADO] Certificado encontrado?', !!certificado);
    if (certificado) {
      logger.info('🎓 [BACKEND-CERTIFICADO] ID do certificado:', certificado.id);
    }

    if (!certificado) {
      logger.warn('⚠️ [BACKEND-CERTIFICADO] Certificado não encontrado, sem auto-emissão');
      return res.status(404).json({ error: 'Certificado não encontrado' });
    }

    logger.info('✅ [BACKEND-CERTIFICADO] Retornando certificado com sucesso');
    try {
      let carga = (certificado as any).cargaHoraria;
      if (!carga) {
        try {
          const { cursos } = await import('../../src/data/cursosData');
          const ci = (cursos as any[]).find((c: any) => c.slug === cursoSlug);
          carga = String(ci?.['duração'] || '1h');
        } catch (_) {
          carga = '1h';
        }
      }
      let codigo = (certificado as any).codigoAutenticacao || (certificado as any).codigo_autenticacao || '';
      if (!codigo) {
        const cid = (certificado as any).id || 'NOID';
        codigo = `HQ-${String(cid).substring(0, 8).toUpperCase()}`;
      }
      let dataEmissaoISO: string;
      const de = (certificado as any).dataEmissao;
      if (de instanceof Date) {
        dataEmissaoISO = de.toISOString();
      } else if (typeof de === 'string' && de) {
        const d = new Date(de);
        dataEmissaoISO = isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
      } else {
        dataEmissaoISO = new Date().toISOString();
      }
      const qr = (certificado as any).qrCodeUrl || `${process.env.REPLIT_DEV_DOMAIN || 'https://humaniq.ai'}/validar-certificado/${codigo}`;
      let colaboradorNome = (certificado as any).colaboradorNome || (certificado as any).colaborador_nome || '';
      if (!colaboradorNome) {
        try {
          const [col] = await db
            .select({ nome: colaboradores.nome })
            .from(colaboradores)
            .where(eq(colaboradores.id, (certificado as any).colaboradorId))
            .limit(1);
          colaboradorNome = String(col?.nome || '');
        } catch (_) { }
      }
      const normalized = {
        ...certificado,
        cargaHoraria: String(carga),
        codigoAutenticacao: String(codigo),
        dataEmissao: dataEmissaoISO,
        qrCodeUrl: String(qr),
        colaboradorNome: String(colaboradorNome || 'Aluno'),
      } as any;
      return res.json(normalized);
    } catch (_) {
      return res.json(certificado);
    }
  } catch (error) {
    logger.error('❌ [BACKEND-CERTIFICADO] Erro ao buscar certificado:', error);
    return res.status(500).json({ error: 'Erro ao buscar certificado' });
  }
});

// Validar certificado (público)
router.get('/validar-certificado/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;

    const certificado = await db.query.cursoCertificados.findFirst({
      where: eq(cursoCertificados.codigoAutenticacao, codigo)
    });

    if (!certificado) {
      return res.status(404).json({
        valido: false,
        mensagem: 'Certificado não encontrado'
      });
    }

    return res.json({
      valido: certificado.validado,
      certificado: {
        cursoTitulo: certificado.cursoTitulo,
        colaboradorNome: certificado.colaboradorNome,
        cargaHoraria: certificado.cargaHoraria,
        dataEmissao: certificado.dataEmissao,
        codigoAutenticacao: certificado.codigoAutenticacao,
      }
    });
  } catch (error) {
    logger.error('Erro ao validar certificado:', error);
    return res.status(500).json({ error: 'Erro ao validar certificado' });
  }
});

// Listar todo o progresso de cursos do colaborador
router.get('/progresso', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const colaboradorId = req.user?.userId;

    if (!colaboradorId) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    const progressos = await db.query.cursoProgresso.findMany({
      where: eq(cursoProgresso.colaboradorId, colaboradorId)
    });

    return res.json(progressos);
  } catch (error) {
    logger.error('Erro ao buscar progressos:', error);
    return res.status(500).json({ error: 'Erro ao buscar progressos' });
  }
});

// Listar todos os certificados do colaborador
router.get('/meus-certificados', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const colaboradorId = req.user?.userId;

    if (!colaboradorId) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    const isSqlite = (dbType || '').toLowerCase().includes('sqlite');
    let certificadosCamelCase: any[] = [];
    if (isSqlite) {
      const { sqlite } = await import('../db-sqlite');
      const rows = sqlite.prepare(
        'SELECT * FROM curso_certificados WHERE colaborador_id = ?'
      ).all(colaboradorId);
      certificadosCamelCase = rows
        .filter((row: any) => {
          // Validar avaliação e conclusão atuais antes de exibir
          const av = sqlite.prepare(
            'SELECT pontuacao, total_questoes FROM curso_avaliacoes WHERE colaborador_id = ? AND curso_slug = ? AND aprovado = 1 ORDER BY data_realizacao DESC LIMIT 1'
          ).get(colaboradorId, String(row.curso_slug));
          const pr = sqlite.prepare(
            'SELECT total_modulos, modulos_completados, progresso_porcentagem, data_conclusao, avaliacao_final_realizada, avaliacao_final_pontuacao FROM curso_progresso WHERE colaborador_id = ? AND curso_slug = ? LIMIT 1'
          ).get(colaboradorId, String(row.curso_slug));
          if (!av || !pr) return false;
          const minScoreOk = typeof av.total_questoes === 'number' && typeof av.pontuacao === 'number'
            ? av.pontuacao >= Math.ceil(av.total_questoes * 0.7)
            : false;
          if (!minScoreOk) return false;
          let comp = 0;
          if (typeof pr.modulos_completados === 'string') {
            try { comp = JSON.parse(pr.modulos_completados).length || 0; } catch { comp = 0; }
          }
          const tm = Number(pr.total_modulos || 0);
          const pct = Number(pr.progresso_porcentagem || 0);
          const concl = pr.data_conclusao || null;
          const evalDone = !!pr.avaliacao_final_realizada && Number(pr.avaliacao_final_pontuacao || 0) >= Math.ceil((av.total_questoes || 0) * 0.7);
          return comp >= tm && pct >= 100 && !!concl && evalDone;
        })
        .map((row: any) => {
          let carga = row.carga_horaria;
          if (!carga) {
            // fallback ao catálogo
            try {
              const { cursos } = require('../../src/data/cursosData');
              const ci = (cursos as any[]).find((c: any) => c.slug === row.curso_slug);
              carga = String(ci?.['duração'] || '1h');
            } catch (_) {
              carga = '1h';
            }
          }
          let codigo = row.codigo_autenticacao || '';
          if (!codigo) {
            codigo = `HQ-${String(row.id || 'NOID').substring(0, 8).toUpperCase()}`;
          }
          const qr = row.qr_code_url || `${process.env.REPLIT_DEV_DOMAIN || 'https://humaniq.ai'}/validar-certificado/${codigo}`;
          const de = row.data_emissao;
          const dataEmissaoISO = de ? new Date(de).toISOString() : new Date().toISOString();
          const colaboradorNome = row.colaborador_nome || '';
          return {
            id: row.id,
            colaboradorId: row.colaborador_id,
            cursoId: row.curso_id,
            cursoSlug: row.curso_slug,
            cursoTitulo: row.curso_titulo,
            colaboradorNome: colaboradorNome || 'Aluno',
            cargaHoraria: String(carga),
            dataEmissao: dataEmissaoISO,
            codigoAutenticacao: String(codigo),
            qrCodeUrl: String(qr),
            assinaturaDigital: row.assinatura_digital,
            validado: !!row.validado
          };
        });
    } else {
      const certificados = await db.query.cursoCertificados.findMany({
        where: eq(cursoCertificados.colaboradorId, colaboradorId)
      });
      const filtrados: any[] = [];
      for (const cert of certificados) {
        const av = await db.query.cursoAvaliacoes.findFirst({
          where: and(
            eq(cursoAvaliacoes.colaboradorId, colaboradorId),
            eq(cursoAvaliacoes.cursoSlug, cert.cursoSlug),
            eq(cursoAvaliacoes.aprovado, true)
          )
        });
        const pr = await db.query.cursoProgresso.findFirst({
          where: and(
            eq(cursoProgresso.colaboradorId, colaboradorId),
            eq(cursoProgresso.cursoSlug, cert.cursoSlug)
          )
        });
        const tm = Number(pr?.totalModulos || 0);
        const comp = Array.isArray(pr?.modulosCompletados) ? pr!.modulosCompletados.length : 0;
        const pct = Number(pr?.progressoPorcentagem || 0);
        const concl = pr?.dataConclusao || null;
        let minScoreOk = false;
        if (av && typeof av.totalQuestoes === 'number' && typeof av.pontuacao === 'number') {
          minScoreOk = av.pontuacao >= Math.ceil(av.totalQuestoes * 0.7);
        }
        const evalDone = !!pr?.avaliacaoFinalRealizada && typeof pr?.avaliacaoFinalPontuacao === 'number'
          ? pr!.avaliacaoFinalPontuacao >= Math.ceil((av?.totalQuestoes || 0) * 0.7)
          : false;
        if (av && comp >= tm && pct >= 100 && !!concl && minScoreOk && evalDone) {
          let carga = cert.cargaHoraria;
          if (!carga) {
            try {
              const { cursos } = await import('../../src/data/cursosData');
              const ci = (cursos as any[]).find((c: any) => c.slug === cert.cursoSlug);
              carga = String(ci?.['duração'] || '1h');
            } catch (_) {
              carga = '1h';
            }
          }
          const codigo = cert.codigoAutenticacao || '';
          const qr = cert.qrCodeUrl || `${process.env.REPLIT_DEV_DOMAIN || 'https://humaniq.ai'}/validar-certificado/${codigo}`;
          const de = cert.dataEmissao as any;
          const dataEmissaoISO = de instanceof Date ? de.toISOString() : new Date(de || Date.now()).toISOString();
          filtrados.push({
            id: cert.id,
            colaboradorId: cert.colaboradorId,
            cursoId: cert.cursoId,
            cursoSlug: cert.cursoSlug,
            cursoTitulo: cert.cursoTitulo,
            colaboradorNome: cert.colaboradorNome,
            cargaHoraria: String(carga),
            dataEmissao: dataEmissaoISO,
            codigoAutenticacao: String(codigo),
            qrCodeUrl: String(qr),
            assinaturaDigital: cert.assinaturaDigital,
            validado: cert.validado
          });
        }
      }
      certificadosCamelCase = filtrados;
    }

    return res.json(certificadosCamelCase);
  } catch (error) {
    logger.error('Erro ao buscar certificados:', error);
    return res.status(500).json({ error: 'Erro ao buscar certificados' });
  }
});

router.delete('/admin/purge-cursos-dados', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const isSqlite = (dbType || '').toLowerCase().includes('sqlite');
    if (isSqlite) {
      const { sqlite } = await import('../db-sqlite');
      const before = {
        certificados: Number((sqlite.prepare('SELECT COUNT(1) AS c FROM curso_certificados').get() as any)?.c || 0),
        avaliacoes: Number((sqlite.prepare('SELECT COUNT(1) AS c FROM curso_avaliacoes').get() as any)?.c || 0),
        progresso: Number((sqlite.prepare('SELECT COUNT(1) AS c FROM curso_progresso').get() as any)?.c || 0),
      };
      sqlite.exec('BEGIN');
      try {
        sqlite.exec('DELETE FROM curso_certificados');
        sqlite.exec('DELETE FROM curso_avaliacoes');
        sqlite.exec('DELETE FROM curso_progresso');
        sqlite.exec('COMMIT');
      } catch (e) {
        try { sqlite.exec('ROLLBACK'); } catch (_) { }
        return res.status(500).json({ error: 'Erro ao purgar dados de cursos' });
      }
      const after = {
        certificados: Number((sqlite.prepare('SELECT COUNT(1) AS c FROM curso_certificados').get() as any)?.c || 0),
        avaliacoes: Number((sqlite.prepare('SELECT COUNT(1) AS c FROM curso_avaliacoes').get() as any)?.c || 0),
        progresso: Number((sqlite.prepare('SELECT COUNT(1) AS c FROM curso_progresso').get() as any)?.c || 0),
      };
      try {
        logger.info('AUDIT_PURGE_CURSOS', {
          ts: new Date().toISOString(),
          performedBy: req.user?.userId,
          role: req.user?.role,
          before,
          after,
        });
      } catch (_) { }
      return res.json({ success: true, before, after });
    } else {
      const beforeCertificados = await db.select().from(cursoCertificados);
      const beforeAvaliacoes = await db.select().from(cursoAvaliacoes);
      const beforeProgresso = await db.select().from(cursoProgresso);
      await db.transaction(async (tx: any) => {
        await tx.delete(cursoCertificados);
        await tx.delete(cursoAvaliacoes);
        await tx.delete(cursoProgresso);
      });
      const afterCertificados = await db.select().from(cursoCertificados);
      const afterAvaliacoes = await db.select().from(cursoAvaliacoes);
      const afterProgresso = await db.select().from(cursoProgresso);
      const before = {
        certificados: beforeCertificados.length,
        avaliacoes: beforeAvaliacoes.length,
        progresso: beforeProgresso.length,
      };
      const after = {
        certificados: afterCertificados.length,
        avaliacoes: afterAvaliacoes.length,
        progresso: afterProgresso.length,
      };
      try {
        logger.info('AUDIT_PURGE_CURSOS', {
          ts: new Date().toISOString(),
          performedBy: req.user?.userId,
          role: req.user?.role,
          before,
          after,
        });
      } catch (_) { }
      return res.json({ success: true, before, after });
    }
  } catch (error) {
    logger.error('Erro ao purgar dados de cursos:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
