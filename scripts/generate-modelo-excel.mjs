// Gera o arquivo public/modelo_convites_colaboradores.xlsx com 6 colunas na ordem correta
import * as XLSX from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const headers = ['Nome', 'Cargo', 'Setor', 'Idade', 'Sexo', 'Email'];
const exemplo = [{ Nome: '', Cargo: '', Setor: '', Idade: '', Sexo: '', Email: '' }];

const worksheet = XLSX.utils.json_to_sheet(exemplo, { header: headers });
// Ajusta largura das colunas
worksheet['!cols'] = [
  { wch: 25 }, // Nome
  { wch: 20 }, // Cargo
  { wch: 20 }, // Setor
  { wch: 8 },  // Idade
  { wch: 10 }, // Sexo
  { wch: 30 }, // Email
];

const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Convites');

const outPath = join(__dirname, '..', 'public', 'modelo_convites_colaboradores.xlsx');
XLSX.writeFile(workbook, outPath);

console.log('✅ Modelo Excel gerado em:', outPath);