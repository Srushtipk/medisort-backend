import 'dotenv/config';
import express from 'express';

import cors from 'cors';
import mongoose from 'mongoose';

import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/error.js';

import authRoutes from './routes/auth.routes.js';
import hfRoutes from './routes/huggingFace.routes.js'; // This is now a generic file for your scan route
import ragRoutes from './routes/rag.routes.js';
import scanHistoryRoutes from './routes/scanHistory.routes.js';
import remindersRoutes from './routes/reminders.routes.js';
import pharmacyRoutes from './routes/pharmacy.routes.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

await connectDB();

app.get('/health', (req, res) => res.json({ ok: true }));

// Your routes
app.use('/auth', authRoutes);
app.use('/scan', hfRoutes); // This is now a generic route for your scan functionality
app.use('/rag', ragRoutes);
app.use('/history', scanHistoryRoutes);
app.use('/reminders', remindersRoutes);
app.use('/pharmacy', pharmacyRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ API running on http://localhost:${PORT}`));
