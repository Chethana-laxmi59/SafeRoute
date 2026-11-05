import http from 'http';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';

dotenv.config({ path: 'server/.env' });
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'saferoute_dev_secret_key_change_in_production_2026';
}

// Setup in-process testing server instance
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

// Error handler
app.use((err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  if (err.code === 11000) {
    statusCode = 400;
    message = 'An account with this email already exists';
  }
  res.status(statusCode).json({ success: false, message });
});

const TEST_PORT = 5001;

// Helper to make HTTP request in Node.js
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const headers = {
      'Content-Type': 'application/json',
    };
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

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
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              data: body ? JSON.parse(body) : {},
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              data: body,
            });
          }
        });
      }
    );

    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING BACKEND AUTHENTICATION SUITE ---');

  // 1. Connect to local MongoDB instance
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/saferoute';
  await mongoose.connect(mongoUri);
  console.log('✓ Connected to MongoDB for test suite');

  // Clean test user collection before running
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    if (collection.collectionName === 'users') {
      await collection.deleteMany({});
    }
  }

  // Start test server
  const server = app.listen(TEST_PORT);
  console.log(`✓ Test HTTP server listening on port ${TEST_PORT}\n`);

  let testUserToken = '';
  const testUser = {
    name: 'Ananya Sharma',
    email: 'ananya.test@saferoute.org',
    password: 'SafePassword123!',
    phone: '+919876543210'
  };

  try {
    // Test 1: Successful Registration
    console.log('Test 1: Register new user with valid credentials...');
    const regRes = await makeRequest('POST', '/api/auth/register', testUser);
    if (regRes.status === 201 && regRes.data.success && regRes.data.token && !regRes.data.user.password) {
      console.log('  PASSED: User registered with 201, received JWT token, password hash not exposed.');
      testUserToken = regRes.data.token;
    } else {
      throw new Error(`Test 1 Failed: ${JSON.stringify(regRes)}`);
    }

    // Test 2: Prevent Duplicate Email Registration
    console.log('\nTest 2: Attempt duplicate registration with same email...');
    const dupRes = await makeRequest('POST', '/api/auth/register', testUser);
    if (dupRes.status === 400 && !dupRes.data.success) {
      console.log(`  PASSED: Rejected with 400. Message: "${dupRes.data.message}"`);
    } else {
      throw new Error(`Test 2 Failed: Expected 400, got ${dupRes.status}`);
    }

    // Test 3: Validate Password Length Requirement
    console.log('\nTest 3: Reject registration with short password (< 6 chars)...');
    const shortPassRes = await makeRequest('POST', '/api/auth/register', {
      name: 'Tester',
      email: 'short@example.com',
      password: '123'
    });
    if (shortPassRes.status === 400 && !shortPassRes.data.success) {
      console.log(`  PASSED: Rejected with 400. Message: "${shortPassRes.data.message}"`);
    } else {
      throw new Error(`Test 3 Failed: ${JSON.stringify(shortPassRes)}`);
    }

    // Test 4: Validate Invalid Email Format
    console.log('\nTest 4: Reject registration with invalid email format...');
    const badEmailRes = await makeRequest('POST', '/api/auth/register', {
      name: 'Tester',
      email: 'invalid-email-format',
      password: 'ValidPassword123'
    });
    if (badEmailRes.status === 400 && !badEmailRes.data.success) {
      console.log(`  PASSED: Rejected with 400. Message: "${badEmailRes.data.message}"`);
    } else {
      throw new Error(`Test 4 Failed: ${JSON.stringify(badEmailRes)}`);
    }

    // Test 5: Successful Login
    console.log('\nTest 5: Login with valid registered credentials...');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    if (loginRes.status === 200 && loginRes.data.success && loginRes.data.token) {
      console.log('  PASSED: Authenticated with 200, received new JWT and user payload.');
    } else {
      throw new Error(`Test 5 Failed: ${JSON.stringify(loginRes)}`);
    }

    // Test 6: Login with Incorrect Password
    console.log('\nTest 6: Reject login with incorrect password...');
    const badPassRes = await makeRequest('POST', '/api/auth/login', {
      email: testUser.email,
      password: 'WrongPassword999'
    });
    if (badPassRes.status === 401 && badPassRes.data.message === 'Invalid email or password') {
      console.log(`  PASSED: Rejected with 401. Message: "${badPassRes.data.message}" (Generic error avoids enumeration).`);
    } else {
      throw new Error(`Test 6 Failed: ${JSON.stringify(badPassRes)}`);
    }

    // Test 7: Login with Nonexistent Email
    console.log('\nTest 7: Reject login with nonexistent email...');
    const noUserRes = await makeRequest('POST', '/api/auth/login', {
      email: 'nobody@saferoute.org',
      password: 'AnyPassword123'
    });
    if (noUserRes.status === 401 && noUserRes.data.message === 'Invalid email or password') {
      console.log(`  PASSED: Rejected with 401. Generic message preserved.`);
    } else {
      throw new Error(`Test 7 Failed: ${JSON.stringify(noUserRes)}`);
    }

    // Test 8: Protected Route Access with Valid Token (GET /api/auth/me)
    console.log('\nTest 8: Access protected route GET /api/auth/me with Bearer token...');
    const meRes = await makeRequest('GET', '/api/auth/me', null, testUserToken);
    if (meRes.status === 200 && meRes.data.success && meRes.data.user.email === testUser.email.toLowerCase()) {
      console.log(`  PASSED: Protected route returned 200. User: ${meRes.data.user.name} (${meRes.data.user.email})`);
    } else {
      throw new Error(`Test 8 Failed: ${JSON.stringify(meRes)}`);
    }

    // Test 9: Protected Route Access Without Token
    console.log('\nTest 9: Reject protected route without Authorization header...');
    const noTokenRes = await makeRequest('GET', '/api/auth/me');
    if (noTokenRes.status === 401 && !noTokenRes.data.success) {
      console.log(`  PASSED: Rejected with 401. Message: "${noTokenRes.data.message}"`);
    } else {
      throw new Error(`Test 9 Failed: ${JSON.stringify(noTokenRes)}`);
    }

    // Test 10: Protected Route Access With Tampered / Invalid Token
    console.log('\nTest 10: Reject protected route with forged/tampered token...');
    const tamperedRes = await makeRequest('GET', '/api/auth/me', null, 'forged.invalid.jwt.token');
    if (tamperedRes.status === 401 && !tamperedRes.data.success) {
      console.log(`  PASSED: Rejected with 401. Message: "${tamperedRes.data.message}"`);
    } else {
      throw new Error(`Test 10 Failed: ${JSON.stringify(tamperedRes)}`);
    }

    console.log('\n===============================================');
    console.log(' ALL 10 AUTHENTICATION TESTS PASSED SUCCESSFULLY! ');
    console.log('===============================================\n');

  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runTests().catch((err) => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});

