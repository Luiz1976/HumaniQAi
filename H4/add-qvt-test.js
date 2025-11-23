// Script para adicionar o teste QVT ao banco SQLite local
const Database = require('better-sqlite3');

const db = new Database('humaniq-dev.db');

try {
  // Verificar se o teste QVT já existe
  const existing = db.prepare("SELECT id, nome FROM testes WHERE id = ? OR nome LIKE ?").get(
    '7b3c8d4e-9f0a-1b2c-3d4e-5f6a7b8c9d0e',
    '%QVT%'
  );
  
  if (existing) {
    console.log('✅ Teste QVT já existe:', existing);
  } else {
    // Inserir o teste QVT
    const insertTeste = db.prepare(`
      INSERT INTO testes (id, nome, descricao, categoria, tempo_estimado, ativo, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    
    insertTeste.run(
      '7b3c8d4e-9f0a-1b2c-3d4e-5f6a7b8c9d0e',
      'HumaniQ QVT - Qualidade de Vida no Trabalho',
      'Avaliação da satisfação dos colaboradores em cinco dimensões-chave da vida profissional, alinhada com ISO 45001 e conceitos ESG.',
      'Bem-estar e Engajamento',
      15,
      1
    );
    
    console.log('✅ Teste QVT adicionado com sucesso!');
    
    // Adicionar algumas perguntas de exemplo
    const insertPergunta = db.prepare(`
      INSERT INTO perguntas (id, teste_id, texto, tipo, opcoes, ordem, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    
    const perguntas = [
      {
        id: 'qvt-pergunta-1',
        texto: 'Estou satisfeito com as condições físicas do meu ambiente de trabalho (iluminação, temperatura, ruído, ergonomia).',
        ordem: 1
      },
      {
        id: 'qvt-pergunta-2', 
        texto: 'Sinto que posso conciliar adequadamente minha vida pessoal e profissional.',
        ordem: 2
      },
      {
        id: 'qvt-pergunta-3',
        texto: 'Recebo reconhecimento adequado pelo trabalho que realizo.',
        ordem: 3
      }
    ];
    
    const opcoes = '["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"]';
    
    for (const pergunta of perguntas) {
      insertPergunta.run(
        pergunta.id,
        '7b3c8d4e-9f0a-1b2c-3d4e-5f6a7b8c9d0e',
        pergunta.texto,
        'escala_likert',
        opcoes,
        pergunta.ordem
      );
    }
    
    console.log('✅ Perguntas QVT adicionadas com sucesso!');
  }
  
  // Verificar o teste inserido
  const teste = db.prepare("SELECT id, nome, categoria, tempo_estimado, ativo FROM testes WHERE id = ?").get('7b3c8d4e-9f0a-1b2c-3d4e-5f6a7b8c9d0e');
  console.log('📋 Teste QVT no banco:', teste);
  
} catch (error) {
  console.error('❌ Erro ao adicionar teste QVT:', error);
} finally {
  db.close();
}