import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getQuota, consumeQuota } from '../controllers/quotaController.js';

const router = Router();
router.get('/', requireAuth, getQuota);
router.post('/consume', requireAuth, consumeQuota);

export default router;
