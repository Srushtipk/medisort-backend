import axios from 'axios';
import 'dotenv/config';

// Function to get a bearer token from IBM Cloud
const getBearerToken = async () => {
  const tokenUrl = 'https://iam.cloud.ibm.com/identity/token';
  const apiKey = process.env.IBM_API_KEY;

  const params = new URLSearchParams();
  params.append('grant_type', 'urn:ibm:params:oauth:grant-type:apikey');
  params.append('apikey', apiKey);

  const response = await axios.post(tokenUrl, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    }
  });

  return response.data.access_token;
};

// Function to make a prediction with the IBM model
const makeModelPrediction = async (endpoint, token, payload) => {
  const response = await axios.post(endpoint, payload, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

// This is the main function your controller will call
export const identifyPill = async (imagePath) => {
  try {
    const token = await getBearerToken();
    const medicineData = {
      "input_data": [{
        "fields": ["Name", "Type", "Category", "Usage", "ExpiryDate", "ImagePath"],
        "values": [
          ["", "", "", "", "", imagePath]
        ]
      }]
    };

    const prediction = await makeModelPrediction(
      process.env.IBM_MODEL_ENDPOINT,
      token,
      medicineData
    );

    const result = prediction.results[0].predictions[0].values[0];

    return {
      name: result[0],
      advice: result[3],
      confidence: 1.0, 
      expiryDate: result[4]
    };
  } catch (error) {
    console.error('IBM API Error:', error.response ? error.response.data : error.message);
    return { name: 'Unknown Pill', advice: 'Could not identify pill. Please consult a doctor.', confidence: 0.0, expiryDate: null };
  }
};