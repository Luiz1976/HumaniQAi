
import { db } from '../db-config';
import { colaboradores, resultados, testes, testeDisponibilidade } from '../../shared/schema';
import { eq, desc, and, or } from 'drizzle-orm';

async function main() {
  const email = 'Carlos@gmail.com'; // Trocando para o usuário provável
  const testeId = '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5';

  console.log(`🔍 Investigando usuário provável: ${email}`);

  try {
    // 0. Listar todos os colaboradores para confirmar inexistência do "Teste"
    const allColabs = await db.select({ email: colaboradores.email }).from(colaboradores);
    console.log('📋 Lista de todos os colaboradores no banco:', allColabs.map(c => c.email));

    // 1. Buscar usuário Carlos
    const colaborador = await db.query.colaboradores.findFirst({
        where: eq(colaboradores.email, email)
    });

    if (!colaborador) {
      console.error('❌ Carlos NÃO encontrado!');
      return;
    }

    console.log('✅ Colaborador encontrado:', {
        id: colaborador.id,
        email: colaborador.email
    });

    // 2. Buscar Disponibilidade Específica
    console.log(`\n🔍 Buscando Teste Disponibilidade para Colaborador ID: ${colaborador.id} e Teste ID: ${testeId}`);
    const disp = await db.select()
        .from(testeDisponibilidade)
        .where(and(
            eq(testeDisponibilidade.colaboradorId, colaborador.id),
            eq(testeDisponibilidade.testeId, testeId)
        ));
    
    if (disp.length > 0) {
        console.log('⚠️ Registro de disponibilidade encontrado:', disp[0]);
    } else {
        console.log('ℹ️ NENHUM registro de disponibilidade encontrado.');
    }

    // 3. Buscar Resultados
    console.log(`\n🔍 Buscando Resultados para Colaborador ID: ${colaborador.id} e Teste ID: ${testeId}`);
    const results = await db.select()
        .from(resultados)
        .where(and(
            eq(resultados.testeId, testeId),
            or(
                eq(resultados.colaboradorId, colaborador.id),
                eq(resultados.usuarioId, colaborador.id)
            )
        ))
        .orderBy(desc(resultados.dataRealizacao));

    console.log(`📊 Total de resultados: ${results.length}`);
    results.forEach(r => {
        console.log(`   - ID: ${r.id}, Status: ${r.status}, Data: ${r.dataRealizacao}, ColaboradorId: ${r.colaboradorId}`);
    });

  } catch (error) {
    console.error('Erro na investigação:', error);
  }
}

main();
