// Servidor simples mínimo sem dados/rotas mock
// Este servidor existe apenas como placeholder. Use o backend real em server/index.ts (porta 3001).

const express = require('express');
const cors = require('cors');
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const schema = require('./shared/schema');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

let db = null;
let client = null;

try {
  if (process.env.DATABASE_URL) {
    client = postgres(process.env.DATABASE_URL, {
      max: 20,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    db = drizzle(client, { schema });
    console.log('✅ Conexão com PostgreSQL estabelecida');
  } else {
    console.warn('⚠️ DATABASE_URL não configurada');
  }
} catch (error) {
  console.error('❌ Erro ao conectar ao PostgreSQL:', error.message);
}

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5000',
  credentials: true,
}));
app.use(express.json());

// Health checks
app.get('/health', (req, res) => {
  const healthy = !!db;
  res.status(200).json({
    status: healthy ? 'ok' : 'degraded',
    database: healthy ? 'connected' : 'unavailable',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  const healthy = !!db;
  res.status(200).json({
    status: healthy ? 'ok' : 'degraded',
    database: healthy ? 'connected' : 'unavailable',
    timestamp: new Date().toISOString(),
  });
});

// Fallback global para qualquer rota de API não suportada neste servidor
app.all('/api/*', (req, res) => {
  if (!db) {
    return res.status(503).json({
      success: false,
      message: 'Sistema indisponível',
      reason: 'Sem conexão com banco de dados (DATABASE_URL)',
    });
  }
  return res.status(501).json({
    success: false,
    message: 'Endpoint indisponível neste servidor. Use o backend real em http://localhost:3001',
  });
});

// 404 padrão
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ success: false, message: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor simples em execução na porta ${PORT}`);
  console.log('ℹ️  Este servidor não fornece endpoints de negócio. Use server/index.ts como backend real.');
});