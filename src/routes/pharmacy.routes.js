import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { nearby } from '../controllers/pharmacy.controller.js';

const router = Router();
router.get('/nearby', protect, nearby);

export default router;