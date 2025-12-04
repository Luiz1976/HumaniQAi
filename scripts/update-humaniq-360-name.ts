import Database from 'better-sqlite3';

try {
    const db = new Database('humaniq-dev.db');

    console.log('🔧 Atualizando nome do teste "Clima Organizacional" para "HumaniQ 360"...\n');

    const novoNome = 'HumaniQ 360 – Clima Organizacional, Bem-Estar Psicológico e Justiça Corporativa';
    const idTeste = 'clima-organizacional';

    // Verificar nome atual
    const beforeUpdate = db.prepare("SELECT id, nome FROM testes WHERE id = ?").get(idTeste);
    console.log('📋 Nome ANTES da atualização:');
    console.log(`   ID: ${(beforeUpdate as any)?.id}`);
    console.log(`   Nome: ${(beforeUpdate as any)?.nome}\n`);

    // Atualizar o nome
    const updateStmt = db.prepare(`
    UPDATE testes 
    SET nome = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

    const result = updateStmt.run(novoNome, idTeste);
    console.log(`✅ Atualização executada: ${result.changes} registro(s) modificado(s)\n`);

    // Verificar nome após atualização
    const afterUpdate = db.prepare("SELECT id, nome FROM testes WHERE id = ?").get(idTeste);
    console.log('📋 Nome DEPOIS da atualização:');
    console.log(`   ID: ${(afterUpdate as any)?.id}`);
    console.log(`   Nome: ${(afterUpdate as any)?.nome}\n`);

    db.close();
    console.log('\n✅ Atualização concluída com sucesso!');

} catch (error) {
    console.error('❌ Erro ao atualizar nome do teste:', error);
    process.exit(1);
}
