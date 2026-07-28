import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { signup, me } from '../controllers/authController.js';

const router = Router();
router.post('/signup', signup);
router.get('/me', requireAuth, me);

export default router;
