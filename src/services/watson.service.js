import SpeechToTextV1 from 'ibm-watson/speech-to-text/v1.js';
import TextToSpeechV1 from 'ibm-watson/text-to-speech/v1.js';
import { IamAuthenticator } from 'ibm-watson/auth/index.js';
import 'dotenv/config';

const stt = new SpeechToTextV1({
  authenticator: new IamAuthenticator({
    apikey: process.env.IBM_WATSON_APIKEY,
  }),
  serviceUrl: process.env.IBM_WATSON_URL,
});

const tts = new TextToSpeechV1({
  authenticator: new IamAuthenticator({
    apikey: process.env.IBM_WATSON_APIKEY,
  }),
  serviceUrl: process.env.IBM_WATSON_URL,
});

export const speechToText = async (audioBuffer) => {
  const params = {
    audio: audioBuffer,
    contentType: 'audio/flac', // You can adjust the format
    model: 'en-US_BroadbandModel',
  };
  const { result } = await stt.recognize(params);
  return result.results[0]?.alternatives[0]?.transcript || '';
};

export const textToSpeech = async (text) => {
  const synthesizeParams = {
    text: text,
    accept: 'audio/wav',
    voice: 'en-US_MichaelV3Voice',
  };
  const { result } = await tts.synthesize(synthesizeParams);
  return result;
};