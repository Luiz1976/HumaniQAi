const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'humaniq-dev.db');
const db = new sqlite3.Database(dbPath);

const resultadoId = '02b1b188-3269-4fd6-b3ec-ea66f00003bf';

console.log(`🔍 Verificando resultado com ID: ${resultadoId}`);

db.get(
  'SELECT id, teste_id, usuario_id, pontuacao_total, metadados FROM resultados WHERE id = ?',
  [resultadoId],
  (err, row) => {
    if (err) {
      console.error('❌ Erro ao consultar:', err.message);
      db.close();
      return;
    }
    
    if (row) {
      console.log('✅ Resultado encontrado:');
      console.log('ID:', row.id);
      console.log('Teste ID:', row.teste_id);
      console.log('Usuário ID:', row.usuario_id);
      console.log('Pontuação Total:', row.pontuacao_total);
      console.log('Metadados:', row.metadados);
    } else {
      console.log('❌ Resultado não encontrado no banco de dados');
      console.log('📋 Verificando todos os resultados QVT...');
      
      db.all(
        "SELECT id, teste_id, pontuacao_total FROM resultados WHERE teste_id = 'qualidade-vida-trabalho' LIMIT 5",
        (err2, rows) => {
          if (err2) {
            console.error('❌ Erro ao listar resultados QVT:', err2.message);
          } else {
            console.log('📊 Resultados QVT disponíveis:');
            rows.forEach(row => {
              console.log(`  - ID: ${row.id}, Pontuação: ${row.pontuacao_total}`);
            });
          }
          db.close();
        }
      );
    }
  }
);