import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';

const DOCX_DIR = path.resolve('public', 'Testes');

const mapaArquivosParaSlug = {
  'HumaniQ - Clima.docx': 'clima-organizacional',
  'HumaniQ 360 – Clima Organizacional, Bem-Estar Psicológico e Justiça Corporativa.docx': 'clima-organizacional',
  'HumaniQ - KS.docx': 'ks',
  'HumaniQ EO.docx': 'eo',
  'HumaniQ Insight.docx': 'insight',
  'HumaniQ MGRP.docx': 'mgr',
  'HumaniQ PAS.docx': 'pas',
  'HumaniQ QVT.docx': 'qvt',
  'HumaniQ RPO.docx': 'rpo',
};

const likert5 = ['Discordo totalmente', 'Discordo', 'Neutro', 'Concordo', 'Concordo totalmente'];

function normalizarLinhas(texto) {
  return texto
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .filter((l) => !/^\s*(sumário|introdução|objetivo|referências?)\b/i.test(l))
    .filter((l) => !/^\s*[A-Z][A-Z\s]{6,}$/.test(l))
    .filter((l) => !/^\s*Página\s+\d+/i.test(l));
}

function isProvavelPergunta(linha) {
  const minChars = 20;
  if (linha.length < minChars) return false;
  if (/^\d+\s*[\).-]\s*/.test(linha)) return true;
  if (/[\.?]$/.test(linha)) return true;
  return true;
}

async function extrairPerguntasDeDocx(arquivo) {
  const { value } = await mammoth.extractRawText({ path: arquivo });
  const linhas = normalizarLinhas(value);
  const perguntas = linhas.filter(isProvavelPergunta);
  return perguntas;
}

async function main() {
  const arquivos = fs.readdirSync(DOCX_DIR).filter((f) => f.toLowerCase().endsWith('.docx'));
  const resultado = {
    'clima-organizacional': [],
    ks: [],
    eo: [],
    insight: [],
    mgr: [],
    pas: [],
    qvt: [],
    rpo: [],
  };

  for (const arquivo of arquivos) {
    const slug = mapaArquivosParaSlug[arquivo];
    if (!slug) continue;
    const caminho = path.join(DOCX_DIR, arquivo);
    try {
      const perguntasTexto = await extrairPerguntasDeDocx(caminho);
      const perguntas = perguntasTexto.map((texto, idx) => ({
        id: String(idx + 1),
        texto,
        tipo: 'escala',
        opcoes: likert5,
      }));
      resultado[slug] = perguntas;
    } catch (err) {
      console.error(`Falha ao processar ${arquivo}:`, err);
    }
  }

  process.stdout.write(JSON.stringify(resultado, null, 2));
}

main().catch((e) => {
  console.error('Erro geral na extração:', e);
  process.exit(1);
});
