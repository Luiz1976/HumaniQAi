import express from 'express';
import { db } from '../db-config';
import { empresas, resultados, testes } from '../../shared/schema';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';
import { eq, inArray } from 'drizzle-orm';

const router = express.Router();

// Indicadores agregados de empresas com compras/assinaturas
router.get('/empresas-com-compras/indicadores', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    logger.info('📊 [ADMIN] Indicadores agregados (compras) — iniciando');

    // Empresas que possuem algum sinal de compra/assinatura
    let empresasCompradoras: any[] = [];
    try {
      const todas = await db.select().from(empresas);
      empresasCompradoras = (todas || []).filter((e: any) => {
        const ativaStripe = (e?.statusAssinatura || '').toLowerCase() === 'ativa';
        const temSub = Boolean(e?.stripeSubscriptionId);
        const temPlano = Boolean(e?.plano);
        return e?.ativa && (ativaStripe || temSub || temPlano);
      });
    } catch (err) {
      logger.warn('⚠️ [ADMIN] Falha ao buscar empresas compradoras', { error: (err as any)?.message });
      empresasCompradoras = [];
    }

    const empresaIds = empresasCompradoras.map(e => e.id).filter(Boolean);

    if (empresaIds.length === 0) {
      const meses = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        return { mes: d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }), testes: 0 };
      });
      return res.json({
        empresas: { total: 0 },
        testes: { total: 0, mediaPorEmpresa: 0, pontuacaoMedia: 0, porCategoria: {} },
        analise: { distribuicaoTemporal: { manha: 0, tarde: 0, noite: 0, madrugada: 0 }, tendencia: meses },
      });
    }

    const resultadosAgregados = await db
      .select({
        id: resultados.id,
        empresaId: resultados.empresaId,
        pontuacaoTotal: resultados.pontuacaoTotal,
        dataRealizacao: resultados.dataRealizacao,
        testeId: resultados.testeId,
        categoria: testes.categoria,
        status: resultados.status,
      })
      .from(resultados)
      .leftJoin(testes, eq(resultados.testeId, testes.id))
      .where(inArray(resultados.empresaId, empresaIds));

    const resultadosConcluidos = resultadosAgregados.filter(r => r.status === 'concluido');
    const totalTestes = resultadosConcluidos.length;

    const testesPorCategoria: Record<string, number> = {};
    resultadosConcluidos.forEach(r => {
      const categoria = (r as any).categoria || 'Outros';
      testesPorCategoria[categoria] = (testesPorCategoria[categoria] || 0) + 1;
    });

    const mesesTendencia: Array<{ mes: string; testes: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const inicioMes = new Date();
      inicioMes.setMonth(inicioMes.getMonth() - i);
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);
      const fimMes = new Date(inicioMes);
      fimMes.setMonth(fimMes.getMonth() + 1);

      const testesMes = resultadosConcluidos.filter(r => {
        if (!r.dataRealizacao) return false;
        const dt = new Date(r.dataRealizacao as any);
        return dt >= inicioMes && dt < fimMes;
      }).length;

      mesesTendencia.push({
        mes: inicioMes.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        testes: testesMes,
      });
    }

    const distribuicaoTemporal = { manha: 0, tarde: 0, noite: 0, madrugada: 0 };
    resultadosConcluidos.forEach(r => {
      if (!r.dataRealizacao) return;
      const hora = new Date(r.dataRealizacao as any).getHours();
      if (hora >= 6 && hora < 12) distribuicaoTemporal.manha++;
      else if (hora >= 12 && hora < 18) distribuicaoTemporal.tarde++;
      else if (hora >= 18) distribuicaoTemporal.noite++;
      else distribuicaoTemporal.madrugada++;
    });

    const pontuacoes = resultadosConcluidos
      .map(r => r.pontuacaoTotal)
      .filter(p => p !== null && p !== undefined) as number[];
    const pontuacaoMedia = pontuacoes.length > 0
      ? Number((pontuacoes.reduce((acc, p) => acc + p, 0) / pontuacoes.length).toFixed(1))
      : 0;

    const mediaPorEmpresa = empresaIds.length > 0
      ? Number(((totalTestes || 0) / empresaIds.length).toFixed(2))
      : 0;

    const payload = {
      empresas: { total: empresaIds.length },
      testes: {
        total: totalTestes,
        mediaPorEmpresa,
        pontuacaoMedia,
        porCategoria: testesPorCategoria,
      },
      analise: {
        distribuicaoTemporal,
        tendencia: mesesTendencia,
      },
    };

    return res.json(payload);
  } catch (error) {
    logger.warn('❌ [ADMIN] Erro em indicadores agregados (compras)', { error: (error as any)?.message });
    return res.status(500).json({ error: 'Erro ao carregar indicadores agregados de compras' });
  }
});

export default router;