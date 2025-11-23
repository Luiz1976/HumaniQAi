const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5000',
  credentials: true
}));
app.use(express.json());

// Dados temporários em memória (para teste)
const users = [
  {
    id: '1',
    email: 'admin@humaniq.com',
    nome: 'Administrador',
    senha: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'admin'
  },
  {
    id: '2',
    email: 'empresa@test.com',
    nome: 'Empresa Teste',
    senha: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'empresa'
  }
];

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'HumaniQ Backend está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Login indisponível neste servidor simples (use backend real)
app.post('/api/auth/login', async (req, res) => {
  return res.status(501).json({
    success: false,
    message: 'Login indisponível neste servidor. Use o backend real em server/index.ts (porta 3001)'
  });
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }
  
  jwt.verify(token, 'seu_secret_super_seguro_aqui_desenvolvimento_local', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Endpoint protegido de teste
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Listar testes indisponível sem banco de dados
app.get('/api/testes', authenticateToken, (req, res) => {
  return res.status(503).json({
    success: false,
    message: 'Serviço indisponível sem conexão real de banco de dados'
  });
});

// Catch all
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint não encontrado',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Erro não tratado:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 HumaniQ Backend rodando em http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log(`✅ CORS configurado para: http://localhost:5000`);
  console.log(`📊 Usuários de teste disponíveis:`);
  console.log(`   - admin@humaniq.com / password`);
  console.log(`   - empresa@test.com / password`);
});