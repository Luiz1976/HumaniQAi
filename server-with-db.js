const { db, dbType, runMigrations } = require('./server/db-config');
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5000',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    database: dbType,
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// API Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    environment: process.env.NODE_ENV || 'development',
    database: dbType,
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Testar conexão com banco
app.get('/api/test-db', async (req, res) => {
  try {
    // Testar se conseguimos acessar o banco
    const result = await db.select().from('admins').limit(1);
    res.json({
      status: 'OK',
      message: 'Conexão com banco de dados funcionando',
      database: dbType,
      sampleData: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Erro ao conectar com banco de dados',
      error: error.message
    });
  }
});

// Iniciar servidor
async function startServer() {
  try {
    console.log('🔄 Iniciando servidor com banco de dados...');
    console.log(`📊 Tipo de banco: ${dbType}`);
    
    // Executar migrações
    await runMigrations();
    
    // Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor com banco de dados rodando em http://0.0.0.0:${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/health`);
      console.log(`🧪 Teste DB: http://localhost:${PORT}/api/test-db`);
      console.log(`✅ CORS configurado para: http://localhost:5000`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();