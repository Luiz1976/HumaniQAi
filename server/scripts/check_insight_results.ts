
import { db } from '../db-config';
import { resultados, colaboradores } from '../../shared/schema';
import { eq, desc, and } from 'drizzle-orm';

async function main() {
  const insightId = '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5';
  console.log(`🔍 Buscando resultados para o teste HumaniQ Insight (ID: ${insightId})...`);

  try {
    const results = await db.select()
      .from(resultados)
      .where(eq(resultados.testeId, insightId))
      .orderBy(desc(resultados.dataRealizacao));

    console.log(`📊 Total de resultados encontrados: ${results.length}`);

    for (const r of results) {
      console.log('---------------------------------------------------');
      console.log(`ID Resultado: ${r.id}`);
      console.log(`User Email: ${r.userEmail}`);
      console.log(`Colaborador ID: ${r.colaboradorId}`);
      console.log(`Status: ${r.status}`);
      console.log(`Data: ${r.dataRealizacao}`);
      
      if (r.colaboradorId) {
        const c = await db.select().from(colaboradores).where(eq(colaboradores.id, r.colaboradorId)).limit(1);
        if (c.length) console.log(`👤 Colaborador: ${c[0].email}`);
      }
    }

    // Também buscar resultados SEM testeId mas que podem ser desse teste (pelo nome nos metadados?)
    // Mas o código de inserção tenta resolver.

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

main();
