// seed/test_pubsub.ts
import fs from 'fs/promises';
import path from 'path';
import { createClient } from 'graphql-ws';
import WebSocket from 'ws';
import axios from 'axios';
import mongoose from 'mongoose';

const MONGO_URL = 'mongodb://localhost:27017/gps_data';

async function clearDatabase() {
  console.log('🗑️  Clearing existing GPS database…');
  await mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  console.log('✅ GPS database dropped.');
}

async function main() {
  // 0. Clear out the old data
  await clearDatabase();

  // 1. Load coords.txt from the same folder
  const filePath = path.join(__dirname, 'coords.txt');
  const text     = await fs.readFile(filePath, 'utf8');
  const coords   = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length)
    .map(line => {
      const [lat, lng] = line.split(',').map(s => s.trim());
      return { lat: parseFloat(lat), lng: parseFloat(lng) };
    });

  // 2. Start GraphQL subscription
  console.log('🛰 Subscribing to gpsDataAdded…');
  const wsClient = createClient({
    url: 'ws://localhost:3002/graphql',
    webSocketImpl: WebSocket,
  });

  const dispose = wsClient.subscribe(
    { query: `subscription { gpsDataAdded { lat lng timestamp } }` },
    {
      next: ({ data }) => {
        console.log('📡 Event:', JSON.stringify(data, null, 2));
      },
      error: err => {
        console.error('❌ Subscription error:', err);
      },
      complete: () => {
        console.log('🔒 Subscription complete');
      },
    }
  );

  // 3. Small delay to ensure WS handshake
  await new Promise(r => setTimeout(r, 500));

  // 4. POST each coordinate one by one
  for (const { lat, lng } of coords) {
    const payload = {
      lat,
      lng,
      timestamp: new Date().toISOString(),
    };
    console.log('🚀 POSTing:', payload);
    try {
      const res = await axios.post('http://localhost:3002/gps-data', payload);
      console.log(`✅ HTTP ${res.status}`);
    } catch (err) {
      console.error('❌ POST error:', err);
    }
    // optional pause between posts
    await new Promise(r => setTimeout(r, 500));
  }

  // 5. Allow a bit of time for all events to arrive, then clean up
  await new Promise(r => setTimeout(r, 2000));
  dispose();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
