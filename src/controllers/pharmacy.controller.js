import { findNearbyPharmacies } from '../services/pharmacy.service.js';

export const nearby = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required.' });
    }
    const results = await findNearbyPharmacies(lat, lng);
    res.json({ results });
  } catch (e) {
    next(e);
  }
};