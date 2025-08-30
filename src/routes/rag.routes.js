// src/routes/rag.routes.js

import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { ragAsk } from '../controllers/rag.controller.js';

const router = Router();
router.post('/ask', protect, ragAsk);

export default router;