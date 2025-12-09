import express from 'express';
import { db } from '../db-config';
import { visitas_landing } from '../../shared/schema';
import logger from '../utils/logger';

const router = express.Router();

// Public route to track landing page visits
router.post('/visit', async (req, res) => {
    try {
        const userAgent = req.headers['user-agent'] || 'unknown';
        const origem = req.body.origem || 'direct';

        await db.insert(visitas_landing).values({
            userAgent,
            origem,
        });

        res.status(200).json({ success: true });
    } catch (error) {
        logger.error('Erro ao registrar visita:', error);
        // Fail silently to the client to not disrupt UX
        res.status(200).json({ success: false });
    }
});

export default router;
