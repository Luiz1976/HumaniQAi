
import { db } from '../server/db-config';
import { testes, colaboradores, testeDisponibilidade } from '../shared/schema';
import { eq, and } from 'drizzle-orm';

async function checkSpecificIds() {
    console.log('🔍 Checking specific IDs...');
    const colabId = '05cb5e4b-a1ba-4ea6-bce2-4b98270f37af';
    const testeId = '6a9e5d07-5b4f-4f16-9294-eb3ab4c602da'; // This might be a category or ID

    try {
        const [colab] = await db.select().from(colaboradores).where(eq(colaboradores.id, colabId));
        console.log('👤 Collaborator:', colab ? 'Found' : 'Not Found');
        if (colab) console.log(colab);

        const [teste] = await db.select().from(testes).where(eq(testes.id, testeId));
        console.log('📝 Test (by ID):', teste ? 'Found' : 'Not Found');
        if (teste) console.log(teste);

        if (!teste) {
            // Check by category
            const [testeByCat] = await db.select().from(testes).where(eq(testes.categoria, testeId));
            console.log('📝 Test (by Category):', testeByCat ? 'Found' : 'Not Found');
        }

        const [disp] = await db.select().from(testeDisponibilidade).where(and(
            eq(testeDisponibilidade.colaboradorId, colabId),
            eq(testeDisponibilidade.testeId, testeId)
        ));
        console.log('🔓 Availability:', disp ? 'Found' : 'Not Found');
        if (disp) console.log(disp);

    } catch (error) {
        console.error('Error:', error);
    }
    process.exit(0);
}

checkSpecificIds();
