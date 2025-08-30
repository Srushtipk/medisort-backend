import express from 'express';
import { identifyPill } from '../controllers/huggingFace.controller.js';
import multer from 'multer';

const router = express.Router();
const upload = multer();

router.post('/', upload.single('image'), identifyPill);

export default router;
