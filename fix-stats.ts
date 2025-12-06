
import fs from 'fs';
import path from 'path';

const filePath = path.join('src', 'pages', 'empresa', 'EmpresaColaboradorResultados.tsx');

try {
    let content = fs.readFileSync(filePath, 'utf8');

    const targetBlock = `  const estatisticas = {
    total: resultados.length,
    concluidos: resultados.filter(r => r.status === 'concluido').length,
    emAndamento: resultados.filter(r => r.status === 'em_andamento').length,
    mediaPercentual: resultados.length > 0 
      ? Math.round(resultados.reduce((acc, r) => acc + r.percentual, 0) / resultados.length)
      : 0
  };`;

    const replacementBlock = `  // Filtro base para remover testes ocultos (Insight e Clima)
  const resultadosVisiveis = resultados.filter(resultado => {
    const testeName = (resultado.nomeTest || '').toLowerCase();
    const category = (resultado.categoria || '').toLowerCase();
    
    // Filtro para remover permanentemente o teste "HumaniQ Insight" e "Clima" dos resultados
    if (testeName.includes('insight') || category.includes('clima-bem-estar')) {
      return false;
    }
    return true;
  });

  const estatisticas = {
    total: resultadosVisiveis.length,
    concluidos: resultadosVisiveis.filter(r => r.status === 'concluido').length,
    emAndamento: resultadosVisiveis.filter(r => r.status === 'em_andamento').length,
    mediaPercentual: resultadosVisiveis.length > 0 
      ? Math.round(resultadosVisiveis.reduce((acc, r) => acc + r.percentual, 0) / resultadosVisiveis.length)
      : 0
  };`;

    // Normalize line endings for matching
    const normalizedContent = content.replace(/\r\n/g, '\n');
    const normalizedTarget = targetBlock.replace(/\r\n/g, '\n');

    if (normalizedContent.includes(normalizedTarget)) {
        const newContent = normalizedContent.replace(normalizedTarget, replacementBlock);
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Successfully updated file.');
    } else {
        console.error('Target block not found in file.');
        // Debug: print context around where it should be
        const index = normalizedContent.indexOf('const estatisticas = {');
        if (index !== -1) {
            console.log('Found start of block. Context:');
            console.log(normalizedContent.substring(index, index + 200));
        }
    }

} catch (error) {
    console.error('Error updating file:', error);
}
