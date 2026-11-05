import express from 'express';
import { getResources, getResourceById } from '../controllers/resourceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protect safety resource endpoints with JWT
router.use(protect);

router.get('/', getResources);
router.get('/:id', getResourceById);

export default router;

