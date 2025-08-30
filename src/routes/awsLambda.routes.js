import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { getSuggestionLambda } from '../controllers/awsLambda.controller.js';

const router = Router();
router.post('/ask-lambda', protect, getSuggestionLambda);

export default router;