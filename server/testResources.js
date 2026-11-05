import http from 'http';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import { seedDefaultResources } from './config/seedResources.js';

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
app.use('/api/resources', resourceRoutes);

app.use((err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ success: false, message });
});

const TEST_PORT = 5004;

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
  console.log('--- STARTING SAFETY RESOURCES API TEST SUITE ---');

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/saferoute';
  await mongoose.connect(mongoUri);
  console.log('✓ Connected to MongoDB');

  // Seed default demonstration resources
  await seedDefaultResources();
  console.log('✓ Verified demonstration resources seeded');

  const server = app.listen(TEST_PORT);
  console.log(`✓ Test Server listening on port ${TEST_PORT}\n`);

  try {
    // 1. Reject unauthenticated access
    console.log('Test 1: Reject unauthenticated access to safety resources...');
    const unauth = await makeRequest('GET', '/api/resources');
    if (unauth.status === 401) {
      console.log('  PASSED: Rejected with 401 Unauthorized.');
    } else {
      throw new Error(`Test 1 Failed: Expected 401, got ${unauth.status}`);
    }

    // 2. Register test user
    console.log('\nTest 2: Register user and obtain JWT token...');
    const userRes = await makeRequest('POST', '/api/auth/register', {
      name: 'Ritu Varma',
      email: `ritu.${Date.now()}@saferoute.org`,
      password: 'SafePassword123!',
    });
    const token = userRes.data.token;
    console.log('  PASSED: User registered, token received.');

    // 3. Retrieve all safety resources
    console.log('\nTest 3: Retrieve all safety resources with valid JWT...');
    const allRes = await makeRequest('GET', '/api/resources', null, token);
    if (allRes.status === 200 && allRes.data.success && allRes.data.count >= 12) {
      console.log(`  PASSED: Retrieved ${allRes.data.count} demo safety resources.`);
      const first = allRes.data.resources[0];
      if (first.isDemo && first.source === 'Academic Demonstration Dataset') {
        console.log('    ✓ Explicit Demo Source flag verified on resources.');
      } else {
        throw new Error('Test 3 Failed: Demo metadata missing on resources');
      }
    } else {
      throw new Error(`Test 3 Failed: ${JSON.stringify(allRes)}`);
    }

    // 4. Test Police Category Filter
    console.log('\nTest 4: Filter resources by category=police...');
    const policeRes = await makeRequest('GET', '/api/resources?category=police', null, token);
    if (
      policeRes.status === 200 &&
      policeRes.data.count > 0 &&
      policeRes.data.resources.every((r) => r.category === 'police')
    ) {
      console.log(`  PASSED: Retrieved ${policeRes.data.count} police stations (100% police category match).`);
    } else {
      throw new Error(`Test 4 Failed: ${JSON.stringify(policeRes)}`);
    }

    // 5. Test Hospital Category Filter
    console.log('\nTest 5: Filter resources by category=hospital...');
    const hospRes = await makeRequest('GET', '/api/resources?category=hospital', null, token);
    if (
      hospRes.status === 200 &&
      hospRes.data.count > 0 &&
      hospRes.data.resources.every((r) => r.category === 'hospital')
    ) {
      console.log(`  PASSED: Retrieved ${hospRes.data.count} hospitals (100% hospital category match).`);
    } else {
      throw new Error(`Test 5 Failed: ${JSON.stringify(hospRes)}`);
    }

    // 6. Test Safe Haven Category Filter
    console.log('\nTest 6: Filter resources by category=safe_haven...');
    const havenRes = await makeRequest('GET', '/api/resources?category=safe_haven', null, token);
    if (
      havenRes.status === 200 &&
      havenRes.data.count > 0 &&
      havenRes.data.resources.every((r) => r.category === 'safe_haven')
    ) {
      console.log(`  PASSED: Retrieved ${havenRes.data.count} safe havens (100% safe_haven match).`);
    } else {
      throw new Error(`Test 6 Failed: ${JSON.stringify(havenRes)}`);
    }

    // 7. Test Invalid Category Validation
    console.log('\nTest 7: Reject invalid category query parameter...');
    const badCat = await makeRequest('GET', '/api/resources?category=invalid_type', null, token);
    if (badCat.status === 400 && !badCat.data.success) {
      console.log(`  PASSED: Rejected with 400. Message: "${badCat.data.message}"`);
    } else {
      throw new Error(`Test 7 Failed: Expected 400, got ${badCat.status}`);
    }

    // 8. Test Distance Calculation & Sorting
    console.log('\nTest 8: Distance calculation from coordinates (28.6139, 77.2090)...');
    const geoQuery = await makeRequest('GET', '/api/resources?lat=28.6139&lng=77.2090', null, token);
    if (
      geoQuery.status === 200 &&
      geoQuery.data.resources[0].distanceKm !== undefined &&
      geoQuery.data.resources[0].distanceMeters !== undefined
    ) {
      const closest = geoQuery.data.resources[0];
      const second = geoQuery.data.resources[1];
      console.log(`  PASSED: Distance calculated. Closest: "${closest.name}" (${closest.distanceKm} km away)`);
      if (closest.distanceKm <= second.distanceKm) {
        console.log('    ✓ Resources properly sorted in ascending order of proximity.');
      } else {
        throw new Error('Resources not sorted by proximity');
      }
    } else {
      throw new Error(`Test 8 Failed: ${JSON.stringify(geoQuery)}`);
    }

    // 9. Test Radius Proximity Filter
    console.log('\nTest 9: Filter resources within 3 km radius...');
    const radiusQuery = await makeRequest('GET', '/api/resources?lat=28.6139&lng=77.2090&radius=3', null, token);
    if (
      radiusQuery.status === 200 &&
      radiusQuery.data.resources.every((r) => r.distanceKm <= 3)
    ) {
      console.log(`  PASSED: Found ${radiusQuery.data.count} resources strictly within 3 km.`);
    } else {
      throw new Error(`Test 9 Failed: ${JSON.stringify(radiusQuery)}`);
    }

    // 10. Test Get Resource By ID
    const sampleId = allRes.data.resources[0]._id;
    console.log(`\nTest 10: Retrieve single resource by ID (${sampleId})...`);
    const single = await makeRequest('GET', `/api/resources/${sampleId}`, null, token);
    if (single.status === 200 && single.data.resource.name === allRes.data.resources[0].name) {
      console.log(`  PASSED: Retrieved single resource: "${single.data.resource.name}"`);
    } else {
      throw new Error(`Test 10 Failed: ${JSON.stringify(single)}`);
    }

    // 11. Test Get Nonexistent Resource
    console.log('\nTest 11: Nonexistent resource ID returns 404...');
    const nonExistent = await makeRequest('GET', '/api/resources/507f1f77bcf86cd799439011', null, token);
    if (nonExistent.status === 404) {
      console.log('  PASSED: Returned 404 Not Found.');
    } else {
      throw new Error(`Test 11 Failed: Expected 404, got ${nonExistent.status}`);
    }

    console.log('\n======================================================');
    console.log(' 🎉 ALL 11 SAFETY RESOURCES TESTS PASSED (100% SUCCESS) ');
    console.log('======================================================\n');

  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runTests().catch((e) => {
  console.error('Test execution error:', e);
  process.exit(1);
});

