
import { db } from '../db-config';
import { resultados, colaboradores } from '../../shared/schema';
import { desc, eq } from 'drizzle-orm';

async function main() {
  console.log('🔍 Buscando os 5 últimos resultados registrados no sistema...');

  try {
    const recentResults = await db.select()
      .from(resultados)
      .orderBy(desc(resultados.dataRealizacao))
      .limit(5);

    console.log(`📊 Encontrados ${recentResults.length} resultados recentes.`);

    for (const r of recentResults) {
      console.log('---------------------------------------------------');
      console.log(`ID Resultado: ${r.id}`);
      console.log(`Teste ID: ${r.testeId}`);
      console.log(`User Email (registrado no resultado): ${r.userEmail}`);
      console.log(`Usuario ID: ${r.usuarioId}`);
      console.log(`Colaborador ID: ${r.colaboradorId}`);
      console.log(`Status: ${r.status}`);
      console.log(`Data Realização: ${r.dataRealizacao}`);
      
      if (r.colaboradorId) {
        const c = await db.select().from(colaboradores).where(eq(colaboradores.id, r.colaboradorId)).limit(1);
        if (c.length) {
            console.log(`👤 Detalhes Colaborador (via FK): ID=${c[0].id}, Email=${c[0].email}`);
        } else {
            console.log(`⚠️ Colaborador ID ${r.colaboradorId} não encontrado na tabela colaboradores.`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Erro ao buscar resultados:', error);
  }
}

main();
