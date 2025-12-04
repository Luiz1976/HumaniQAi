
import { db } from '../db-config';
import { colaboradores, testes } from '../../shared/schema';

async function main() {
  console.log('👥 Colaboradores:');
  const users = await db.select().from(colaboradores);
  users.forEach(u => console.log(` - Nome: "${u.nome}", Email: "${u.email}", ID: ${u.id}`));

  console.log('\n📚 Testes:');
  const tests = await db.select().from(testes);
  tests.forEach(t => console.log(` - Nome: "${t.nome}", ID: ${t.id}, Categoria: "${t.categoria}"`));
}

main();
