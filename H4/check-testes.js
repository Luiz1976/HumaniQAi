const Database = require('better-sqlite3');

const db = new Database('humaniq-dev.db');

try {
  // Buscar todos os testes que contenham "QVT" no nome
  const testes = db.prepare("SELECT id, nome, categoria FROM testes WHERE nome LIKE '%QVT%'").all();
  console.log('Testes QVT encontrados:', testes);
  
  // Buscar teste por categoria
  const testesCategoria = db.prepare("SELECT id, nome, categoria FROM testes WHERE categoria LIKE '%Bem-estar%' OR categoria LIKE '%Engajamento%'").all();
  console.log('Testes por categoria Bem-estar/Engajamento:', testesCategoria);
  
  // Buscar todos os testes para ver o que existe
  const todosTestes = db.prepare("SELECT id, nome, categoria FROM testes ORDER BY nome").all();
  console.log('Todos os testes:', todosTestes);
  
} catch (error) {
  console.error('Erro:', error);
} finally {
  db.close();
}