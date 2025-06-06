import { Router, Request, Response } from 'express';
import { identify } from '../controllers/contactController';
import { validateIdentifyInput } from '../middleware/validators';

const router = Router();

// Contact identification endpoint
router.post('/identify', validateIdentifyInput, identify);

// Health check endpoint to verify server status
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

export default router;