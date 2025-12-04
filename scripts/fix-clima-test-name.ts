import Database from 'better-sqlite3';

try {
    const db = new Database('humaniq-dev.db');

    console.log('🔧 Corrigindo nome do teste "Clima Organizacional"...\n');

    // Verificar nome atual
    const beforeUpdate = db.prepare("SELECT id, nome FROM testes WHERE id = 'clima-organizacional'").get();
    console.log('📋 Nome ANTES da atualização:');
    console.log(`   ID: ${(beforeUpdate as any)?.id}`);
    console.log(`   Nome: ${(beforeUpdate as any)?.nome}\n`);

    // Atualizar o nome
    const updateStmt = db.prepare(`
    UPDATE testes 
    SET nome = 'Clima Organizacional',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = 'clima-organizacional'
  `);

    const result = updateStmt.run();
    console.log(`✅ Atualização executada: ${result.changes} registro(s) modificado(s)\n`);

    // Verificar nome após atualização
    const afterUpdate = db.prepare("SELECT id, nome FROM testes WHERE id = 'clima-organizacional'").get();
    console.log('📋 Nome DEPOIS da atualização:');
    console.log(`   ID: ${(afterUpdate as any)?.id}`);
    console.log(`   Nome: ${(afterUpdate as any)?.nome}\n`);

    // Listar todos os testes com "Clima" para verificação
    console.log('🔍 Verificando todos os testes com "Clima":');
    const allClimaTests = db.prepare("SELECT id, nome, categoria FROM testes WHERE nome LIKE '%Clima%'").all();
    allClimaTests.forEach((test: any) => {
        console.log(`   - ${test.nome} (ID: ${test.id}, Categoria: ${test.categoria})`);
    });

    db.close();
    console.log('\n✅ Correção concluída com sucesso!');

} catch (error) {
    console.error('❌ Erro ao corrigir nome do teste:', error);
    process.exit(1);
}
