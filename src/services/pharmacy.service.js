import axios from 'axios';
import 'dotenv/config';

export const findNearbyPharmacies = async (lat, lng) => {
  // A simple demo mock
  return [
    { name: 'City Meds Pharmacy', distanceMeters: 320 },
    { name: 'HealthFirst Chemists', distanceMeters: 610 },
    { name: 'CarePlus Pharmacy', distanceMeters: 900 }
  ];

  // Optional: Use a real API if you have the credentials
  /*
  const key = process.env.GOOGLE_MAPS_API_KEY;
  const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
  const params = { key, location: `${lat},${lng}`, radius: 2000, type: 'pharmacy' };
  const { data } = await axios.get(url, { params });
  return (data.results || []).slice(0, 5).map(r => ({
    name: r.name,
    distanceMeters: r.distance_meters ?? null
  }));
  */
};