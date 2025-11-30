const Database = require('better-sqlite3');
const db = new Database('./humaniq-dev.db');

console.log('Checking colaboradores table...');
const rows = db.prepare('SELECT id, nome, email, cargo, departamento FROM colaboradores LIMIT 10').all();
console.log(JSON.stringify(rows, null, 2));

db.close();
