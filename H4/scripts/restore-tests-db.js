const Database = require('better-sqlite3');

const db = new Database('humaniq-dev.db');

const tests = [
  { nome: 'HumaniQ - Clima', categoria: 'clima-organizacional', descricao: 'Avaliação do clima organizacional e satisfação dos colaboradores', tempo_estimado: 15 },
  { nome: 'HumaniQ - Karasek-Siegrist', categoria: 'karasek-siegrist', descricao: 'Modelo demanda-controle e recompensa-esforço', tempo_estimado: 20 },
  { nome: 'HumaniQ EO – Estresse Ocupacional, Burnout e Resiliência', categoria: 'estresse-ocupacional', descricao: 'Estresse ocupacional e fatores de resiliência', tempo_estimado: 20 },
  { nome: 'HumaniQ Insight', categoria: 'humaniq-insight', descricao: 'Insights comportamentais e desenvolvimento', tempo_estimado: 25 },
  { nome: 'HumaniQ MGRP – Maturidade em Gestão de Riscos Psicossociais', categoria: 'maturidade-riscos-psicossociais', descricao: 'Maturidade na gestão de riscos psicossociais', tempo_estimado: 15 },
  { nome: 'HumaniQ PAS – Percepção de Assédio Moral e Sexual', categoria: 'percepcao-assedio', descricao: 'Percepção e prevenção de assédio', tempo_estimado: 10 },
  { nome: 'HumaniQ QVT – Qualidade de Vida no Trabalho', categoria: 'qualidade-vida-trabalho', descricao: 'Indicadores de qualidade de vida no trabalho', tempo_estimado: 15 },
  { nome: 'HumaniQ RPO – Riscos Psicossociais Ocupacionais', categoria: 'rpo', descricao: 'Mapeamento de riscos psicossociais ocupacionais', tempo_estimado: 15 },
];

function toSlug(s) {
  return String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

try {
  db.exec('BEGIN');
  const selectAll = db.prepare('SELECT id, nome, categoria FROM testes');
  const insert = db.prepare('INSERT INTO testes (id, nome, descricao, categoria, tempo_estimado, ativo) VALUES (?, ?, ?, ?, ?, 1)');
  const update = db.prepare('UPDATE testes SET nome = ?, descricao = ?, categoria = ?, tempo_estimado = ?, ativo = 1 WHERE id = ?');

  // Remover duplicatas de "HumaniQ Insight" mantendo apenas a instância com id 'humaniq-insight'
  const desiredInsightId = 'humaniq-insight';
  const deleteDup = db.prepare("DELETE FROM testes WHERE LOWER(nome) LIKE 'humaniq insight%' AND id != ?");
  deleteDup.run(desiredInsightId);
  // Remover entradas antigas de 'clima-bem-estar' para evitar conflitos
  const deleteOldClima = db.prepare("DELETE FROM testes WHERE categoria = 'clima-bem-estar'");
  deleteOldClima.run();

  const existing = selectAll.all();

  for (const t of tests) {
    const id = toSlug(t.categoria);
    const found = existing.find((e) => toSlug(e.id) === id || toSlug(e.nome || '') === id || toSlug(e.categoria || '') === id);
    if (!found) {
      insert.run(id, t.nome, t.descricao, t.categoria, t.tempo_estimado);
      console.log(`+ Inserido: ${id}`);
    } else {
      update.run(t.nome, t.descricao, t.categoria, t.tempo_estimado, found.id);
      console.log(`~ Atualizado: ${found.id}`);
    }
  }

  db.exec('COMMIT');
  const after = selectAll.all();
  console.log('\nTestes cadastrados:');
  for (const e of after) {
    console.log(`- ${e.id} | ${e.nome} | ${e.categoria}`);
  }
} catch (err) {
  db.exec('ROLLBACK');
  console.error('Erro ao restaurar testes:', err);
  process.exit(1);
} finally {
  db.close();
}

