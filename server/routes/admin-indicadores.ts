import express from 'express';
import { db } from '../db-config';
import { empresas, resultados, testes } from '../../shared/schema';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { inArray } from 'drizzle-orm';

const router = express.Router();

// GET /api/admin/empresas-com-compras/indicadores
// Indicadores agregados a partir das empresas que têm compras/assinaturas
router.get('/empresas-com-compras/indicadores', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const todasEmpresas = await db.select().from(empresas);

    // Seleciona empresas ativas com evidência de compra/assinatura
    const empresasCompradoras = (todasEmpresas || []).filter((e: any) => {
      const status = String(e?.statusAssinatura || '').toLowerCase();
      const statusOk = ['active', 'ativa', 'trial', 'cancelamento_agendado'].includes(status);
      const hasStripe = Boolean(e?.stripeSubscriptionId) || Boolean(e?.stripeCustomerId) || Boolean(e?.stripePriceId);
      const hasPlano = Boolean(e?.plano);
      return Boolean(e?.ativa) && (statusOk || hasStripe || hasPlano);
    });

    const empresaIds = empresasCompradoras.map((e: any) => e.id);

    if (empresaIds.length === 0) {
      return res.json({
        empresas: { total: 0 },
        testes: { total: 0, mediaPontuacao: 0, mediaPorEmpresa: 0 },
        analise: {
          tendencia: [],
          distribuicaoTemporal: [
            { periodo: 'madrugada', valor: 0 },
            { periodo: 'manhã', valor: 0 },
            { periodo: 'tarde', valor: 0 },
            { periodo: 'noite', valor: 0 },
          ],
          porCategoria: [],
        },
      });
    }

    // Resultados dos testes das empresas compradoras
    const resultadosList = await db
      .select({
        id: resultados.id,
        empresaId: resultados.empresaId,
        testeId: resultados.testeId,
        pontuacaoTotal: resultados.pontuacaoTotal,
        dataRealizacao: resultados.dataRealizacao,
        status: resultados.status,
      })
      .from(resultados)
      .where(inArray(resultados.empresaId, empresaIds));

    const concluidos = resultadosList.filter(r => String(r.status || '') === 'concluido');
    const totalTestes = concluidos.length;
    const mediaPontuacao = totalTestes > 0
      ? Math.round((concluidos.reduce((sum, r) => sum + Number(r.pontuacaoTotal || 0), 0) / totalTestes) * 100) / 100
      : 0;
    const mediaPorEmpresa = empresasCompradoras.length > 0
      ? Math.round((totalTestes / empresasCompradoras.length) * 100) / 100
      : 0;

    // Tendência últimos 6 meses
    const now = new Date();
    const tendencia: Array<{ mes: string; total: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mesKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('pt-BR', { month: 'short' });
      const count = concluidos.filter(r => {
        const dt = new Date(r.dataRealizacao);
        const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
        return key === mesKey;
      }).length;
      tendencia.push({ mes: label, total: count });
    }

    // Distribuição temporal
    const periodos = { madrugada: 0, manhã: 0, tarde: 0, noite: 0 } as Record<string, number>;
    for (const r of concluidos) {
      const hr = new Date(r.dataRealizacao).getHours();
      const periodo = hr < 6 ? 'madrugada' : hr < 12 ? 'manhã' : hr < 18 ? 'tarde' : 'noite';
      periodos[periodo] += 1;
    }
    const distribuicaoTemporal = [
      { periodo: 'madrugada', valor: periodos.madrugada },
      { periodo: 'manhã', valor: periodos.manhã },
      { periodo: 'tarde', valor: periodos.tarde },
      { periodo: 'noite', valor: periodos.noite },
    ];

    // Distribuição por categoria
    const testesIds = Array.from(new Set(concluidos.map(r => r.testeId).filter(Boolean)));
    const testesInfo = testesIds.length > 0
      ? await db.select({ id: testes.id, categoria: testes.categoria }).from(testes).where(inArray(testes.id, testesIds))
      : [];
    const categoriaByTeste: Record<string, string> = {};
    for (const t of testesInfo) categoriaByTeste[String(t.id)] = String(t.categoria || 'Outros');

    const contagemPorCategoria: Record<string, number> = {};
    for (const r of concluidos) {
      const cat = categoriaByTeste[String(r.testeId)] || 'Outros';
      contagemPorCategoria[cat] = (contagemPorCategoria[cat] || 0) + 1;
    }
    const porCategoria = Object.entries(contagemPorCategoria).map(([categoria, total]) => ({ categoria, total }));

    return res.json({
      empresas: { total: empresasCompradoras.length },
      testes: { total: totalTestes, mediaPontuacao, mediaPorEmpresa },
      analise: { tendencia, distribuicaoTemporal, porCategoria },
    });
  } catch (error) {
    console.error('Erro ao calcular indicadores agregados:', error);
    return res.status(500).json({ error: 'Erro ao calcular indicadores agregados' });
  }
});

export default router;