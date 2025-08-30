import { speechToText, textToSpeech } from '../services/watson.service.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

export const handleSpeechToText = async (req, res, next) => {
  try {
    const audioBuffer = req.file.buffer;
    const text = await speechToText(audioBuffer);
    res.json({ text });
  } catch (e) {
    next(e);
  }
};

export const handleTextToSpeech = async (req, res, next) => {
  try {
    const { text } = req.body;
    const audioStream = await textToSpeech(text);
    res.setHeader('Content-Type', 'audio/wav');
    audioStream.pipe(res);
  } catch (e) {
    next(e);
  }
};