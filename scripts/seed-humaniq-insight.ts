
import { db } from '../server/db-config';
import { testes } from '../shared/schema';
import { eq } from 'drizzle-orm';

const HUMANIQ_INSIGHT_UUID = 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a';

async function seedHumaniQInsight() {
    console.log('🌱 Seeding HumaniQ Insight test...');

    try {
        // Check if it already exists by name or ID
        const existing = await db.select().from(testes).where(eq(testes.nome, 'HumaniQ Insight')).limit(1);

        if (existing.length > 0) {
            console.log('✅ HumaniQ Insight already exists in DB:', existing[0].id);
            return;
        }

        console.log('📝 Inserting HumaniQ Insight...');
        await db.insert(testes).values({
            id: HUMANIQ_INSIGHT_UUID,
            nome: 'HumaniQ Insight',
            descricao: 'Avalia a percepção dos colaboradores sobre aspectos psicossociais do ambiente de trabalho que influenciam diretamente o bem-estar, a motivação e o engajamento, com foco especial em segurança psicológica, pertencimento e justiça.',
            categoria: 'humaniq-insight',
            tempoEstimado: 20,
            ativo: true,
            instrucoes: JSON.stringify([
                "Leia cada afirmação com atenção",
                "Responda com base na sua percepção atual do ambiente de trabalho",
                "Use a escala de 1 (Discordo totalmente) a 5 (Concordo totalmente)",
                "Seja honesto e objetivo em suas respostas",
                "Não há respostas certas ou erradas"
            ]),
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log('✅ HumaniQ Insight inserted successfully with ID:', HUMANIQ_INSIGHT_UUID);
    } catch (error) {
        console.error('❌ Error seeding HumaniQ Insight:', error);
    }
    process.exit(0);
}

seedHumaniQInsight();
