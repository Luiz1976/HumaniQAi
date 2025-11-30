
import { db, dbType } from './db-config';
import { testes, testeDisponibilidade, resultados, colaboradores } from '../shared/schema';
import { eq, and, or, desc } from 'drizzle-orm';

async function run() {
    console.log('--- Starting Reproduction Script ---');
    console.log('DB Type:', dbType);

    // 1. Simulate a new collaborator (using a random ID, assuming no records exist for it)
    const fakeColaboradorId = '00000000-0000-0000-0000-000000000000'; // UUID fake
    console.log('Simulating for Colaborador ID:', fakeColaboradorId);

    // 2. Fetch active tests (replicating the route logic)
    const isSqlite = (dbType || '').toLowerCase().includes('sqlite');
    console.log('Is SQLite:', isSqlite);

    // FIX: Using true directly to let Drizzle handle abstraction
    // But first let's try exactly what is in the code
    const todosTestes = await db
        .select()
        .from(testes)
        .where(eq(testes.ativo, true));

    console.log('Total Active Tests Found:', todosTestes.length);

    if (todosTestes.length === 0) {
        console.log('WARNING: No active tests found. This might be the issue if the DB is empty or the query is wrong.');
        // Try querying without the where clause to see if there are ANY tests
        const allTestes = await db.select().from(testes);
        console.log('Total Tests in DB (ignoring active status):', allTestes.length);
        if (allTestes.length > 0) {
            console.log('First test active status:', allTestes[0].ativo);
        }
    }

    // 3. Process availability for each test
    const results = await Promise.all(
        todosTestes.map(async (teste) => {
            let disponibilidade = null;
            try {
                const [disp] = await db
                    .select()
                    .from(testeDisponibilidade)
                    .where(
                        and(
                            eq(testeDisponibilidade.colaboradorId, fakeColaboradorId),
                            eq(testeDisponibilidade.testeId, teste.id)
                        )
                    )
                    .limit(1);
                disponibilidade = disp || null;
            } catch (e) {
                console.log('Error fetching availability:', e);
            }

            const [resultado] = await db
                .select()
                .from(resultados)
                .where(
                    and(
                        eq(resultados.testeId, teste.id),
                        or(
                            eq(resultados.colaboradorId, fakeColaboradorId),
                            eq(resultados.usuarioId, fakeColaboradorId)
                        ),
                        eq(resultados.status, 'concluido')
                    )
                )
                .orderBy(desc(resultados.dataRealizacao))
                .limit(1);

            let disponivel = false;
            let motivo: string | null = 'bloqueado_empresa';

            // LOGIC FROM THE ROUTE
            if (disponibilidade) {
                disponivel = disponibilidade.disponivel;
                // ... (omitting periodicidade logic for brevity as it requires disp)
                if (!disponivel) {
                    if (resultado) {
                        motivo = 'teste_concluido';
                    } else {
                        motivo = 'bloqueado_empresa';
                    }
                }
            } else if (resultado) {
                disponivel = false;
                motivo = 'teste_concluido';
            } else {
                // Se não tem configuração nem resultado, liberar por padrão (novo colaborador)
                disponivel = true;
                motivo = null;
            }

            return {
                nome: teste.nome,
                disponivel,
                motivo
            };
        })
    );

    console.log('--- Results ---');
    results.forEach(r => {
        console.log(`Teste: ${r.nome} | Disponivel: ${r.disponivel} | Motivo: ${r.motivo}`);
    });

    process.exit(0);
}

run().catch(e => {
    console.error(e);
    process.exit(1);
});
