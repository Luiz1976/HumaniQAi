import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'humaniq.db');

const db = new Database(dbPath);

console.log('🔍 [DEBUG] Verificando estado do teste HumaniQ Insight\n');

// 1. Buscar ID do teste HumaniQ Insight
const testeInsight = db.prepare(`
  SELECT id, nome, categoria, ativo
  FROM testes
  WHERE nome LIKE '%Insight%' OR nome LIKE '%Clima%Bem-Estar%'
`).get();

if (!testeInsight) {
    console.log('❌ Teste HumaniQ Insight não encontrado no banco de dados');
    process.exit(1);
}

console.log('✅ Teste encontrado:');
console.log(`   ID: ${testeInsight.id}`);
console.log(`   Nome: ${testeInsight.nome}`);
console.log(`   Categoria: ${testeInsight.categoria}`);
console.log(`   Ativo: ${testeInsight.ativo}\n`);

// 2. Buscar todos os colaboradores
const colaboradores = db.prepare(`
  SELECT id, nome, email, role
  FROM usuarios
  WHERE role = 'colaborador'
`).all();

console.log(`📋 Total de colaboradores: ${colaboradores.length}\n`);

if (colaboradores.length > 0) {
    colaboradores.forEach((colab, index) => {
        console.log(`👤 Colaborador ${index + 1}:`);
        console.log(`   ID: ${colab.id}`);
        console.log(`   Nome: ${colab.nome}`);
        console.log(`   Email: ${colab.email}`);

        // Buscar resultados deste colaborador para o teste Insight
        const resultados = db.prepare(`
      SELECT id, status, pontuacao_total, data_realizacao
      FROM resultados
      WHERE teste_id = ? AND (usuario_id = ? OR colaborador_id = ?)
      ORDER BY data_realizacao DESC
    `).all(testeInsight.id, colab.id, colab.id);

        console.log(`   Resultados HumaniQ Insight: ${resultados.length}`);

        if (resultados.length > 0) {
            resultados.forEach((res, resIndex) => {
                console.log(`     ${resIndex + 1}. Status: ${res.status}, Pontuação: ${res.pontuacao_total}, Data: ${res.data_realizacao}`);
            });
        }

        // Buscar disponibilidade deste teste para este colaborador
        const disponibilidade = db.prepare(`
      SELECT id, disponivel, motivo, ultima_liberacao, proxima_disponibilidade, created_at, updated_at
      FROM teste_disponibilidade
      WHERE colaborador_id = ? AND teste_id = ?
    `).get(colab.id, testeInsight.id);

        if (disponibilidade) {
            console.log(`   ⚙️ Disponibilidade:`);
            console.log(`      ID: ${disponibilidade.id}`);
            console.log(`      Disponível: ${disponibilidade.disponivel}`);
            console.log(`      Motivo: ${disponibilidade.motivo || 'N/A'}`);
            console.log(`      Criado em: ${disponibilidade.created_at}`);
            console.log(`      Atualizado em: ${disponibilidade.updated_at}`);
        } else {
            console.log(`   ⚠️ Nenhum registro de disponibilidade encontrado`);
        }

        console.log('');
    });
}

// 3. Verificar registros de disponibilidade sem colaborador específico
const disponibilidadeSemColab = db.prepare(`
  SELECT *
  FROM teste_disponibilidade
  WHERE teste_id = ?
`).all(testeInsight.id);

console.log(`\n📊 Total de registros de disponibilidade para HumaniQ Insight: ${disponibilidadeSemColab.length}`);

if (disponibilidadeSemColab.length > 0) {
    console.log('\nDetalhes:');
    disponibilidadeSemColab.forEach((disp, index) => {
        console.log(`\n${index + 1}. Registro:`);
        console.log(`   Colaborador ID: ${disp.colaborador_id}`);
        console.log(`   Disponível: ${disp.disponivel}`);
        console.log(`   Motivo: ${disp.motivo || 'N/A'}`);
        console.log(`   Criado: ${disp.created_at}`);
        console.log(`   Atualizado: ${disp.updated_at}`);
    });
}

db.close();

console.log('\n✅ Análise concluída');
