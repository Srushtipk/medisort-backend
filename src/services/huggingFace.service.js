// src/services/huggingFace.service.js
import { HfInference } from '@huggingface/inference';
import 'dotenv/config';

const hf = new HfInference(process.env.HUGGING_FACE_TOKEN);
const MODEL_NAME = 'google/vit-base-patch16-224'; // This is a general image classification model

export const analyzeImage = async (imageData) => {
    try {
        const response = await hf.imageClassification({
            data: Buffer.from(imageData, 'base64'),
            model: MODEL_NAME,
        });

        // Format the output for the frontend
        return {
            name: response[0].label,
            confidence: response[0].score,
            advice: "This is a demo advice from Hugging Face. Please consult a professional."
        };

    } catch (error) {
        console.error("Hugging Face API Error:", error.response?.data || error.message);
        return { 
            name: 'Unknown', 
            confidence: 0.0, 
            advice: 'Could not identify pill. Please try again or consult a doctor.' 
        };
    }
};