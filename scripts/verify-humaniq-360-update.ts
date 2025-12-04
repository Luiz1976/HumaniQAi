import Database from 'better-sqlite3';

try {
    const db = new Database('humaniq-dev.db');
    console.log('🔍 Verificando atualização do teste "Clima Organizacional"...\n');

    const idTeste = 'clima-organizacional';
    const expectedName = 'HumaniQ 360 – Clima Organizacional, Bem-Estar Psicológico e Justiça Corporativa';

    const test = db.prepare("SELECT id, nome FROM testes WHERE id = ?").get(idTeste);

    if (!test) {
        console.error('❌ Teste não encontrado!');
        process.exit(1);
    }

    console.log(`   ID: ${(test as any).id}`);
    console.log(`   Nome Atual: ${(test as any).nome}`);

    if ((test as any).nome === expectedName) {
        console.log('\n✅ O nome do teste está correto!');
    } else {
        console.error(`\n❌ O nome do teste está INCORRETO. Esperado: "${expectedName}"`);
        process.exit(1);
    }

    db.close();

} catch (error) {
    console.error('❌ Erro na verificação:', error);
    process.exit(1);
}
