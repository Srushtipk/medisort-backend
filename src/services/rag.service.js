// src/services/rag.service.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, '..', 'data', 'knowledge.json');
const corpus = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

export const askRag = async (question) => {
    const lowerQuestion = question.toLowerCase();
    const relevantDocs = corpus.filter(doc => 
        doc.tags.some(tag => lowerQuestion.includes(tag))
    );

    if (relevantDocs.length === 0) {
        return {
            answer: "I couldn't find a suggestion for that. Please consult a professional.",
            sources: []
        };
    }

    const answer = relevantDocs.map(doc => doc.text).join('\n\n');

    return {
        answer: `${answer}\n\nAlways follow medical advice for your specific condition. If unsure, consult a pharmacist/doctor.`,
        sources: relevantDocs.map(doc => doc.text)
    };
};