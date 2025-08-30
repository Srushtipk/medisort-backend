import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { createReminder, getReminders, deleteReminder } from '../controllers/reminders.controller.js';

const router = Router();
router.post('/', protect, createReminder);
router.get('/', protect, getReminders);
router.delete('/:id', protect, deleteReminder);

export default router;