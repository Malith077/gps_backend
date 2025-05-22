// decode-and-save-to-mongo-timestamped.js
import mongoose from 'mongoose';
import axios from 'axios';
import polyline from '@mapbox/polyline';
import { GPSDataModel } from '../src/schema/GPSDataSchema';  // adjust path as needed

const MONGO_URL = 'mongodb://localhost:27017/gps_data';
const OSRM_URL = 
  'http://router.project-osrm.org/route/v1/driving/' +
  '144.9631,-37.8136;151.2093,-33.8688' +
  '?overview=full&geometries=polyline';

async function fetchRouteCoords() {
  const { data } = await axios.get(OSRM_URL);
  const rawPts = polyline.decode(data.routes[0].geometry);
  return rawPts.map(([lat, lng]) => ({ lat, lng }));
}

async function main() {
  // 1. Connect
  await mongoose.connect(MONGO_URL, {
    useNewUrlParser:    true,
    useUnifiedTopology: true,
  });

  // 2. Decode
  const coords = await fetchRouteCoords();
  console.log(`Decoded ${coords.length} points.`);

  // 3. Add timestamps 5s apart
  const startTs = Date.now();
  const docs = coords.map(({ lat, lng }, i) => ({
    lat,
    lng,
    timestamp: new Date(startTs + i * 5_000),
  }));

  // 4. Insert all at once
  const inserted = await GPSDataModel.insertMany(docs);
  console.log(`✔ Inserted ${inserted.length} docs into GPSData.`);

  // 5. Clean up
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
