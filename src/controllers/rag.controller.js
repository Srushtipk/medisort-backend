// src/controllers/rag.controller.js

import { askRag } from '../services/rag.service.js';

export const ragAsk = async (req, res, next) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ message: 'A question is required.' });
    }
    const result = await askRag(question);
    res.json(result);
  } catch (e) {
    next(e);
  }
};