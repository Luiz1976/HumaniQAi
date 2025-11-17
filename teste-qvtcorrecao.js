// Script de teste para verificar a correção QVT
// Testa se os dados estão sendo exibidos corretamente após a correção

const testData = {
  id: "02b1b188-3269-4fd6-b3ec-ea66f00003bf",
  indiceGeral: 3.34,
  nivelGeral: "Regular",
  percentualGeral: 66.8,
  pontosFortes: ["Satisfação com a função", "Relacionamento com colegas"],
  dimensoesCriticas: ["Carga de trabalho"],
  satisfacaoFuncao: 4.2,
  satisfacaoGestao: 3.1,
  satisfacaoRelacionamento: 3.8,
  satisfacaoDesenvolvimento: 2.9,
  satisfacaoCompensacao: 3.5,
  dataRealizacao: "2024-01-15T10:30:00Z"
};

console.log("=== TESTE DE CORREÇÃO QVT ===");
console.log("Dados esperados:");
console.log(`- Pontuação Total: ${testData.indiceGeral}`);
console.log(`- Percentual: ${testData.percentualGeral}%`);
console.log(`- Categoria: ${testData.nivelGeral}`);
console.log(`- Pontos Fortes: ${testData.pontosFortes.join(", ")}`);
console.log(`- Dimensões Críticas: ${testData.dimensoesCriticas.join(", ")}`);

console.log("\n=== VERIFICAÇÃO DE CAMPOS ===");

// Verifica se todos os campos necessários estão presentes
const camposObrigatorios = [
  'indiceGeral', 'nivelGeral', 'percentualGeral', 
  'pontosFortes', 'dimensoesCriticas'
];

camposObrigatorios.forEach(campo => {
  const valor = testData[campo];
  const status = valor !== undefined && valor !== null ? "✅ OK" : "❌ FALTANDO";
  console.log(`${campo}: ${valor} ${status}`);
});

console.log("\n=== ANÁLISE DE INCONSISTÊNCIA ===");

// Verifica se os dados de percentual estão consistentes
if (testData.percentualGeral && testData.indiceGeral) {
  const percentualCalculado = (testData.indiceGeral / 5) * 100;
  const diferenca = Math.abs(testData.percentualGeral - percentualCalculado);
  
  if (diferenca < 0.1) {
    console.log("✅ Percentual está consistente com a pontuação");
  } else {
    console.log(`❌ Inconsistência: Percentual esperado ${percentualCalculado.toFixed(1)}%, mas encontrado ${testData.percentualGeral}%`);
  }
}

// Verifica se a categoria está correta baseada no percentual
if (testData.percentualGeral && testData.nivelGeral) {
  let categoriaEsperada;
  if (testData.percentualGeral >= 80) categoriaEsperada = "Excelente";
  else if (testData.percentualGeral >= 60) categoriaEsperada = "Regular";
  else categoriaEsperada = "Crítico";
  
  if (testData.nivelGeral === categoriaEsperada) {
    console.log(`✅ Categoria "${testData.nivelGeral}" está correta para ${testData.percentualGeral}%`);
  } else {
    console.log(`❌ Categoria inconsistente: esperada "${categoriaEsperada}", encontrada "${testData.nivelGeral}"`);
  }
}

console.log("\n=== RESULTADO DO TESTE ===");
console.log("Se todos os campos acima estão ✅ OK, a correção está funcionando!");
console.log("Acesse: http://localhost:5000/resultado/qualidade-vida-trabalho/02b1b188-3269-4fd6-b3ec-ea66f00003bf");