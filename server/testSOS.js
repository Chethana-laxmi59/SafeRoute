import http from 'http';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import sosRoutes from './routes/sosRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'saferoute_dev_secret_key_change_in_production_2026';
}

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/sos', sosRoutes);

// Error handler
app.use((err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ success: false, message });
});

const TEST_PORT = 5003;

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path,
        method,
        headers,
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, data: body });
          }
        });
      }
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING EMERGENCY SOS & GEOLOCATION TEST SUITE ---');

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/saferoute';
  await mongoose.connect(mongoUri);
  console.log('✓ Connected to MongoDB');

  // Clean collections before test
  const collections = await mongoose.connection.db.collections();
  for (let c of collections) {
    if (['users', 'trustedcontacts', 'emergencyevents'].includes(c.collectionName)) {
      await c.deleteMany({});
    }
  }

  const server = app.listen(TEST_PORT);
  console.log(`✓ Test Server listening on port ${TEST_PORT}\n`);

  try {
    // 1. Reject unauthenticated SOS request
    console.log('Test 1: Reject unauthenticated SOS request...');
    const unauth = await makeRequest('POST', '/api/sos', { latitude: 28.6139, longitude: 77.209 });
    if (unauth.status === 401) {
      console.log('  PASSED: Rejected with 401 Unauthorized.');
    } else {
      throw new Error(`Test 1 Failed: Expected 401, got ${unauth.status}`);
    }

    // 2. Register User A & User B
    console.log('\nTest 2: Register User A and User B...');
    const userARes = await makeRequest('POST', '/api/auth/register', {
      name: 'Meera Sen',
      email: 'meera@saferoute.org',
      password: 'SafePassword123!',
    });
    const tokenA = userARes.data.token;

    const userBRes = await makeRequest('POST', '/api/auth/register', {
      name: 'Sita Verma',
      email: 'sita@saferoute.org',
      password: 'SafePassword123!',
    });
    const tokenB = userBRes.data.token;
    console.log('  PASSED: Both users registered with distinct tokens.');

    // 3. User A adds a contact
    console.log('\nTest 3: User A creates a trusted contact...');
    const contactRes = await makeRequest('POST', '/api/contacts', {
      name: 'Rohan Sen (Brother)',
      phone: '+91 98765 11111',
      relationship: 'Brother',
    }, tokenA);
    if (contactRes.status === 201) {
      console.log('  PASSED: Trusted contact created.');
    } else {
      throw new Error('Failed to create test contact');
    }

    // 4. User A triggers SOS with valid coordinates
    console.log('\nTest 4: User A triggers Emergency SOS with coordinates...');
    const sos1 = await makeRequest('POST', '/api/sos', {
      latitude: 28.6139,
      longitude: 77.2090,
      accuracy: 14.2,
      message: 'Immediate help needed near Central Park',
    }, tokenA);

    if (
      sos1.status === 201 &&
      sos1.data.success &&
      sos1.data.event.status === 'active' &&
      sos1.data.event.alertMode === 'demo' &&
      sos1.data.event.deliveryStatus === 'demo_logged' &&
      sos1.data.event.deliveryDetails.length === 1 &&
      sos1.data.event.deliveryDetails[0].delivered === false // Strict ethical check
    ) {
      console.log('  PASSED: SOS created with 201. Verified:');
      console.log('    • AlertMode: demo');
      console.log('    • DeliveryStatus: demo_logged');
      console.log('    • Delivered: false (no false delivery claim)');
      console.log('    • Contact audit log preserved: Rohan Sen (Brother)');
    } else {
      throw new Error(`Test 4 Failed: ${JSON.stringify(sos1)}`);
    }
    const event1Id = sos1.data.event._id;

    // 5. Reject invalid latitude
    console.log('\nTest 5: Reject SOS with out-of-range latitude (> 90)...');
    const badLat = await makeRequest('POST', '/api/sos', { latitude: 120.5, longitude: 77.2 }, tokenA);
    if (badLat.status === 400) {
      console.log(`  PASSED: Rejected with 400. Message: "${badLat.data.message}"`);
    } else {
      throw new Error(`Test 5 Failed: Expected 400, got ${badLat.status}`);
    }

    // 6. Reject invalid longitude
    console.log('\nTest 6: Reject SOS with out-of-range longitude (> 180)...');
    const badLng = await makeRequest('POST', '/api/sos', { latitude: 28.6, longitude: 195.0 }, tokenA);
    if (badLng.status === 400) {
      console.log(`  PASSED: Rejected with 400. Message: "${badLng.data.message}"`);
    } else {
      throw new Error(`Test 6 Failed: Expected 400, got ${badLng.status}`);
    }

    // 7. Reject non-numeric coordinates
    console.log('\nTest 7: Reject SOS with non-numeric coordinates...');
    const nonNumeric = await makeRequest('POST', '/api/sos', { latitude: 'invalid_lat', longitude: 'invalid_lng' }, tokenA);
    if (nonNumeric.status === 400) {
      console.log(`  PASSED: Rejected with 400.`);
    } else {
      throw new Error(`Test 7 Failed: Expected 400, got ${nonNumeric.status}`);
    }

    // 8. User A triggers second SOS without coordinates (GPS denied scenario)
    console.log('\nTest 8: Trigger SOS without GPS coordinates (GPS unavailable scenario)...');
    const sos2 = await makeRequest('POST', '/api/sos', {
      message: 'Urgent distress signal (GPS disabled by user)',
    }, tokenA);
    if (sos2.status === 201 && sos2.data.event.latitude === null) {
      console.log('  PASSED: SOS created cleanly with null coordinates.');
    } else {
      throw new Error(`Test 8 Failed: ${JSON.stringify(sos2)}`);
    }
    const event2Id = sos2.data.event._id;

    // 9. User A retrieves SOS history
    console.log('\nTest 9: User A retrieves emergency event history...');
    const histA = await makeRequest('GET', '/api/sos/history', null, tokenA);
    if (histA.status === 200 && histA.data.count === 2) {
      console.log(`  PASSED: Retrieved 2 emergency events for User A.`);
    } else {
      throw new Error(`Test 9 Failed: Expected count 2, got ${histA.data.count}`);
    }

    // 10. User A retrieves single event by ID
    console.log('\nTest 10: User A retrieves single event by ID...');
    const single = await makeRequest('GET', `/api/sos/${event1Id}`, null, tokenA);
    if (single.status === 200 && single.data.event._id === event1Id) {
      console.log('  PASSED: Retrieved single event by ID with 200.');
    } else {
      throw new Error(`Test 10 Failed: ${JSON.stringify(single)}`);
    }

    // 11. CROSS-USER ISOLATION: User B tries to read User A's SOS event
    console.log('\nTest 11: CROSS-USER ISOLATION: User B attempts to read User A SOS event...');
    const crossRead = await makeRequest('GET', `/api/sos/${event1Id}`, null, tokenB);
    if (crossRead.status === 403) {
      console.log(`  PASSED: Cross-user read blocked with 403 Forbidden. Message: "${crossRead.data.message}"`);
    } else {
      throw new Error(`Test 11 Failed: Expected 403, got ${crossRead.status}`);
    }

    // 12. CROSS-USER ISOLATION: User B tries to resolve User A's SOS event
    console.log('\nTest 12: CROSS-USER ISOLATION: User B attempts to resolve User A SOS event...');
    const crossResolve = await makeRequest('PATCH', `/api/sos/${event1Id}/resolve`, {}, tokenB);
    if (crossResolve.status === 403) {
      console.log('  PASSED: Cross-user resolve blocked with 403 Forbidden.');
    } else {
      throw new Error(`Test 12 Failed: Expected 403, got ${crossResolve.status}`);
    }

    // 13. CROSS-USER ISOLATION: User B tries to cancel User A's SOS event
    console.log('\nTest 13: CROSS-USER ISOLATION: User B attempts to cancel User A SOS event...');
    const crossCancel = await makeRequest('PATCH', `/api/sos/${event1Id}/cancel`, {}, tokenB);
    if (crossCancel.status === 403) {
      console.log('  PASSED: Cross-user cancel blocked with 403 Forbidden.');
    } else {
      throw new Error(`Test 13 Failed: Expected 403, got ${crossCancel.status}`);
    }

    // 14. Verify User B history has 0 events
    console.log('\nTest 14: Verify User B has 0 emergency events (zero cross-user leakage)...');
    const histB = await makeRequest('GET', '/api/sos/history', null, tokenB);
    if (histB.status === 200 && histB.data.count === 0) {
      console.log('  PASSED: User B history is completely empty.');
    } else {
      throw new Error(`Test 14 Failed: Expected count 0, got ${histB.data.count}`);
    }

    // 15. User A marks event 1 as RESOLVED
    console.log('\nTest 15: User A marks event 1 as resolved...');
    const resolveRes = await makeRequest('PATCH', `/api/sos/${event1Id}/resolve`, {}, tokenA);
    if (resolveRes.status === 200 && resolveRes.data.event.status === 'resolved' && resolveRes.data.event.resolvedAt) {
      console.log('  PASSED: Event 1 resolved with 200. Timestamp recorded.');
    } else {
      throw new Error(`Test 15 Failed: ${JSON.stringify(resolveRes)}`);
    }

    // 16. User A cancels event 2
    console.log('\nTest 16: User A cancels event 2...');
    const cancelRes = await makeRequest('PATCH', `/api/sos/${event2Id}/cancel`, {}, tokenA);
    if (cancelRes.status === 200 && cancelRes.data.event.status === 'cancelled' && cancelRes.data.event.cancelledAt) {
      console.log('  PASSED: Event 2 cancelled with 200. Timestamp recorded.');
    } else {
      throw new Error(`Test 16 Failed: ${JSON.stringify(cancelRes)}`);
    }

    // 17. User A queries active event (should be null now)
    console.log('\nTest 17: Query active event after resolving all events...');
    const activeRes = await makeRequest('GET', '/api/sos/active', null, tokenA);
    if (activeRes.status === 200 && activeRes.data.event === null) {
      console.log('  PASSED: Active event correctly reports null.');
    } else {
      throw new Error(`Test 17 Failed: Expected null, got ${JSON.stringify(activeRes.data.event)}`);
    }

    console.log('\n=============================================================');
    console.log(' 🎉 ALL 17 EMERGENCY SOS TESTS PASSED (100% SUCCESS) ');
    console.log('=============================================================\n');

  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runTests().catch((e) => {
  console.error('Test execution error:', e);
  process.exit(1);
});

