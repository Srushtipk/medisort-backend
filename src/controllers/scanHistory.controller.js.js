import ScanHistory from '../models/ScanHistory.js';

export const getScanHistory = async (req, res, next) => {
  try {
    const history = await ScanHistory.find({ userId: req.user._id }).sort({ timestamp: -1 });
    res.json(history);
  } catch (e) {
    next(e);
  }
};