import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { handleSpeechToText, handleTextToSpeech } from '../controllers/watson.controller.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post('/stt', protect, upload.single('audio'), handleSpeechToText);
router.post('/tts', protect, handleTextToSpeech);

export default router;