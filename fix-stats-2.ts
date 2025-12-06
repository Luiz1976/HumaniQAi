
import fs from 'fs';
import path from 'path';

const filePath = path.join('src', 'pages', 'empresa', 'EmpresaColaboradorResultados.tsx');

try {
    let content = fs.readFileSync(filePath, 'utf8');

    // We want to replace "const resultadosFiltrados = resultados.filter" with "const resultadosFiltrados = resultadosVisiveis.filter"
    // But we also want to remove the inner filter logic since it's now in resultadosVisiveis

    const targetBlock = `  const resultadosFiltrados = resultados.filter(resultado => {
    const searchTerm = (filtroTeste || '').toLowerCase();
    const testeName = (resultado.nomeTest || '').toLowerCase();
    const category = (resultado.categoria || '').toLowerCase();

    // Filtro para remover permanentemente o teste "HumaniQ Insight" dos resultados
    if (testeName.includes('insight') || category.includes('clima-bem-estar')) {
      return false;
    }
    
    const matchesSearch = testeName.includes(searchTerm) || category.includes(searchTerm);
    const matchesStatus = filtroStatus === 'todos' || resultado.status === filtroStatus;
    
    return matchesSearch && matchesStatus;
  });`;

    const replacementBlock = `  const resultadosFiltrados = resultadosVisiveis.filter(resultado => {
    const searchTerm = (filtroTeste || '').toLowerCase();
    const testeName = (resultado.nomeTest || '').toLowerCase();
    const category = (resultado.categoria || '').toLowerCase();
    
    const matchesSearch = testeName.includes(searchTerm) || category.includes(searchTerm);
    const matchesStatus = filtroStatus === 'todos' || resultado.status === filtroStatus;
    
    return matchesSearch && matchesStatus;
  });`;

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
        const index = normalizedContent.indexOf('const resultadosFiltrados = resultados.filter');
        if (index !== -1) {
            console.log('Found start of block. Context:');
            console.log(normalizedContent.substring(index, index + 200));
        }
    }

} catch (error) {
    console.error('Error updating file:', error);
}
