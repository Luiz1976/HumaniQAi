import { db } from '../db-config';
import { testes } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export async function syncTestDefinitions() {
    if (!db) {
        console.warn('⚠️ Banco de dados não inicializado. Pulando sincronização de testes.');
        return;
    }

    console.log('🔄 Sincronizando definições de testes...');

    const updates = [
        {
            categoria: 'clima-organizacional',
            nome: 'HumaniQ 360 – Clima Organizacional, Bem-Estar Psicológico e Justiça Corporativa',
            descricao: 'Avaliação do clima organizacional e satisfação dos colaboradores',
            tempoEstimado: 15
        }
    ];

    for (const update of updates) {
        try {
            // Atualizar baseado na categoria, que é única para este propósito
            const result = await db.update(testes)
                .set({
                    nome: update.nome,
                    descricao: update.descricao,
                    tempoEstimado: update.tempoEstimado,
                    updatedAt: new Date()
                })
                .where(eq(testes.categoria, update.categoria))
                .returning();

            if (result && result.length > 0) {
                console.log(`✅ Teste atualizado: ${update.categoria} -> ${update.nome}`);
            } else {
                console.log(`⚠️ Teste não encontrado para atualização: ${update.categoria}`);
            }
        } catch (error) {
            console.error(`❌ Erro ao sincronizar teste ${update.categoria}:`, error);
        }
    }

    console.log('✅ Sincronização de testes concluída.');
}
