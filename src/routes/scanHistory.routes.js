import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { getScanHistory } from '../controllers/scanHistory.controller.js.js';

const router = Router();
router.get('/', protect, getScanHistory);

export default router;