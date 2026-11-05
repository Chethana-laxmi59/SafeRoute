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
import resourceRoutes from './routes/resourceRoutes.js';
import User from './models/User.js';
import EmergencyEvent from './models/EmergencyEvent.js';

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
app.use('/api/resources', resourceRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ success: false, message });
});

const TEST_PORT = 5005;

function makeRequest(method, reqPath, data = null, token = null) {
  return new Promise((resolve) => {
    const payload = data ? JSON.stringify(data) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: reqPath,
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
    req.on('error', (err) => resolve({ status: 500, error: err.message }));
    if (payload) req.write(payload);
    req.end();
  });
}

let serverInstance;
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n==================================================');
  console.log(' SafeRoute Phase 6: Profile & Incident History Verification');
  console.log('==================================================\n');

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/saferoute';
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB at ${mongoUri}`);

    await new Promise((resolve) => {
      serverInstance = app.listen(TEST_PORT, '127.0.0.1', () => {
        console.log(`Test API listening at http://127.0.0.1:${TEST_PORT}\n`);
        resolve();
      });
    });

    // Cleanup existing test users from previous test runs
    await User.deleteMany({ email: { $in: ['p6_user1@test.com', 'p6_user2@test.com'] } });
    await EmergencyEvent.deleteMany({});

    // -------------------------------------------------------------------------
    // TEST 1: Register User A and User B
    // -------------------------------------------------------------------------
    console.log('--- TEST GROUP 1: User Provisioning ---');
    const regResA = await makeRequest('POST', '/api/auth/register', {
      name: 'Priya Sharma',
      email: 'p6_user1@test.com',
      password: 'Password123!',
      phone: '+91 98765 43210'
    });
    assert(regResA.status === 201 && regResA.data.success, 'Register User A succeeds with 201');
    const tokenA = regResA.data.token;
    const userAId = regResA.data.user._id || regResA.data.user.id;

    const regResB = await makeRequest('POST', '/api/auth/register', {
      name: 'Aditi Rao',
      email: 'p6_user2@test.com',
      password: 'Password123!',
      phone: '+91 91234 56789'
    });
    assert(regResB.status === 201 && regResB.data.success, 'Register User B succeeds with 201');
    const tokenB = regResB.data.token;

    // -------------------------------------------------------------------------
    // TEST 2: Unauthenticated PATCH /api/auth/profile rejected
    // -------------------------------------------------------------------------
    console.log('\n--- TEST GROUP 2: Profile Authentication Guards ---');
    const unauthRes = await makeRequest('PATCH', '/api/auth/profile', {
      name: 'Hacker Name'
    });
    assert(unauthRes.status === 401, 'Unauthenticated PATCH /api/auth/profile rejected with 401');

    // -------------------------------------------------------------------------
    // TEST 3: Validation: Reject invalid update payloads
    // -------------------------------------------------------------------------
    console.log('\n--- TEST GROUP 3: Profile Input Validation ---');
    const shortNameRes = await makeRequest('PATCH', '/api/auth/profile', {
      name: 'A'
    }, tokenA);
    assert(shortNameRes.status === 400 && !shortNameRes.data.success, 'Reject name under 2 characters with 400');

    const invalidPhoneRes = await makeRequest('PATCH', '/api/auth/profile', {
      phone: '123'
    }, tokenA);
    assert(invalidPhoneRes.status === 400 && !invalidPhoneRes.data.success, 'Reject phone shorter than 7 digits with 400');

    // -------------------------------------------------------------------------
    // TEST 4: Valid Profile Update (Name and Phone)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST GROUP 4: Valid Profile Update ---');
    const updateRes = await makeRequest('PATCH', '/api/auth/profile', {
      name: 'Priya S. Sharma',
      phone: '+91 99999 88888'
    }, tokenA);
    assert(updateRes.status === 200 && updateRes.data.success, 'Valid profile update returns 200');
    assert(updateRes.data.user.name === 'Priya S. Sharma', 'Updated name correctly returned');
    assert(updateRes.data.user.phone === '+91 99999 88888', 'Updated phone correctly returned');
    assert(!updateRes.data.user.password, 'Password hash is NOT leaked in profile update response');

    // -------------------------------------------------------------------------
    // TEST 5: Verify GET /api/auth/me reflects the updated profile
    // -------------------------------------------------------------------------
    console.log('\n--- TEST GROUP 5: Profile Persistence in GET /api/auth/me ---');
    const meRes = await makeRequest('GET', '/api/auth/me', null, tokenA);
    assert(meRes.status === 200 && meRes.data.user.name === 'Priya S. Sharma', 'GET /api/auth/me reflects updated name');
    assert(meRes.data.user.phone === '+91 99999 88888', 'GET /api/auth/me reflects updated phone');

    // -------------------------------------------------------------------------
    // TEST 6: Tamper Protection: Cannot change email, password or _id via profile update
    // -------------------------------------------------------------------------
    console.log('\n--- TEST GROUP 6: Immutable Sensitive Fields Security ---');
    const tamperRes = await makeRequest('PATCH', '/api/auth/profile', {
      email: 'hacked_email@evil.com',
      password: 'HackedPassword999!',
      _id: '650000000000000000000099',
      role: 'admin'
    }, tokenA);
    assert(tamperRes.status === 200, 'Tamper attempt processed without crashing');
    // Check that DB fields remain unmodified
    const checkUserA = await User.findById(userAId);
    assert(checkUserA.email === 'p6_user1@test.com', 'Email remained immutable (not changed to hacked_email)');
    assert(checkUserA._id.toString() === userAId.toString(), '_id remained strictly immutable');

    // Test that old password still works for login
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'p6_user1@test.com',
      password: 'Password123!'
    });
    assert(loginRes.status === 200 && loginRes.data.success, 'Original password still authenticates (password was not tampered)');

    // -------------------------------------------------------------------------
    // TEST 7: Cross-User Incident History Isolation
    // -------------------------------------------------------------------------
    console.log('\n--- TEST GROUP 7: SOS Incident History & Multi-User Isolation ---');
    // User A triggers 2 SOS alerts
    const sosA1 = await makeRequest('POST', '/api/sos', {
      latitude: 28.6139,
      longitude: 77.2090,
      accuracy: 15,
      alertMode: 'demo'
    }, tokenA);
    assert(sosA1.status === 201, 'User A creates emergency SOS incident 1');

    const sosA2 = await makeRequest('POST', '/api/sos', {
      latitude: 28.6145,
      longitude: 77.2105,
      accuracy: 20,
      alertMode: 'demo'
    }, tokenA);
    assert(sosA2.status === 201, 'User A creates emergency SOS incident 2');

    // User B triggers 1 SOS alert
    const sosB1 = await makeRequest('POST', '/api/sos', {
      latitude: 19.0760,
      longitude: 72.8777,
      accuracy: 10,
      alertMode: 'demo'
    }, tokenB);
    assert(sosB1.status === 201, 'User B creates emergency SOS incident 1');

    // User A fetches history
    const histResA = await makeRequest('GET', '/api/sos/history', null, tokenA);
    assert(histResA.status === 200 && histResA.data.events.length === 2, 'User A history contains exactly 2 incidents');
    
    // User B fetches history
    const histResB = await makeRequest('GET', '/api/sos/history', null, tokenB);
    assert(histResB.status === 200 && histResB.data.events.length === 1, 'User B history contains exactly 1 incident');
    assert(histResB.data.events[0]._id.toString() === sosB1.data.event._id.toString(), 'User B sees only their own incident');

    // User B cannot access User A's incident details directly
    const accessCrossIncident = await makeRequest('GET', `/api/sos/${sosA1.data.event._id}`, null, tokenB);
    assert(accessCrossIncident.status === 403, 'Cross-user incident access strictly blocked with 403 Forbidden');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    if (serverInstance) {
      await new Promise((resolve) => serverInstance.close(resolve));
    }
    await mongoose.disconnect();
    console.log('\n==================================================');
    console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================\n');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
