import { Router } from 'express';
import express from 'express';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';
import {
  initialize,
  verify,
  webhook,
  history,
  status,
  refund,
} from '../controllers/paymentController.js';

const router = Router();

// Webhook needs the raw body for signature checking in some setups; JSON
// body works fine here since we compare a header value, not a body HMAC.
router.post('/webhook', express.json(), webhook);

router.post('/initialize', requireAuth, initialize);
router.get('/verify/:transactionId', requireAuth, verify);
router.get('/history', requireAuth, history);
router.get('/status/:tx_ref', requireAuth, status);
router.post('/refund/:transactionId', requireAuth, requireRole('admin', 'super_admin'), refund);

export default router;
