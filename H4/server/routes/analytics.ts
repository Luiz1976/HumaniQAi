import { Router } from 'express';
import { db } from '../db-config';
import { resultados, testes, empresas } from '../../shared/schema';
import { eq, count, desc } from 'drizzle-orm';
import requireApiKey from '../middleware/apiKey';
import logger from '../utils/logger';

const router = Router();

// Todas as rotas aqui exigem API key
router.use(requireApiKey);

router.get('/resumo/:empresaId', async (req, res) => {
  try {
    const { empresaId } = req.params;

    const totalResultados = await db
      .select({ total: count(resultados.id) })
      .from(resultados)
      .where(eq(resultados.empresaId, empresaId));

    const topTestes = await db
      .select({ id: testes.id, nome: testes.nome, total: count(resultados.id) })
      .from(resultados)
      .leftJoin(testes, eq(resultados.testeId, testes.id))
      .where(eq(resultados.empresaId, empresaId))
      .groupBy(testes.id, testes.nome)
      .orderBy(desc(count(resultados.id)))
      .limit(5);

    res.json({
      empresaId,
      totalResultados: totalResultados[0]?.total || 0,
      topTestes,
    });
  } catch (error: any) {
    logger.error('Erro em analytics/resumo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;