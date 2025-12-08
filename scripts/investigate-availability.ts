
import { db, dbType } from '../server/db-config';
import { cursoDisponibilidade, colaboradores } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function main() {
    console.log(`Using Database Type: ${dbType}`);

    // 1. Fetch some collaborators to see if we have any
    const colabs = await db.select().from(colaboradores).limit(5);
    console.log(`Found ${colabs.length} collaborators.`);
    colabs.forEach(c => console.log(`- ${c.nome} (${c.id})`));

    if (colabs.length === 0) {
        console.log("No collaborators found, cannot investigate availability.");
        return;
    }

    // 2. Fetch curso_disponibilidade
    const availabilities = await db.select().from(cursoDisponibilidade).limit(10);
    console.log(`Found ${availabilities.length} availability records.`);

    availabilities.forEach(a => {
        console.log(`- Colab: ${a.colaboradorId}, Curso: ${a.cursoId}, Disponivel: ${a.disponivel} (Type: ${typeof a.disponivel})`);
        // Check if it matches any collaborator we found
        const colab = colabs.find(c => c.id === a.colaboradorId);
        if (colab) {
            console.log(`  -> Owned by ${colab.nome}`);
        }
    });

    if (availabilities.length === 0) {
        console.log("No availability records found. Try releasing a course in the UI first.");
    }

    process.exit(0);
}

main().catch(console.error);
