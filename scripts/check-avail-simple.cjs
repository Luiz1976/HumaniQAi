
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'humaniq-dev.db');
console.log('Opening DB at:', dbPath);

try {
    const db = new Database(dbPath, { readonly: true });

    // Check curso_disponibilidade
    const rows = db.prepare('SELECT * FROM curso_disponibilidade').all();
    console.log('Curso Disponibilidade Rows:', rows.length);
    console.log(JSON.stringify(rows, null, 2));

    // Check curso table? No, they are static.
    // Check colaboradores
    const colabs = db.prepare('SELECT id, nome, email FROM colaboradores').all();
    console.log('Colaboradores:', colabs.length);
    // console.log(colabs);

} catch (err) {
    console.error('Error:', err);
}
