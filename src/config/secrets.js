// This file centralizes access to your environment variables.
import 'dotenv/config'; 

// Load your API keys from the .env file
export const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
export const HF_TOKEN = process.env.HF_TOKEN;

// Add more keys as needed
