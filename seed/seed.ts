// decode-and-save-to-mongo-timestamped.js
import mongoose from 'mongoose';
import axios from 'axios';
import polyline from '@mapbox/polyline';
import { GPSDataModel } from '../src/schema/GPSDataSchema';  // adjust path as needed

const MONGO_URL = 'mongodb://localhost:27017/gps_data';

// your six trips:
const trips = [
  { start: { lat: -37.853024, lng: 145.002480 }, end: { lat: -37.504733, lng: 144.613153 } },
  { start: { lat: -37.855404, lng: 144.981562 }, end: { lat: -38.167131, lng: 144.351327 } },
  { start: { lat: -37.855404, lng: 144.981562 }, end: { lat: -38.337538, lng: 141.593960 } },
  { start: { lat: -37.853024, lng: 145.002480 }, end: { lat: -34.973802, lng: 138.591295 } },
  { start: { lat: -37.816142, lng: 144.972173 }, end: { lat: -37.871607, lng: 144.663278 } },
  { start: { lat: -37.816142, lng: 144.972173 }, end: { lat: -37.789996, lng: 145.336562 } },
];

async function fetchRouteCoords(origin, dest) {
  // OSRM wants lon,lat
  const url = `http://router.project-osrm.org/route/v1/driving/` +
              `${origin.lng},${origin.lat};${dest.lng},${dest.lat}` +
              `?overview=full&geometries=polyline`;
  const { data } = await axios.get(url);
  const raw = polyline.decode(data.routes[0].geometry);
  // decode gives [lat, lng]
  return raw.map(([lat, lng]) => ({ lat, lng }));
}

async function main() {
  await mongoose.connect(MONGO_URL, {
    useNewUrlParser:    true,
    useUnifiedTopology: true,
  });

  const allDocs = [];

  const now = Date.now();
  for (let i = 0; i < trips.length; i++) {
    // schedule trip i to (i+1) days ago
    const daysAgo = i + 1;
    // set the start-of-day timestamp in ms
    const midnight = new Date(now - daysAgo * 24*60*60*1000);
    midnight.setHours(0, 0, 0, 0);

    const coords = await fetchRouteCoords(trips[i].start, trips[i].end);
    console.log(`Trip ${i+1}: decoded ${coords.length} points`);

    // timestamp each point 5s apart from that trip’s midnight
    const docs = coords.map(({ lat, lng }, j) => ({
      lat,
      lng,
      timestamp: new Date(midnight.getTime() + j * 5_000),
    }));
    allDocs.push(...docs);
  }

  // bulk insert
  const inserted = await GPSDataModel.insertMany(allDocs);
  console.log(`✔ Inserted ${inserted.length} total docs into GPSData.`);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
