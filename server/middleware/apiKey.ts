import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export default function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const configuredKey = process.env.API_INTEGRATION_KEY;
  const providedKey = req.header('x-api-key');

  if (!configuredKey) {
    logger.warn('API_INTEGRATION_KEY não configurada. Bloqueando acesso de integração.');
    return res.status(503).json({ error: 'Integração indisponível' });
  }

  if (!providedKey || providedKey !== configuredKey) {
    return res.status(401).json({ error: 'API key inválida ou ausente' });
  }

  next();
}