import { Router } from 'express';
import { identify } from '../controllers/contactController';
import { validateIdentifyInput } from '../middleware/validators';

const router = Router();

// Contact identification endpoint
router.post('/identify', validateIdentifyInput, identify);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default router;