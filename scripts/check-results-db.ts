
import { db } from '../server/db-config';
import { resultados, testes } from '../shared/schema';
import { desc, eq } from 'drizzle-orm';

async function checkResults() {
    console.log('🔍 Checking recent results in database...');
    try {
        const recentResults = await db
            .select({
                id: resultados.id,
                testeId: resultados.testeId,
                pontuacaoTotal: resultados.pontuacaoTotal,
                dataRealizacao: resultados.dataRealizacao,
                metadados: resultados.metadados,
                testeNome: testes.nome
            })
            .from(resultados)
            .leftJoin(testes, eq(resultados.testeId, testes.id))
            .orderBy(desc(resultados.dataRealizacao))
            .limit(5);

        console.log(`Found ${recentResults.length} recent results.`);
        console.log(JSON.stringify(recentResults, null, 2));
    } catch (error) {
        console.error('Error checking results:', error);
    }
    process.exit(0);
}

checkResults();
