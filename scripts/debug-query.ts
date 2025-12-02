
import Database from 'better-sqlite3';

const db = new Database('humaniq-dev.db');

const rows = db.prepare("SELECT id, nome, ativo FROM testes").all();
console.log(JSON.stringify(rows, null, 2));
