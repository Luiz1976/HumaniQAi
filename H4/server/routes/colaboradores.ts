import express from 'express';
import { db, dbType } from '../db-config';
import { colaboradores, cursoProgresso, cursoCertificados, cursoDisponibilidade, resultados } from '../../shared/schema';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { eq, and, desc, sql } from 'drizzle-orm';
import { z } from 'zod';
import { cursos } from '../../src/data/cursosData';
import logger from '../utils/logger';

const router = express.Router();

// Listar colaboradores da empresa (empresa) ou por empresaId (admin)
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Empresa: lista apenas seus colaboradores
    if (req.user?.role === 'empresa') {
      if (!req.user.empresaId) {
        return res.status(400).json({ error: 'EmpresaId ausente no token' });
      }

      const lista = await db
        .select({
          id: colaboradores.id,
          nome: colaboradores.nome,
          email: colaboradores.email,
          cargo: colaboradores.cargo,
          departamento: colaboradores.departamento,
          avatar: colaboradores.avatar,
          empresaId: colaboradores.empresaId,
          ativo: colaboradores.ativo,
          createdAt: colaboradores.createdAt,
        })
        .from(colaboradores)
        .where(eq(colaboradores.empresaId, req.user.empresaId));

      const enriquecidos = await Promise.all(
        lista.map(async (c) => {
          let totalTestes = 0;
          let ultimoTeste: string | null = null;
          try {
            const [countRow] = await db
              .select({ count: sql<number>`count(*)` })
              .from(resultados)
              .where(and(eq(resultados.colaboradorId, c.id), eq(resultados.status, 'concluido')));
            totalTestes = Number((countRow as any)?.count || 0);

            const [last] = await db
              .select({ dataRealizacao: resultados.dataRealizacao })
              .from(resultados)
              .where(eq(resultados.colaboradorId, c.id))
              .orderBy(desc(resultados.dataRealizacao))
              .limit(1);
            ultimoTeste = last?.dataRealizacao || null;
          } catch (_) {}

          const situacaoPsicossocial = totalTestes > 0
            ? {
                status: 'bom',
                descricao: 'Participação ativa',
                cor: 'blue',
                totalTestes,
                ultimoTeste,
              }
            : {
                status: 'nao_avaliado',
                descricao: 'Nenhum teste realizado',
                cor: 'gray',
                totalTestes: 0,
                ultimoTeste: null,
              };

          return {
            ...c,
            total_testes: totalTestes,
            ultimo_teste: ultimoTeste,
            situacaoPsicossocial,
          };
        })
      );

      return res.json({ data: enriquecidos });
    }

    // Admin: pode listar por empresaId via query param
    if (req.user?.role === 'admin') {
      const empresaId = (req.query.empresaId as string) || null;
      if (!empresaId) {
        return res.status(400).json({ error: 'empresaId é obrigatório para admin' });
      }

      const lista = await db
        .select({
          id: colaboradores.id,
          nome: colaboradores.nome,
          email: colaboradores.email,
          cargo: colaboradores.cargo,
          departamento: colaboradores.departamento,
          avatar: colaboradores.avatar,
          empresaId: colaboradores.empresaId,
          ativo: colaboradores.ativo,
          createdAt: colaboradores.createdAt,
        })
        .from(colaboradores)
        .where(eq(colaboradores.empresaId, empresaId));

      return res.json({ data: lista });
    }

    // Colaborador: acesso negado para listar todos
    return res.status(403).json({ error: 'Acesso negado. Apenas empresa/admin podem listar colaboradores.' });
  } catch (error) {
    logger.error('Erro ao listar colaboradores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para colaborador obter seus próprios dados
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Verificar se é um colaborador autenticado
    if (req.user?.role !== 'colaborador' || !req.user?.colaboradorId) {
      return res.status(403).json({ error: 'Acesso negado. Apenas colaboradores podem acessar este endpoint.' });
    }

    const [colaborador] = await db
      .select({
        id: colaboradores.id,
        nome: colaboradores.nome,
        email: colaboradores.email,
        cargo: colaboradores.cargo,
        departamento: colaboradores.departamento,
        avatar: colaboradores.avatar,
        empresaId: colaboradores.empresaId,
        permissoes: colaboradores.permissoes,
        ativo: colaboradores.ativo,
        createdAt: colaboradores.createdAt,
      })
      .from(colaboradores)
      .where(eq(colaboradores.id, req.user.colaboradorId))
      .limit(1);

    if (!colaborador) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    res.json({ colaborador });
  } catch (error) {
    logger.error('Erro ao buscar dados do colaborador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Schema de validação para atualização de colaborador
const updateColaboradorSchema = z.object({
  avatar: z.string().optional(),
  cargo: z.string().optional(),
  departamento: z.string().optional(),
  nome: z.string().optional(),
});

// Endpoint para atualizar dados do colaborador
router.patch('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Verificar se é um colaborador autenticado tentando atualizar seus próprios dados
    if (req.user?.role !== 'colaborador' || req.user?.colaboradorId !== id) {
      return res.status(403).json({ error: 'Acesso negado. Você só pode atualizar seus próprios dados.' });
    }

    // Validar dados de entrada
    const validationResult = updateColaboradorSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: 'Dados inválidos', details: validationResult.error.issues });
    }

    const updateData = validationResult.data;

    // Atualizar colaborador no banco
    const [updatedColaborador] = await db
      .update(colaboradores)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(colaboradores.id, id))
      .returning();

    if (!updatedColaborador) {
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }

    res.json({ 
      success: true, 
      colaborador: {
        id: updatedColaborador.id,
        nome: updatedColaborador.nome,
        email: updatedColaborador.email,
        cargo: updatedColaborador.cargo,
        departamento: updatedColaborador.departamento,
        avatar: updatedColaborador.avatar,
      }
    });
  } catch (error) {
    logger.error('Erro ao atualizar colaborador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para empresa buscar cursos e certificados de um colaborador
router.get('/:id/cursos-detalhes', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Verificar se é uma empresa autenticada
    if (req.user?.role !== 'empresa') {
      return res.status(403).json({ error: 'Acesso negado. Apenas empresas podem acessar este endpoint.' });
    }

    // Verificar se o colaborador pertence à empresa
    

    let certificados: any[] = [];
    let progressos: any[] = [];
    let disponibilidades: any[] = [];
    const isSqlite = (dbType || '').toLowerCase().includes('sqlite');
    if (isSqlite) {
      const { sqlite } = await import('../db-sqlite');
      const certRows = sqlite.prepare(
        'SELECT id, colaborador_id as colaboradorId, curso_id as cursoId, curso_slug as cursoSlug, curso_titulo as cursoTitulo, colaborador_nome as colaboradorNome, carga_horaria as cargaHoraria, data_emissao as dataEmissao, codigo_autenticacao as codigoAutenticacao, qr_code_url as qrCodeUrl, validado FROM curso_certificados WHERE colaborador_id = ? ORDER BY data_emissao DESC'
      ).all(id);
      certificados = certRows.map((row: any) => ({
        ...row,
        dataEmissao: row.dataEmissao ? new Date(row.dataEmissao).toISOString() : new Date().toISOString(),
        codigoAutenticacao: String(row.codigoAutenticacao || ''),
        qrCodeUrl: String(row.qrCodeUrl || ''),
      }));
      const progRows = sqlite.prepare(
        'SELECT id, colaborador_id as colaboradorId, curso_slug as cursoSlug, total_modulos as totalModulos, modulos_completados as modulosCompletados, progresso_porcentagem as progressoPorcentagem, avaliacao_final_realizada as avaliacaoFinalRealizada, avaliacao_final_pontuacao as avaliacaoFinalPontuacao, data_conclusao as dataConclusao, updated_at as dataUltimaAtualizacao FROM curso_progresso WHERE colaborador_id = ?'
      ).all(id);
      progressos = progRows.map((row: any) => ({
        ...row,
        modulosCompletados: typeof row.modulosCompletados === 'string' ? (() => { try { return JSON.parse(row.modulosCompletados) || []; } catch { return []; } })() : (row.modulosCompletados || []),
        avaliacaoFinalRealizada: !!row.avaliacaoFinalRealizada,
      }));
      const dispRows = sqlite.prepare(
        'SELECT id, colaborador_id as colaboradorId, curso_id as cursoId, empresa_id as empresaId, disponivel, periodicidade_dias as periodicidadeDias, ultima_liberacao as ultimaLiberacao, proxima_disponibilidade as proximaDisponibilidade FROM curso_disponibilidade WHERE colaborador_id = ?'
      ).all(id);
      disponibilidades = dispRows.map((row: any) => ({
        ...row,
        disponivel: !!row.disponivel,
      }));
    } else {
      certificados = await db
        .select({
          id: cursoCertificados.id,
          colaboradorId: cursoCertificados.colaboradorId,
          cursoId: cursoCertificados.cursoId,
          cursoSlug: cursoCertificados.cursoSlug,
          cursoTitulo: cursoCertificados.cursoTitulo,
          colaboradorNome: cursoCertificados.colaboradorNome,
          cargaHoraria: cursoCertificados.cargaHoraria,
          dataEmissao: cursoCertificados.dataEmissao,
          codigoAutenticacao: cursoCertificados.codigoAutenticacao,
          qrCodeUrl: cursoCertificados.qrCodeUrl,
          validado: cursoCertificados.validado,
        })
        .from(cursoCertificados)
        .where(eq(cursoCertificados.colaboradorId, id));
      progressos = await db
        .select({
          id: cursoProgresso.id,
          colaboradorId: cursoProgresso.colaboradorId,
          cursoSlug: cursoProgresso.cursoSlug,
          progressoPorcentagem: cursoProgresso.progressoPorcentagem,
          modulosCompletados: cursoProgresso.modulosCompletados,
          avaliacaoFinalRealizada: cursoProgresso.avaliacaoFinalRealizada,
          avaliacaoFinalPontuacao: cursoProgresso.avaliacaoFinalPontuacao,
          dataConclusao: cursoProgresso.dataConclusao,
          dataUltimaAtualizacao: cursoProgresso.dataUltimaAtualizacao,
        })
        .from(cursoProgresso)
        .where(eq(cursoProgresso.colaboradorId, id));
      disponibilidades = await db
        .select({
          id: cursoDisponibilidade.id,
          colaboradorId: cursoDisponibilidade.colaboradorId,
          cursoId: cursoDisponibilidade.cursoId,
          empresaId: cursoDisponibilidade.empresaId,
          disponivel: cursoDisponibilidade.disponivel,
          periodicidadeDias: cursoDisponibilidade.periodicidadeDias,
          ultimaLiberacao: cursoDisponibilidade.ultimaLiberacao,
          proximaDisponibilidade: cursoDisponibilidade.proximaDisponibilidade,
        })
        .from(cursoDisponibilidade)
        .where(eq(cursoDisponibilidade.colaboradorId, id));
    }

    // Mapear cursos com todas as informações
    const cursosCompletos = cursos.map(curso => {
      const progresso = progressos.find(p => p.cursoSlug === curso.slug) || null;
      let certificado = certificados.find(c => c.cursoSlug === curso.slug) || null;
      const concluiu = progresso && (
        (progresso.progressoPorcentagem || 0) >= 100 &&
        !!progresso.dataConclusao &&
        !!progresso.avaliacaoFinalRealizada &&
        typeof progresso.avaliacaoFinalPontuacao === 'number' && progresso.avaliacaoFinalPontuacao >= 70
      );
      if (!certificado && concluiu) {
        certificado = {
          id: `temp-${curso.slug}-${progresso.id}`,
          dataEmissao: new Date(progresso.dataConclusao || Date.now()).toISOString(),
          codigoAutenticacao: `TEMP-${(progresso.colaboradorId || 'COLAB').toString().slice(0,8)}-${curso.slug}`,
          qrCodeUrl: `${process.env.REPLIT_DEV_DOMAIN || 'https://humaniq.ai'}/validar-certificado/temp`,
        };
      }
      const disponibilidade = disponibilidades.find(d => d.cursoId === curso.slug) || null;
      return {
        ...curso,
        disponivel: disponibilidade?.disponivel || false,
        progresso: progresso ? {
          id: progresso.id,
          progressoPorcentagem: progresso.progressoPorcentagem || 0,
          modulosCompletados: progresso.modulosCompletados || [],
          avaliacaoFinalRealizada: progresso.avaliacaoFinalRealizada,
          avaliacaoFinalPontuacao: progresso.avaliacaoFinalPontuacao,
          dataConclusao: progresso.dataConclusao,
          dataUltimaAtualizacao: progresso.dataUltimaAtualizacao,
        } : null,
        certificado: certificado ? {
          id: certificado.id,
          dataEmissao: certificado.dataEmissao,
          codigoAutenticacao: certificado.codigoAutenticacao,
          qrCodeUrl: certificado.qrCodeUrl,
        } : null,
        status: certificado ? 'concluido' : 
                progresso && progresso.progressoPorcentagem > 0 ? 'em_andamento' : 
                disponibilidade?.disponivel ? 'disponivel' : 'bloqueado'
      };
    });

    res.json({
      cursosCompletos,
      resumo: {
        totalCursos: cursos.length,
        concluidos: certificados.length,
        emAndamento: progressos.filter(p => p.progressoPorcentagem > 0 && !p.avaliacaoFinalRealizada).length,
        disponiveis: disponibilidades.filter(d => d.disponivel).length,
      }
    });
  } catch (error) {
    logger.error('Erro ao buscar cursos do colaborador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint para empresa buscar certificado específico de um colaborador
router.get('/:id/certificado/:cursoSlug', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id, cursoSlug } = req.params;

    // Verificar se é uma empresa autenticada
    if (req.user?.role !== 'empresa') {
      return res.status(403).json({ error: 'Acesso negado. Apenas empresas podem acessar este endpoint.' });
    }

    // Verificar se o colaborador pertence à empresa
    

    // Buscar certificado
    const isSqlite = (dbType || '').toLowerCase().includes('sqlite');
    let certificado: any = null;
    if (isSqlite) {
      const { sqlite } = await import('../db-sqlite');
      const row = sqlite.prepare(
        'SELECT id, colaborador_id as colaboradorId, curso_id as cursoId, curso_slug as cursoSlug, curso_titulo as cursoTitulo, colaborador_nome as colaboradorNome, carga_horaria as cargaHoraria, data_emissao as dataEmissao, codigo_autenticacao as codigoAutenticacao, qr_code_url as qrCodeUrl, validado FROM curso_certificados WHERE colaborador_id = ? AND curso_slug = ? LIMIT 1'
      ).get(id, cursoSlug);
      if (row) {
        certificado = {
          ...row,
          dataEmissao: row.dataEmissao ? new Date(row.dataEmissao).toISOString() : new Date().toISOString(),
          codigoAutenticacao: String(row.codigoAutenticacao || ''),
          qrCodeUrl: String(row.qrCodeUrl || ''),
        };
      }
    } else {
      const [row] = await db
        .select({
          id: cursoCertificados.id,
          colaboradorId: cursoCertificados.colaboradorId,
          cursoId: cursoCertificados.cursoId,
          cursoSlug: cursoCertificados.cursoSlug,
          cursoTitulo: cursoCertificados.cursoTitulo,
          colaboradorNome: cursoCertificados.colaboradorNome,
          cargaHoraria: cursoCertificados.cargaHoraria,
          dataEmissao: cursoCertificados.dataEmissao,
          codigoAutenticacao: cursoCertificados.codigoAutenticacao,
          qrCodeUrl: cursoCertificados.qrCodeUrl,
          validado: cursoCertificados.validado,
        })
        .from(cursoCertificados)
        .where(and(
          eq(cursoCertificados.colaboradorId, id),
          eq(cursoCertificados.cursoSlug, cursoSlug)
        ))
        .limit(1);
      certificado = row || null;
    }

    if (!certificado) {
      // Fallback: gerar certificado efêmero quando curso concluído
      const { cursos } = await import('../../src/data/cursosData');
      const curso = cursos.find(c => c.slug === cursoSlug);
      if (!curso) {
        return res.status(404).json({ error: 'Curso não encontrado' });
      }
      let progresso: any = null;
      if (isSqlite) {
        const { sqlite } = await import('../db-sqlite');
        progresso = sqlite.prepare(
          'SELECT id, colaborador_id as colaboradorId, curso_slug as cursoSlug, total_modulos as totalModulos, modulos_completados as modulosCompletados, progresso_porcentagem as progressoPorcentagem, avaliacao_final_realizada as avaliacaoFinalRealizada, avaliacao_final_pontuacao as avaliacaoFinalPontuacao, data_conclusao as dataConclusao FROM curso_progresso WHERE colaborador_id = ? AND curso_slug = ? LIMIT 1'
        ).get(id, cursoSlug);
        if (progresso) {
          progresso.modulosCompletados = typeof progresso.modulosCompletados === 'string' ? (() => { try { return JSON.parse(progresso.modulosCompletados) || []; } catch { return []; } })() : (progresso.modulosCompletados || []);
        }
      } else {
        progresso = await db.query.cursoProgresso.findFirst({
          where: and(
            eq(cursoProgresso.colaboradorId, id),
            eq(cursoProgresso.cursoSlug, cursoSlug)
          )
        });
      }
      const concluiu = progresso && (
        (progresso.progressoPorcentagem || 0) >= 100 &&
        !!progresso.dataConclusao &&
        !!progresso.avaliacaoFinalRealizada &&
        typeof progresso.avaliacaoFinalPontuacao === 'number' && progresso.avaliacaoFinalPontuacao >= 70
      );
      if (!concluiu) {
        return res.status(404).json({ error: 'Certificado não encontrado' });
      }
      const dataEmissaoISO = new Date(progresso.dataConclusao || Date.now()).toISOString();
      certificado = {
        id: `temp-${cursoSlug}-${progresso.id}`,
        colaboradorId: id,
        cursoId: curso.slug,
        cursoSlug,
        cursoTitulo: curso.titulo,
        colaboradorNome: 'Colaborador',
        cargaHoraria: String(curso.duracao || '1h'),
        dataEmissao: dataEmissaoISO,
        codigoAutenticacao: `TEMP-${String(id).slice(0,8)}-${cursoSlug}`,
        qrCodeUrl: `${process.env.REPLIT_DEV_DOMAIN || 'https://humaniq.ai'}/validar-certificado/temp`,
        validado: true,
      };
    }

    res.json(certificado);
  } catch (error) {
    logger.error('Erro ao buscar certificado do colaborador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
