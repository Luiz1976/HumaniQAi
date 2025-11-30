const Database = require('better-sqlite3');
const db = new Database('./humaniq-dev.db');

console.log('Updating colaboradores with cargo and departamento...');

// Update the existing employee with cargo and departamento
const updateStmt = db.prepare(`
  UPDATE colaboradores 
  SET cargo = ?, departamento = ? 
  WHERE email = ?
`);

updateStmt.run('Analista de Sistemas', 'TI', 'Carlos@gmail.com');

console.log('Updated Carlos with cargo and departamento');

// Verify the update
const rows = db.prepare('SELECT id, nome, email, cargo, departamento FROM colaboradores').all();
console.log('\nCurrent colaboradores:');
console.log(JSON.stringify(rows, null, 2));

db.close();
console.log('\nDatabase updated successfully!');
