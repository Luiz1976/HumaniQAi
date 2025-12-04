import Database from 'better-sqlite3';

try {
    const db = new Database('humaniq-dev.db');

    console.log('🔍 Buscando testes que contêm "Clima" no nome...\n');

    const testesClima = db.prepare("SELECT id, nome, categoria, ativo FROM testes WHERE nome LIKE '%Clima%'").all();

    console.log(`📋 Encontrados ${testesClima.length} testes:\n`);

    testesClima.forEach((teste: any) => {
        console.log(`ID: ${teste.id}`);
        console.log(`Nome: ${teste.nome}`);
        console.log(`Categoria: ${teste.categoria}`);
        console.log(`Ativo: ${teste.ativo}`);
        console.log('---');
    });

    db.close();
} catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
}
