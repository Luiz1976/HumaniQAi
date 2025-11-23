import { Router } from 'express';
import { db } from '../db-config';
import { resultados, colaboradores, testes } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import requireApiKey from '../middleware/apiKey';

const router = Router();

router.use(requireApiKey);

function toCsv(rows: any[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push(headers.map(h => escape((r as any)[h])).join(','));
  }
  return lines.join('\n');
}

router.get('/resultados/:empresaId.csv', async (req, res) => {
  const { empresaId } = req.params;

  const rows = await db
    .select({
      resultadoId: resultados.id,
      testeId: resultados.testeId,
      colaboradorId: resultados.colaboradorId,
      usuarioId: resultados.usuarioId,
      email: resultados.userEmail,
      pontuacaoTotal: resultados.pontuacaoTotal,
      dataRealizacao: resultados.dataRealizacao,
      testeNome: testes.nome,
      colaboradorNome: colaboradores.nome,
      colaboradorCargo: colaboradores.cargo,
      colaboradorDepartamento: colaboradores.departamento,
    })
    .from(resultados)
    .leftJoin(testes, eq(resultados.testeId, testes.id))
    .leftJoin(colaboradores, eq(resultados.colaboradorId, colaboradores.id))
    .where(eq(resultados.empresaId, empresaId));

  const csv = toCsv(rows);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=resultado-${empresaId}.csv`);
  res.send(csv);
});

export default router;