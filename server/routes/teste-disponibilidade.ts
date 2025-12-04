import express from 'express';
import { db, dbType } from '../db-config';
import { testeDisponibilidade, testes, resultados, colaboradores, insertTesteDisponibilidadeSchema, updateTesteDisponibilidadeSchema } from '../../shared/schema';
import { authenticateToken, AuthRequest, requireEmpresa, requireColaborador, requireRole } from '../middleware/auth';
import { eq, and, or, desc, sql } from 'drizzle-orm';
import { z } from 'zod';
import logger from '../utils/logger';

type DisponibilidadeRow = typeof testeDisponibilidade.$inferSelect;

const router = express.Router();

/**
 * Buscar testes disponíveis para um colaborador
 * Retorna todos os testes com informações de disponibilidade
 */
router.get('/colaborador/testes', authenticateToken, requireColaborador, async (req: AuthRequest, res) => {
  try {
    const requestId = Math.random().toString(36).slice(2);
    if (!req.user || !req.user.userId) {
      console.error('⚠️ [DISPONIBILIDADE]', requestId, 'Contexto de usuário inválido', req.user);
      return res.status(400).json({ error: 'Contexto de usuário inválido' });
    }
    const colaboradorId = req.user.userId;
    let empresaId = req.user.empresaId;
    if (!empresaId && req.user.role === 'colaborador') {
      try {
        const [colaborador] = await db
          .select({ empresaId: colaboradores.empresaId })
          .from(colaboradores)
          .where(eq(colaboradores.id, colaboradorId))
          .limit(1);
        empresaId = colaborador?.empresaId || empresaId;
      } catch (e) {
        console.error('❌ [DISPONIBILIDADE]', requestId, 'Falha ao resolver empresaId do colaborador', e);
      }
    }
    if (!empresaId) {
      console.error('⚠️ [DISPONIBILIDADE]', requestId, 'EmpresaId ausente para usuário', req.user);
      return res.status(400).json({ error: 'Empresa não identificada' });
    }

    console.log('🔍 [DISPONIBILIDADE]', requestId, 'Buscando testes para colaborador:', colaboradorId, 'da empresa:', empresaId);

    const isSqlite = (dbType || '').toLowerCase().includes('sqlite');
    const todosTestesRaw = await db
      .select()
      .from(testes)
      .where(eq(testes.ativo, isSqlite ? 1 : true));

    const todosTestes = todosTestesRaw.filter((t: any) => {
      const nome = String(t.nome || '').toLowerCase();
      const categoria = String(t.categoria || '').toLowerCase();
      const id = String(t.id || '').toLowerCase();
      if (nome.includes('insight')) return false;
      if (categoria.includes('clima-bem-estar')) return false;
      if (id.includes('clima-bem-estar')) return false;
      return true;
    });

    console.log('📊 [DISPONIBILIDADE]', requestId, 'Total de testes ativos encontrados:', todosTestes.length);

    // Buscar disponibilidade para cada teste
    const testesComDisponibilidade = await Promise.all(
      todosTestes.map(async (teste) => {
        let disponibilidade: DisponibilidadeRow | null = null;
        try {
          const [disp] = await db
            .select()
            .from(testeDisponibilidade)
            .where(
              and(
                eq(testeDisponibilidade.colaboradorId, colaboradorId),
                eq(testeDisponibilidade.testeId, teste.id)
              )
            )
            .limit(1);
          disponibilidade = disp || null;
        } catch (e: unknown) {
          const msg = typeof e === 'object' && e && 'message' in e ? String((e as { message?: unknown }).message) : '';
          if (!/no such table|does not exist/i.test(msg)) {
            throw e;
          }
          disponibilidade = null;
        }

        // Verificar se já completou o teste
        const [resultado] = await db
          .select()
          .from(resultados)
          .where(
            and(
              eq(resultados.testeId, teste.id),
              or(
                eq(resultados.colaboradorId, colaboradorId),
                eq(resultados.usuarioId, colaboradorId)
              ),
              eq(resultados.status, 'concluido')
            )
          )
          .orderBy(desc(resultados.dataRealizacao))
          .limit(1);

        // Determinar disponibilidade
        let disponivel = false;
        let motivo: string | null = 'bloqueado_empresa';
        let proximaDisponibilidade: Date | null = null;

        if (disponibilidade) {
          // Se existe configuração, usar ela
          disponivel = disponibilidade.disponivel;

          if (!disponivel && disponibilidade.periodicidadeDias && disponibilidade.proximaDisponibilidade) {
            const agora = new Date();
            const proxima = new Date(disponibilidade.proximaDisponibilidade);

            if (agora >= proxima) {
              // Período expirou, liberar automaticamente
              disponivel = true;
              await db
                .update(testeDisponibilidade)
                .set({
                  disponivel: true,
                  updatedAt: new Date()
                })
                .where(eq(testeDisponibilidade.id, disponibilidade.id));
            } else {
              proximaDisponibilidade = proxima;
              motivo = 'aguardando_periodicidade';
            }
          } else if (!disponivel) {
            if (resultado) {
              motivo = 'teste_concluido';
            } else {
              motivo = 'bloqueado_empresa';
            }
          }
        } else if (resultado) {
          // Se não tem configuração mas já completou, bloquear por padrão
          disponivel = false;
          motivo = 'teste_concluido';

          // Criar registro de disponibilidade
          try {
            await db
              .insert(testeDisponibilidade)
              .values({
                colaboradorId,
                testeId: teste.id,
                empresaId,
                disponivel: false,
                ultimaLiberacao: null,
                proximaDisponibilidade: null,
              })
            // onConflictDoNothing removido - erro será tratado no catch
          } catch (e: unknown) {
            const msg = typeof e === 'object' && e && 'message' in e ? String((e as { message?: unknown }).message) : '';
            if (!/no such table|does not exist/i.test(msg)) {
              throw e;
            }
          }
        } else {
          // Se não tem configuração nem resultado, liberar por padrão (novo colaborador)
          disponivel = true;
          motivo = null;
        }

        const testeInfo = {
          ...teste,
          disponivel,
          motivo,
          proximaDisponibilidade,
          dataConclusao: resultado?.dataRealizacao || null,
          pontuacao: resultado?.pontuacaoTotal || null,
          periodicidadeDias: disponibilidade?.periodicidadeDias || null,
        };

        console.log(`📋 [DISPONIBILIDADE] ${requestId} Teste "${teste.nome}" - Colaborador: ${colaboradorId}:`, {
          disponivel,
          motivo,
          temDisponibilidade: !!disponibilidade,
          temResultado: !!resultado,
          disponibilidadeData: disponibilidade ? {
            id: disponibilidade.id,
            disponivel: disponibilidade.disponivel,
            periodicidade: disponibilidade.periodicidadeDias,
            proxima: disponibilidade.proximaDisponibilidade,
            ultimaLiberacao: disponibilidade.ultimaLiberacao
          } : null,
          resultadoData: resultado ? {
            id: resultado.id,
            dataRealizacao: resultado.dataRealizacao,
            pontuacao: resultado.pontuacaoTotal
          } : null
        });

        return testeInfo;
      })
    );

    console.log('✅ [DISPONIBILIDADE]', requestId, 'Retornando', testesComDisponibilidade.length, 'testes');
    console.log('📊 [DISPONIBILIDADE]', requestId, 'Resumo:', {
      disponiveis: testesComDisponibilidade.filter(t => t.disponivel).length,
      bloqueados: testesComDisponibilidade.filter(t => !t.disponivel).length
    });

    res.json({
      testes: testesComDisponibilidade,
      total: testesComDisponibilidade.length
    });
  } catch (error: unknown) {
    const requestId = Math.random().toString(36).slice(2);
    const message = typeof error === 'object' && error && 'message' in error ? String((error as { message?: unknown }).message) : String(error);
    const stack = typeof error === 'object' && error && 'stack' in error ? String((error as { stack?: unknown }).stack) : undefined;
    console.error('❌ [DISPONIBILIDADE]', requestId, 'Erro ao buscar testes disponíveis:', message, stack);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * Empresa: Buscar disponibilidade de testes de um colaborador
 */
router.get('/empresa/colaborador/:colaboradorId/testes', authenticateToken, requireEmpresa, async (req: AuthRequest, res) => {
  try {
    const { colaboradorId } = req.params;
    const empresaId = req.user!.empresaId!;
    const requestId = Math.random().toString(36).slice(2);

    const paramsValidation = z.object({ colaboradorId: z.string().uuid() }).safeParse({ colaboradorId });
    if (!paramsValidation.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: paramsValidation.error.issues });
    }

    console.log('🔍 [DISPONIBILIDADE/EMPRESA]', requestId, 'Empresa:', empresaId, 'Colaborador:', colaboradorId);

    // Verificar se o colaborador pertence à empresa
    const [colaborador] = await db
      .select()
      .from(colaboradores)
      .where(
        and(
          eq(colaboradores.id, colaboradorId),
          eq(colaboradores.empresaId, empresaId)
        )
      )
      .limit(1);

    if (!colaborador) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    // Buscar todos os testes (compatível com SQLite e Postgres)
    const isSqlite = (dbType || '').toLowerCase().includes('sqlite');
    const todosTestesRaw = await db
      .select()
      .from(testes)
      .where(eq(testes.ativo, isSqlite ? 1 : true));

    const todosTestes = todosTestesRaw.filter((t: any) => {
      const nome = String(t.nome || '').toLowerCase();
      const categoria = String(t.categoria || '').toLowerCase();
      const id = String(t.id || '').toLowerCase();
      if (nome.includes('insight')) return false;
      if (categoria.includes('clima-bem-estar')) return false;
      if (id.includes('clima-bem-estar')) return false;
      return true;
    });

    // Buscar disponibilidade e resultados para cada teste
    const testesComInfo = await Promise.all(
      todosTestes.map(async (teste) => {
        const [disponibilidade] = await db
          .select()
          .from(testeDisponibilidade)
          .where(
            and(
              eq(testeDisponibilidade.colaboradorId, colaboradorId),
              eq(testeDisponibilidade.testeId, teste.id)
            )
          )
          .limit(1);

        const [resultado] = await db
          .select()
          .from(resultados)
          .where(
            and(
              eq(resultados.testeId, teste.id),
              or(
                eq(resultados.colaboradorId, colaboradorId),
                eq(resultados.usuarioId, colaboradorId)
              ),
              eq(resultados.status, 'concluido')
            )
          )
          .orderBy(desc(resultados.dataRealizacao))
          .limit(1);

        return {
          ...teste,
          disponibilidade: disponibilidade || null,
          ultimoResultado: resultado ? {
            id: resultado.id,
            pontuacaoTotal: resultado.pontuacaoTotal,
            dataRealizacao: resultado.dataRealizacao,
          } : null,
          foiConcluido: !!resultado,
        };
      })
    );

    res.json({
      testes: testesComInfo,
      total: testesComInfo.length
    });
  } catch (error) {
    console.error('Erro ao buscar informações de testes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * Empresa: Liberar teste novamente para um colaborador
 */
router.post('/empresa/colaborador/:colaboradorId/teste/:testeId/liberar', authenticateToken, requireRole('empresa', 'admin'), async (req: AuthRequest, res) => {
  try {
    const { colaboradorId, testeId } = req.params;
    let empresaId: string | null = req.user!.empresaId || null;
    if (!empresaId && req.user!.role === 'admin') {
      try {
        const [colabEmpresa] = await db
          .select({ empresaId: colaboradores.empresaId })
          .from(colaboradores)
          .where(eq(colaboradores.id, colaboradorId))
          .limit(1);
        empresaId = colabEmpresa?.empresaId || null;
      } catch (_) {}
    }
    if (!empresaId) {
      return res.status(400).json({ error: 'Empresa não identificada' });
    }
    const requestId = Math.random().toString(36).slice(2);
    const isSqlite = (dbType || '').toLowerCase().includes('sqlite');

    const paramsValidation = z.object({ colaboradorId: z.string().uuid(), testeId: z.string().min(1) }).safeParse({ colaboradorId, testeId });
    if (!paramsValidation.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: paramsValidation.error.issues });
    }

    console.log('🔧 [LIBERAR/EMPRESA]', requestId, 'Empresa:', empresaId, 'Colaborador:', colaboradorId, 'Teste:', testeId);
    logger.info('LIBERAR_TESTE', { requestId, empresaId, colaboradorId, testeId, byUser: req.user!.userId, role: req.user!.role, ts: new Date().toISOString() });

    // Verificar se o colaborador pertence à empresa
    const [colaborador] = await db
      .select()
      .from(colaboradores)
      .where(
        and(
          eq(colaboradores.id, colaboradorId),
          eq(colaboradores.empresaId, empresaId)
        )
      )
      .limit(1);

    if (!colaborador) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    // Verificar se o teste existe
    const [teste] = await db
      .select()
      .from(testes)
      .where(or(eq(testes.id, testeId), eq(testes.categoria, testeId)))
      .limit(1);

    if (!teste) {
      return res.status(404).json({ error: 'Teste não encontrado' });
    }

    const agora = new Date();

    // Buscar registro de disponibilidade existente
    const [disponibilidadeExistente] = await db
      .select()
      .from(testeDisponibilidade)
      .where(
        and(
          eq(testeDisponibilidade.colaboradorId, colaboradorId),
          eq(testeDisponibilidade.testeId, teste.id)
        )
      )
      .limit(1);

    if (disponibilidadeExistente) {
      // Atualizar registro existente
      const historicoAtual = (disponibilidadeExistente.historicoLiberacoes as Array<{ data: string; liberadoPor: string; motivo: string }>) || [];
      const novoHistorico = [
        ...historicoAtual,
        {
          data: agora.toISOString(),
          liberadoPor: req.user!.userId,
          motivo: 'liberacao_manual',
        },
      ];
      let proximaDisponibilidade: Date | null = null;
      if (disponibilidadeExistente.periodicidadeDias) {
        proximaDisponibilidade = new Date(
          agora.getTime() + disponibilidadeExistente.periodicidadeDias * 24 * 60 * 60 * 1000
        );
      }

      const [atualizado] = await db
        .update(testeDisponibilidade)
        .set({
          disponivel: true,
          ultimaLiberacao: agora,
          proximaDisponibilidade,
          historicoLiberacoes: novoHistorico,
          updatedAt: agora,
        })
        .where(eq(testeDisponibilidade.id, disponibilidadeExistente.id))
        .returning();

      logger.info('LIBERAR_TESTE_SUCESSO', { requestId, empresaId, colaboradorId, testeId, disponibilidadeId: atualizado.id, ts: agora.toISOString() });
      return res.json({ success: true, message: 'Teste liberado com sucesso', disponibilidade: atualizado });
    }

    if ((dbType || '').toLowerCase().includes('sqlite')) {
      const id = (await import('crypto')).randomUUID();
      const { sqlite: sqliteDb } = await import('../db-sqlite');
      const proxima = null;
      const historico = JSON.stringify([{ data: agora.toISOString(), liberadoPor: req.user!.userId, motivo: 'liberacao_manual' }]);
      const stmt = sqliteDb.prepare(`
        INSERT INTO teste_disponibilidade (
          id, colaborador_id, teste_id, empresa_id, disponivel,
          periodicidade_dias, ultima_liberacao, proxima_disponibilidade, historico_liberacoes,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      stmt.run(
        id,
        colaboradorId,
        teste.id,
        empresaId,
        1,
        null,
        agora.toISOString(),
        proxima,
        historico
      );
      logger.info('LIBERAR_TESTE_SUCESSO', { requestId, empresaId, colaboradorId, testeId, disponibilidadeId: id, ts: agora.toISOString() });
      return res.json({ success: true, message: 'Teste liberado com sucesso' });
    } else {
      const [novo] = await db
        .insert(testeDisponibilidade)
        .values({
          colaboradorId,
          testeId: teste.id,
          empresaId,
          disponivel: true,
          ultimaLiberacao: agora,
          proximaDisponibilidade: null,
          historicoLiberacoes: [{ data: agora.toISOString(), liberadoPor: req.user!.userId, motivo: 'liberacao_manual' }],
        })
        .returning();
      logger.info('LIBERAR_TESTE_SUCESSO', { requestId, empresaId, colaboradorId, testeId, disponibilidadeId: novo.id, ts: agora.toISOString() });
      return res.json({ success: true, message: 'Teste liberado com sucesso', disponibilidade: novo });
    }
  } catch (error) {
    console.error('Erro ao liberar teste:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/empresa/colaborador/:colaboradorId/teste/:testeId/bloquear', authenticateToken, requireRole('empresa', 'admin'), async (req: AuthRequest, res) => {
  try {
    const { colaboradorId, testeId } = req.params;
    const empresaId = req.user!.empresaId!;
    const requestId = Math.random().toString(36).slice(2);

    const paramsValidation = z.object({ colaboradorId: z.string().uuid(), testeId: z.string().min(1) }).safeParse({ colaboradorId, testeId });
    if (!paramsValidation.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: paramsValidation.error.issues });
    }

    const [colaborador] = await db
      .select()
      .from(colaboradores)
      .where(
        and(
          eq(colaboradores.id, colaboradorId),
          eq(colaboradores.empresaId, empresaId)
        )
      )
      .limit(1);

    if (!colaborador) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    const [teste] = await db
      .select()
      .from(testes)
      .where(or(eq(testes.id, testeId), eq(testes.categoria, testeId)))
      .limit(1);

    if (!teste) {
      return res.status(404).json({ error: 'Teste não encontrado' });
    }

    const agora = new Date();

    const [disponibilidadeExistente] = await db
      .select()
      .from(testeDisponibilidade)
      .where(
        and(
          eq(testeDisponibilidade.colaboradorId, colaboradorId),
          eq(testeDisponibilidade.testeId, teste.id)
        )
      )
      .limit(1);

    if (disponibilidadeExistente) {
      await db
        .update(testeDisponibilidade)
        .set({
          disponivel: false,
          updatedAt: agora,
          historicoLiberacoes: [
            ...(disponibilidadeExistente.historicoLiberacoes as any[] || []),
            { data: agora.toISOString(), liberadoPor: req.user!.userId, motivo: 'bloqueio_manual' }
          ]
        })
        .where(eq(testeDisponibilidade.id, disponibilidadeExistente.id));

      logger.info('BLOQUEAR_TESTE_SUCESSO', { requestId, empresaId, colaboradorId, testeId, disponibilidadeId: disponibilidadeExistente.id, ts: agora.toISOString() });
      return res.json({ success: true, message: 'Teste bloqueado com sucesso' });
    } else {
      const [novo] = await db
        .insert(testeDisponibilidade)
        .values({
          colaboradorId,
          testeId: teste.id,
          empresaId,
          disponivel: false,
          ultimaLiberacao: null,
          proximaDisponibilidade: null,
          historicoLiberacoes: [{ data: agora.toISOString(), liberadoPor: req.user!.userId, motivo: 'bloqueio_manual_criacao' }],
        })
        .returning();

      logger.info('BLOQUEAR_TESTE_SUCESSO', { requestId, empresaId, colaboradorId, testeId, disponibilidadeId: novo.id, ts: agora.toISOString() });
      return res.json({ success: true, message: 'Teste bloqueado com sucesso', disponibilidade: novo });
    }
  } catch (error) {
    console.error('Erro ao bloquear teste:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/empresa/colaborador/:colaboradorId/testes/bloquear', authenticateToken, requireRole('empresa', 'admin'), async (req: AuthRequest, res) => {
  try {
    const { colaboradorId } = req.params;
    const empresaId = req.user!.empresaId!;
    const requestId = Math.random().toString(36).slice(2);

    const paramsValidation = z.object({ colaboradorId: z.string().uuid() }).safeParse({ colaboradorId });
    if (!paramsValidation.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: paramsValidation.error.issues });
    }

    const [colaborador] = await db
      .select()
      .from(colaboradores)
      .where(
        and(
          eq(colaboradores.id, colaboradorId),
          eq(colaboradores.empresaId, empresaId)
        )
      )
      .limit(1);

    if (!colaborador) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    const isSqlite = (dbType || '').toLowerCase().includes('sqlite');
    const todosTestes = await db
      .select()
      .from(testes)
      .where(eq(testes.ativo, isSqlite ? 1 : true));

    const agora = new Date();
    for (const t of todosTestes) {
      const [disp] = await db
        .select()
        .from(testeDisponibilidade)
        .where(
          and(
            eq(testeDisponibilidade.colaboradorId, colaboradorId),
            eq(testeDisponibilidade.testeId, t.id)
          )
        )
        .limit(1);
      if (disp) {
        const historicoAtual = (disp.historicoLiberacoes as Array<{ data: string; liberadoPor: string; motivo: string }>) || [];
        const novoHistorico = [
          ...historicoAtual,
          { data: agora.toISOString(), liberadoPor: req.user!.userId, motivo: 'bloqueio_empresa' },
        ];
        await db
          .update(testeDisponibilidade)
          .set({ disponivel: false, proximaDisponibilidade: null, historicoLiberacoes: novoHistorico, updatedAt: agora })
          .where(eq(testeDisponibilidade.id, disp.id));
      } else {
        if ((dbType || '').toLowerCase().includes('sqlite')) {
          const id = (await import('crypto')).randomUUID();
          const { sqlite: sqliteDb } = await import('../db-sqlite');
          const stmt = sqliteDb.prepare(`
            INSERT INTO teste_disponibilidade (
              id, colaborador_id, teste_id, empresa_id, disponivel,
              ultima_liberacao, proxima_disponibilidade, historico_liberacoes,
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `);
          stmt.run(
            id,
            colaboradorId,
            t.id,
            empresaId,
            0,
            null,
            null,
            JSON.stringify([{ data: agora.toISOString(), liberadoPor: req.user!.userId, motivo: 'bloqueio_empresa' }])
          );
        } else {
          await db
            .insert(testeDisponibilidade)
            .values({
              colaboradorId,
              testeId: t.id,
              empresaId,
              disponivel: false,
              ultimaLiberacao: agora,
              proximaDisponibilidade: null,
              historicoLiberacoes: [{ data: agora.toISOString(), liberadoPor: req.user!.userId, motivo: 'bloqueio_empresa' }],
            });
        }
      }
    }

    return res.json({ success: true, message: 'Testes bloqueados com sucesso' });
  } catch (error) {
    console.error('Erro ao bloquear testes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * Empresa: Configurar periodicidade de um teste para um colaborador
 */
router.patch('/empresa/colaborador/:colaboradorId/teste/:testeId/periodicidade', authenticateToken, requireRole('empresa', 'admin'), async (req: AuthRequest, res) => {
  try {
    const { colaboradorId, testeId } = req.params;
    const empresaId = req.user!.empresaId!;
    const requestId = Math.random().toString(36).slice(2);

    const paramsValidation = z.object({ colaboradorId: z.string().uuid(), testeId: z.string().min(1) }).safeParse({ colaboradorId, testeId });
    if (!paramsValidation.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: paramsValidation.error.issues });
    }

    console.log('⚙️ [PERIODICIDADE/EMPRESA]', requestId, 'Empresa:', empresaId, 'Colaborador:', colaboradorId, 'Teste:', testeId);
    logger.info('CONFIG_PERIODICIDADE', { requestId, empresaId, colaboradorId, testeId, byUser: req.user!.userId, role: req.user!.role, ts: new Date().toISOString() });

    // Validar dados
    const validationResult = z.object({
      periodicidadeDias: z.number().min(1).nullable().optional(),
    }).safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validationResult.error.issues
      });
    }

    const { periodicidadeDias } = validationResult.data;

    // Verificar se o colaborador pertence à empresa
    const [colaborador] = await db
      .select()
      .from(colaboradores)
      .where(
        and(
          eq(colaboradores.id, colaboradorId),
          eq(colaboradores.empresaId, empresaId)
        )
      )
      .limit(1);

    if (!colaborador) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    // Verificar se o teste existe
    const [teste] = await db
      .select()
      .from(testes)
      .where(or(eq(testes.id, testeId), eq(testes.categoria, testeId)))
      .limit(1);

    if (!teste) {
      return res.status(404).json({ error: 'Teste não encontrado' });
    }

    const agora = new Date();

    // Buscar registro existente
    const [disponibilidadeExistente] = await db
      .select()
      .from(testeDisponibilidade)
      .where(
        and(
          eq(testeDisponibilidade.colaboradorId, colaboradorId),
          eq(testeDisponibilidade.testeId, teste.id)
        )
      )
      .limit(1);

    // Calcular próxima disponibilidade se tiver periodicidade
    let proximaDisponibilidade: Date | null = null;
    if (periodicidadeDias && disponibilidadeExistente?.ultimaLiberacao) {
      const ultimaData = new Date(disponibilidadeExistente.ultimaLiberacao);
      proximaDisponibilidade = new Date(
        ultimaData.getTime() + periodicidadeDias * 24 * 60 * 60 * 1000
      );
    }

    if (disponibilidadeExistente) {
      // Atualizar registro existente
      const [atualizado] = await db
        .update(testeDisponibilidade)
        .set({
          periodicidadeDias,
          proximaDisponibilidade,
          metadados: {
            ...(disponibilidadeExistente.metadados as Record<string, unknown> || {}),
            periodicidadeConfiguradaEm: agora.toISOString(),
            configuradoPor: req.user!.userId,
          },
          updatedAt: agora,
        })
        .where(eq(testeDisponibilidade.id, disponibilidadeExistente.id))
        .returning();

      const payload = {
        success: true,
        message: 'Periodicidade configurada com sucesso',
        disponibilidade: atualizado,
      };
      logger.info('CONFIG_PERIODICIDADE_SUCESSO', { requestId, empresaId, colaboradorId, testeId, disponibilidadeId: atualizado.id, periodicidadeDias, proximaDisponibilidade, ts: new Date().toISOString() });
      return res.json(payload);
    } else {
      // Criar novo registro
      const [novo] = await db
        .insert(testeDisponibilidade)
        .values({
          colaboradorId,
          testeId,
          empresaId,
          disponivel: true,
          periodicidadeDias,
          proximaDisponibilidade,
          metadados: {
            periodicidadeConfiguradaEm: agora.toISOString(),
            configuradoPor: req.user!.userId,
          },
        })
        .returning();

      const payload = {
        success: true,
        message: 'Periodicidade configurada com sucesso',
        disponibilidade: novo,
      };
      logger.info('CONFIG_PERIODICIDADE_SUCESSO', { requestId, empresaId, colaboradorId, testeId, disponibilidadeId: novo.id, periodicidadeDias, proximaDisponibilidade, ts: new Date().toISOString() });
      return res.json(payload);
    }
  } catch (error) {
    console.error('Erro ao configurar periodicidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * Hook: Marcar teste como indisponível após conclusão
 * Este é chamado automaticamente após salvar um resultado
 */
router.post('/marcar-concluido', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const validationResult = z.object({
      testeId: z.string().uuid(),
      colaboradorId: z.string().uuid().optional(),
    }).safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: validationResult.error.issues
      });
    }

    const { testeId, colaboradorId: colaboradorIdParam } = validationResult.data;
    const colaboradorId = colaboradorIdParam || req.user!.userId;
    const empresaId = req.user!.empresaId;

    if (!empresaId) {
      return res.status(400).json({ error: 'Empresa não identificada' });
    }

    // Buscar registro existente
    const [disponibilidadeExistente] = await db
      .select()
      .from(testeDisponibilidade)
      .where(
        and(
          eq(testeDisponibilidade.colaboradorId, colaboradorId),
          eq(testeDisponibilidade.testeId, testeId)
        )
      )
      .limit(1);

    const agora = new Date();

    if (disponibilidadeExistente) {
      // Calcular próxima disponibilidade se tiver periodicidade
      let proximaDisponibilidade: Date | null = null;
      if (disponibilidadeExistente.periodicidadeDias) {
        proximaDisponibilidade = new Date(
          agora.getTime() + disponibilidadeExistente.periodicidadeDias * 24 * 60 * 60 * 1000
        );
      }

      // Atualizar para indisponível
      await db
        .update(testeDisponibilidade)
        .set({
          disponivel: false,
          proximaDisponibilidade,
          updatedAt: agora,
        })
        .where(eq(testeDisponibilidade.id, disponibilidadeExistente.id));
      logger.info('BLOQUEIO_AUTOMATICO_TESTE', { empresaId, colaboradorId, testeId, disponibilidadeId: disponibilidadeExistente.id, proximaDisponibilidade, byUser: req.user!.userId, ts: agora.toISOString() });
    } else {
      // Criar novo registro como indisponível
      await db
        .insert(testeDisponibilidade)
        .values({
          colaboradorId,
          testeId,
          empresaId,
          disponivel: false,
          ultimaLiberacao: null,
          proximaDisponibilidade: null,
        })
        .onConflictDoNothing();
      logger.info('BLOQUEIO_AUTOMATICO_TESTE', { empresaId, colaboradorId, testeId, disponibilidadeCriada: true, byUser: req.user!.userId, ts: agora.toISOString() });
    }

    res.json({
      success: true,
      message: 'Teste marcado como concluído'
    });
  } catch (error) {
    console.error('Erro ao marcar teste como concluído:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
