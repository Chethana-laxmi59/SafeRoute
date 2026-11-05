import express from 'express';
import {
  triggerSOS,
  getSOSHistory,
  getActiveSOSEvent,
  getSOSEventById,
  resolveSOSEvent,
  cancelSOSEvent,
} from '../controllers/sosController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply JWT authentication protection to all SOS routes
router.use(protect);

router.post('/', triggerSOS);
router.get('/history', getSOSHistory);
router.get('/active', getActiveSOSEvent);
router.get('/:id', getSOSEventById);
router.patch('/:id/resolve', resolveSOSEvent);
router.patch('/:id/cancel', cancelSOSEvent);

export default router;

