// Carregar variáveis de ambiente PRIMEIRO
import dotenv from 'dotenv';
dotenv.config();

// Tratamento de erros não capturados (deve vir antes de outros imports que podem falhar)
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', { reason, promise });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Não encerrar o processo automaticamente; manter serviço vivo para health/port binding se possível
});

console.log('🚀 Iniciando servidor HumaniQ AI...');

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

console.log('📦 Carregando configurações de banco de dados...');
import { db as getDb, dbType as getDbType, runMigrations } from './db-config';
const db = getDb;
const dbType = getDbType;

console.log('📦 Carregando logger...');
import logger, { logRequest } from './utils/logger';

console.log('📦 Carregando rotas...');

async function loadRoutesAndStart() {
  try {
    console.log('🔄 Importando authRoutes...');
    const authRoutes = (await import('./routes/auth')).default;
    app.use('/api/auth', authRoutes);
    console.log('✅ authRoutes importado');

    console.log('🔄 Importando testesRoutes...');
    const testesRoutes = (await import('./routes/testes')).default;
    app.use('/api/testes', cacheMiddleware(30), testesRoutes);
    console.log('✅ testesRoutes importado');

    console.log('🔄 Importando empresasRoutes...');
    const empresasRoutes = (await import('./routes/empresas')).default;
    app.use('/api/empresas', empresasRoutes);
    console.log('✅ empresasRoutes importado');

    console.log('🔄 Importando colaboradoresRoutes...');
    const colaboradoresRoutes = (await import('./routes/colaboradores')).default;
    app.use('/api/colaboradores', colaboradoresRoutes);
    console.log('✅ colaboradoresRoutes importado');

    console.log('🔄 Importando convitesRoutes...');
    const convitesRoutes = (await import('./routes/convites')).default;
    app.use('/api/convites', cacheMiddleware(15), convitesRoutes);
    console.log('✅ convitesRoutes importado');

    console.log('🔄 Importando adminRoutes...');
    const adminRoutes = (await import('./routes/admin')).default;
    app.use('/api/admin', adminRoutes);
    console.log('✅ adminRoutes importado');

    console.log('🔄 Importando adminIndicadoresRoutes...');
    const adminIndicadoresRoutes = (await import('./routes/admin-indicadores')).default;
    app.use('/api/admin', adminIndicadoresRoutes);
    console.log('✅ adminIndicadoresRoutes importado');

    console.log('🔄 Importando chatbotRoutes...');
    const chatbotRoutes = (await import('./routes/chatbot')).default;
    app.use('/api/chatbot', cacheMiddleware(10), chatbotRoutes);
    console.log('✅ chatbotRoutes importado');

    console.log('🔄 Importando stripeRoutes...');
    const stripeRoutes = (await import('./routes/stripe')).default;
    app.use('/api/stripe', stripeRoutes);
    console.log('✅ stripeRoutes importado');

    console.log('🔄 Importando testeDisponibilidadeRoutes...');
    const testeDisponibilidadeRoutes = (await import('./routes/teste-disponibilidade')).default;
    app.use('/api/teste-disponibilidade', testeDisponibilidadeRoutes);
    console.log('✅ testeDisponibilidadeRoutes importado');

    console.log('🔄 Importando cursoDisponibilidadeRoutes...');
    const cursoDisponibilidadeRoutes = (await import('./routes/curso-disponibilidade')).default;
    app.use('/api/curso-disponibilidade', cursoDisponibilidadeRoutes);
    console.log('✅ cursoDisponibilidadeRoutes importado');

    console.log('🔄 Importando cursosRoutes...');
    const cursosRoutes = (await import('./routes/cursos')).default;
    app.use('/api/cursos', cacheMiddleware(20), cursosRoutes);
    console.log('✅ cursosRoutes importado');

    console.log('🔄 Importando emailTestRoutes...');
    const emailTestRoutes = (await import('./routes/email-test')).default;
    app.use('/api/email-test', emailTestRoutes);
    console.log('✅ emailTestRoutes importado');

    console.log('🔄 Importando analyticsRoutes...');
    const analyticsRoutes = (await import('./routes/analytics')).default;
    app.use('/api/analytics', analyticsRoutes);
    console.log('✅ analyticsRoutes importado');

    console.log('🔄 Importando notificationsRoutes...');
    const notificationsRoutes = (await import('./routes/notifications')).default;
    app.use('/api/notifications', notificationsRoutes);
    console.log('✅ notificationsRoutes importado');

    console.log('🔄 Importando exportRoutes...');
    const exportRoutes = (await import('./routes/export')).default;
    app.use('/api/export', exportRoutes);
    console.log('✅ exportRoutes importado');

    // Endpoint simples de auditoria para receber logs do frontend
    app.post('/api/audit/logs', (req, res) => {
      try {
        logger.info('AUDIT_LOG', { payload: req.body, ts: new Date().toISOString() });
      } catch (_) { }
      res.json({ success: true });
    });

    // Middleware para rotas não encontradas
    app.use((req, res) => {
      res.status(404).json({
        error: 'Endpoint não encontrado',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
      });
    });

    // Middleware de tratamento de erros
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Erro não tratado:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip
      });

      res.status(err.status || 500).json({
        error: NODE_ENV === 'production' ? 'Erro interno do servidor' : err.message,
        timestamp: new Date().toISOString(),
        ...(NODE_ENV !== 'production' && { stack: err.stack })
      });
    });

    console.log('✅ Todas as rotas carregadas.');

    // Continuação do bootstrap
    bootstrap();

  } catch (error) {
    console.error('❌ ERRO FATAL AO CARREGAR ROTAS:', error);
    process.exit(1);
  }
}

// ... (rest of imports that are safe)
import { scheduleBackupFromEnv } from './utils/backup';
import { cacheMiddleware } from './utils/cache';
import requireApiKey from './middleware/apiKey';
import postgres from 'postgres';

const app = express();
// ... middlewares ...
// Desabilitar ETag para evitar 304 em desenvolvimento (garante dados atualizados)
app.set('etag', false);

// Configuração de PORTA robusta para Render
const PORT = Number(process.env.PORT || 10000);
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_DEV = NODE_ENV === 'development';

console.log(`⚙️ Configuração: PORT=${PORT}, NODE_ENV=${NODE_ENV}`);

app.set('trust proxy', 1);

// Configurar rate limiting
const limiter = rateLimit({
  windowMs: IS_DEV ? 60 * 1000 : 15 * 60 * 1000,
  max: IS_DEV ? 1000 : 100,
  message: 'Muitas tentativas. Tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => IS_DEV && req.method === 'GET',
});

// Rate limiting específico para ERP (parametrizado por ambiente)
const ERP_RATE_LIMIT_WINDOW_MS = process.env.ERP_RATE_LIMIT_WINDOW_MS
  ? Number(process.env.ERP_RATE_LIMIT_WINDOW_MS)
  : 60_000; // 1 minuto padrão
const ERP_RATE_LIMIT_MAX = process.env.ERP_RATE_LIMIT_MAX
  ? Number(process.env.ERP_RATE_LIMIT_MAX)
  : 60; // 60 req/min por IP
const erpLimiter = rateLimit({
  windowMs: ERP_RATE_LIMIT_WINDOW_MS,
  max: ERP_RATE_LIMIT_MAX,
  message: 'Limite de requisições ao ERP excedido. Tente novamente em breve.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => IS_DEV, // Skip rate limit in dev
});

// Middleware de segurança
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:", "wss:"], // Added wss: for potential websocket/SSE
    },
  },
}));

// Configurar CORS
const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    const extraAllowed = (process.env.CORS_ALLOWED_ORIGINS || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const allowedOrigins = [
      'http://localhost:5000',
      'http://localhost:3000',
      'https://www.humaniqai.com.br',
      'https://humaniqai.com.br',
      'https://h2-8xej.onrender.com',
      process.env.FRONTEND_URL,
      process.env.CORS_ORIGIN,
      ...extraAllowed,
    ].filter(Boolean);

    // Permitir requests sem origin (mobile apps, server-to-server)
    if (!origin) return callback(null, true);

    // Permitir domínios de preview e produção do Vercel (*.vercel.app)
    try {
      const hostname = new URL(origin).hostname;
      if (hostname.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      // Permitir domínios onrender.com
      if (hostname.endsWith('.onrender.com')) {
        return callback(null, true);
      }
    } catch (_) { }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS bloqueado para origem: ${origin}`);
      callback(new Error('Não permitido pelo CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.use(limiter);

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use(logRequest);

// Health check endpoint (simples, sem dependências)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    port: PORT,
    version: '1.0.0',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    port: PORT,
    version: '1.0.0'
  });
});

app.get('/api/db/ping', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
      const client = postgres(process.env.DATABASE_URL, { idle_timeout: 5, connect_timeout: 5, max: 1 });
      await client`select 1`;
      await client.end();
      return res.json({ connected: true, type: 'postgres' });
    }
    return res.json({ connected: true, type: 'sqlite' });
  } catch (err: any) {
    logger.error('Erro no ping do banco:', err);
    return res.status(500).json({ connected: false, error: err.message });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'HumaniQ AI Backend API',
    version: '1.0.0',
    environment: NODE_ENV,
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      testes: '/api/testes',
    }
  });
});

let server: any;

async function bootstrap() {
  console.log('🔄 Iniciando bootstrap...');
  try {
    console.log('🔄 Executando migrações...');
    await runMigrations();
    console.log('✅ Migrações concluídas.');

    // Sincronizar definições de testes (garantir nomes corretos em produção)
    const { syncTestDefinitions } = await import('./utils/sync-tests');
    await syncTestDefinitions();
  } catch (err) {
    console.error('❌ Falha ao executar migrações no startup:', err);
    // Não falhar o startup por causa de migrações, para permitir debug
  }

  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 HumaniQ Backend iniciado com sucesso!`);
    console.log(`📍 Servidor rodando em: http://0.0.0.0:${PORT}`);
    console.log(`📊 Ambiente: ${NODE_ENV}`);

    try {
      scheduleBackupFromEnv();
      console.log('🗂️ Backup agendado conforme configuração de ambiente.');
    } catch (backupErr) {
      console.error('Erro ao agendar backups:', backupErr);
    }
  });
}

// Chamar a função de carregamento e inicialização
loadRoutesAndStart().catch(err => {
  console.error('❌ Erro fatal no carregamento:', err);
});

// bootstrap é chamado dentro de loadRoutesAndStart
// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido. Encerrando servidor graciosamente...');
  server?.close(() => {
    console.log('Servidor encerrado.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT recebido. Encerrando servidor graciosamente...');
  server?.close(() => {
    console.log('Servidor encerrado.');
    process.exit(0);
  });
});

process.on('beforeExit', (code) => {
  console.error('⚠️ beforeExit', code);
});

process.on('exit', (code) => {
  console.error('⚠️ exit', code);
});

export default app;
