
import { db } from '../db-config';
import { colaboradores } from '../../shared/schema';
import { eq, like } from 'drizzle-orm';

async function main() {
  console.log('🔍 Verificando existência do usuário Teste@humaniqai.com.br...');

  try {
    // 1. Busca exata
    const exactMatch = await db.select().from(colaboradores).where(eq(colaboradores.email, 'Teste@humaniqai.com.br'));
    console.log(`Resultados busca exata: ${exactMatch.length}`);
    if (exactMatch.length) console.log(exactMatch[0]);

    // 2. Busca case-insensitive manual (trazendo tudo e filtrando)
    const all = await db.select().from(colaboradores);
    const fuzzy = all.filter(c => c.email.toLowerCase().includes('teste') || c.email.toLowerCase().includes('humaniq'));
    
    console.log(`Resultados busca aproximada (contém "teste" ou "humaniq"): ${fuzzy.length}`);
    fuzzy.forEach(c => console.log(` - ID: ${c.id}, Email: ${c.email}, EmpresaID: ${c.empresaId}`));

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

main();
