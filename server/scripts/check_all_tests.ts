
import { db } from '../db-config';
import { testes } from '../../shared/schema';
import { eq } from 'drizzle-orm';

async function main() {
  console.log('🔍 Buscando todos os testes ativos...');
  const allTestes = await db.select().from(testes);
  
  console.log(`📊 Total de testes encontrados: ${allTestes.length}`);
  allTestes.forEach(t => {
    console.log(`   - ID: ${t.id}, Nome: "${t.nome}", Ativo: ${t.ativo}, Categoria: ${t.categoria}`);
  });
}

main();
