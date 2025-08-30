import { getAiSuggestion } from '../services/awsLambda.service.js';

export const getSuggestionLambda = async (req, res, next) => {
  try {
    const result = await getAiSuggestion(req.body.question);
    res.json(result);
  } catch (e) {
    next(e);
  }
};