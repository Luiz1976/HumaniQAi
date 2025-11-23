import { Router } from 'express';
import logger from '../utils/logger';

const router = Router();

// Conexões SSE ativas
const clients: Set<{ res: any }> = new Set();

router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const client = { res };
  clients.add(client);
  logger.info(`Novo cliente SSE conectado. Total: ${clients.size}`);

  req.on('close', () => {
    clients.delete(client);
    logger.info(`Cliente SSE desconectado. Total: ${clients.size}`);
  });
});

// Endpoint interno para enviar notificações
router.post('/emit', (req, res) => {
  const { type, payload } = req.body || {};
  const msg = `event: ${type || 'message'}\ndata: ${JSON.stringify(payload || {})}\n\n`;
  for (const c of clients) c.res.write(msg);
  res.json({ success: true, delivered: clients.size });
});

export default router;