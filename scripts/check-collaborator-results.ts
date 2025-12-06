
import Database from 'better-sqlite3';

const db = new Database('humaniq-dev.db');

function checkCollaboratorResults() {
    const collaboratorId = 'ee538491-4206-467e-a38a-d5ce5156458f';
    console.log(`🔍 Checking results for collaborator: ${collaboratorId}`);

    try {
        const stmt = db.prepare(`
      SELECT 
        r.id, 
        r.teste_id, 
        t.nome as testeNome, 
        r.data_realizacao, 
        r.status 
      FROM resultados r
      LEFT JOIN testes t ON r.teste_id = t.id
      WHERE r.colaborador_id = ? OR r.usuario_id = ?
      ORDER BY r.data_realizacao DESC
    `);

        const results = stmt.all(collaboratorId, collaboratorId);

        console.log(`Found ${results.length} results.`);
        console.table(results.map((r: any) => ({
            id: r.id,
            teste: r.testeNome,
            data: r.data_realizacao,
            status: r.status
        })));

        const insightTests = results.filter((r: any) => r.testeNome?.toLowerCase().includes('insight'));
        console.log(`\n'Insight' tests found: ${insightTests.length}`);

    } catch (error) {
        console.error('Error checking results:', error);
    }
}

checkCollaboratorResults();
