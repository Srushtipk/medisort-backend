import { GOOGLE_API_KEY } from '../config/secrets.js';
import axios from 'axios';

// Asynchronously handles the pill identification request
export const identifyPill = async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            console.error('Error: No image file received.');
            return res.status(400).json({ message: 'No image file uploaded.' });
        }

        // Convert the image buffer to a base64 string
        const imageData = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype;

        // The prompt for the Gemini AI, asking it to identify the pill.
        const prompt = "Please identify the pill in this image based on its appearance (shape, color, imprint) and provide its name and a brief description of its common use. If you cannot identify it, state that the pill is not recognized. Respond only with the pill name and description.";

        const payload = {
            contents: [{
                role: "user",
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: mimeType, data: imageData } }
                ]
            }],
        };

        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GOOGLE_API_KEY}`;
        
        // Make the API call to Gemini
        const apiResponse = await axios.post(API_URL, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Check for specific errors in the API response
        if (apiResponse.data.error) {
            console.error('Gemini API Error:', apiResponse.data.error.message);
            return res.status(500).json({ message: `Gemini API Error: ${apiResponse.data.error.message}` });
        }

        const text = apiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Pill not recognized.";

        // Your code was returning a single string. Here we structure it as a JSON object.
        const recognitionResult = {
            name: text.split('\n')[0] || "Unknown Pill",
            description: text.split('\n').slice(1).join('\n') || "Description not available."
        };

        return res.json({ recognition: recognitionResult });

    } catch (error) {
        console.error("Backend caught an unexpected error:", error);
        // Provide a more descriptive error message in the console for debugging
        if (error.response) {
            console.error('API Response Status:', error.response.status);
            console.error('API Response Data:', error.response.data);
            return res.status(error.response.status).json({ message: `API Error: ${error.response.data.error.message}` });
        }
        res.status(500).json({ message: `An unexpected server error occurred: ${error.message}` });
    }
};
