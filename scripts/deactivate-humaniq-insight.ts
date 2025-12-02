
import Database from 'better-sqlite3';

const db = new Database('humaniq-dev.db');

console.log('Deactivating HumaniQ Insight test...');

const info = db.prepare("UPDATE testes SET ativo = 0 WHERE id = 'humaniq-insight'").run();

console.log('Changes:', info.changes);

const row = db.prepare("SELECT * FROM testes WHERE id = 'humaniq-insight'").get();
console.log('Updated row:', row);
