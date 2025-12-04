
import { db, dbType } from '../db-config';
import { testeDisponibilidade, testes, resultados, colaboradores } from '../../shared/schema';
import { eq, and, or, desc, sql } from 'drizzle-orm';

async function main() {
  const email = 'Carlos@gmail.com';
  console.log(`🔄 Simulando API de disponibilidade para: ${email}`);

  // 1. Obter colaborador
  const colaborador = await db.query.colaboradores.findFirst({
    where: eq(colaboradores.email, email)
  });

  if (!colaborador) {
    console.error('❌ Colaborador não encontrado');
    return;
  }
  
  const colaboradorId = colaborador.id;
  const empresaId = colaborador.empresaId;

  console.log('👤 Colaborador:', { id: colaboradorId, empresaId });

  // 2. Buscar testes ativos
  const isSqlite = (dbType || '').toLowerCase().includes('sqlite');
  const todosTestes = await db
    .select()
    .from(testes)
    .where(eq(testes.ativo, isSqlite ? 1 : true));

  console.log('📚 Testes ativos:', todosTestes.length);

  // 3. Executar a mesma lógica da rota
  const testesComDisponibilidade = await Promise.all(
    todosTestes.map(async (teste) => {
      // Lógica copiada da rota
      let disponibilidade = null;
      try {
        const [disp] = await db
          .select()
          .from(testeDisponibilidade)
          .where(
            and(
              eq(testeDisponibilidade.colaboradorId, colaboradorId),
              eq(testeDisponibilidade.testeId, teste.id)
            )
          )
          .limit(1);
        disponibilidade = disp || null;
      } catch (e) { console.error(e); }

      // Verificar resultado
      const [resultado] = await db
        .select()
        .from(resultados)
        .where(
          and(
            eq(resultados.testeId, teste.id),
            or(
              eq(resultados.colaboradorId, colaboradorId),
              eq(resultados.usuarioId, colaboradorId)
            ),
            eq(resultados.status, 'concluido')
          )
        )
        .orderBy(desc(resultados.dataRealizacao))
        .limit(1);

      let disponivel = false;
      let motivo: string | null = 'bloqueado_empresa';
      let proximaDisponibilidade: Date | null = null;

      if (disponibilidade) {
        disponivel = disponibilidade.disponivel;

        if (!disponivel && disponibilidade.periodicidadeDias && disponibilidade.proximaDisponibilidade) {
            // Logica de periodicidade (omitida pois sabemos que é null)
        } else if (!disponivel) {
          if (resultado) {
            motivo = 'teste_concluido';
          } else {
            motivo = 'bloqueado_empresa';
          }
        }
      } else if (resultado) {
        disponivel = false;
        motivo = 'teste_concluido';
      } else {
        disponivel = true;
        motivo = null;
      }

      return {
        id: teste.id,
        nome: teste.nome,
        disponivel,
        motivo,
        resultadoId: resultado?.id
      };
    })
  );

  console.log('\n📋 Resultado da Simulação:');
  const insightTest = testesComDisponibilidade.find(t => t.nome.includes('Insight'));
  console.log('🎯 HumaniQ Insight:', insightTest);
  
  // Verificar filtro do frontend
  if (insightTest) {
      const deveSerExcluido = insightTest.motivo === 'teste_concluido' && !insightTest.disponivel;
      console.log(`\n🧪 Teste de Filtro Frontend:`);
      console.log(`   - motivo === 'teste_concluido': ${insightTest.motivo === 'teste_concluido'}`);
      console.log(`   - !disponivel: ${!insightTest.disponivel}`);
      console.log(`   - Resultado Final (deve ser excluído?): ${deveSerExcluido}`);
  }
}

main();
