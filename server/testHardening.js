import http from 'http';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import sosRoutes from './routes/sosRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'saferoute_dev_secret_key_change_in_production_2026';
}

const app = express();

// Hardening & Security Headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.disable('x-powered-by');

// Simulating strict production CORS origin checking
const ALLOWED_ORIGIN = 'https://saferoute.vercel.app';
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (origin === ALLOWED_ORIGIN) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'online', mode: 'production_hardened' });
});

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/resources', resourceRoutes);

// Error Handler omitting stack in production simulation
app.use((err, req, res, next) => {
  if (err.message && err.message.startsWith('CORS blocked')) {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden: Origin not allowed by CORS policy',
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const TEST_PORT = 5006;

function makeRawRequest(method, reqPath, data = null, headers = {}) {
  return new Promise((resolve) => {
    const payload = data ? JSON.stringify(data) : null;
    const reqHeaders = { 'Content-Type': 'application/json', ...headers };
    if (payload) reqHeaders['Content-Length'] = Buffer.byteLength(payload);

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: reqPath,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, headers: res.headers, data: body });
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

async function runHardeningTests() {
  console.log('\n======================================================');
  console.log(' SafeRoute Phase 7: Production Security Hardening Audit');
  console.log('======================================================\n');

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/saferoute';
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB at ${mongoUri}`);

    await new Promise((resolve) => {
      serverInstance = app.listen(TEST_PORT, '127.0.0.1', () => {
        console.log(`Hardened Test API listening on http://127.0.0.1:${TEST_PORT}\n`);
        resolve();
      });
    });

    // Cleanup test user
    await User.deleteMany({ email: 'hardening_user@saferoute.org' });

    // -------------------------------------------------------------------------
    // TEST 1: Security Headers Audit
    // -------------------------------------------------------------------------
    console.log('--- TEST GROUP 1: HTTP Security Headers Audit ---');
    const healthRes = await makeRawRequest('GET', '/api/health');
    assert(healthRes.status === 200, 'Health endpoint responds with 200 OK');
    assert(
      healthRes.headers['x-content-type-options'] === 'nosniff',
      'X-Content-Type-Options: nosniff header enforced by Helmet'
    );
    assert(
      healthRes.headers['x-frame-options'] === 'SAMEORIGIN',
      'X-Frame-Options: SAMEORIGIN header enforced by Helmet'
    );
    assert(
      !healthRes.headers['x-powered-by'],
      'X-Powered-By header is strictly suppressed (Express fingerprint removed)'
    );

    // -------------------------------------------------------------------------
    // TEST 2: CORS Origin Enforcement
    // -------------------------------------------------------------------------
    console.log('\n--- TEST GROUP 2: CORS Origin Security ---');
    // Request from unauthorized origin
    const corsBlockedRes = await makeRawRequest('GET', '/api/health', null, {
      Origin: 'https://malicious-phishing-site.com',
    });
    assert(
      corsBlockedRes.status === 403,
      'Unauthorized external origin blocked with 403 Forbidden'
    );

    // Request from legitimate deployed origin
    const corsAllowedRes = await makeRawRequest('GET', '/api/health', null, {
      Origin: 'https://saferoute.vercel.app',
    });
    assert(
      corsAllowedRes.status === 200,
      'Authorized production client origin (https://saferoute.vercel.app) permitted'
    );

    // -------------------------------------------------------------------------
    // TEST 3: User Registration & Password Hash Privacy
    // -------------------------------------------------------------------------
    console.log('\n--- TEST GROUP 3: Sensitive Data Leaks & Auth Sanitization ---');
    const regRes = await makeRawRequest('POST', '/api/auth/register', {
      name: 'Hardening Test User',
      email: 'hardening_user@saferoute.org',
      password: 'StrongPassword123!',
      phone: '+91 98765 00000',
    });
    assert(regRes.status === 201 && regRes.data.success, 'Registration succeeds with 201');
    assert(!regRes.data.user.password, 'Password hash is NOT present in registration response');
    const token = regRes.data.token;

    // Login test
    const loginRes = await makeRawRequest('POST', '/api/auth/login', {
      email: 'hardening_user@saferoute.org',
      password: 'StrongPassword123!',
    });
    assert(loginRes.status === 200 && loginRes.data.success, 'Login succeeds with 200');
    assert(!loginRes.data.user.password, 'Password hash is NOT present in login response');

    // Get current user test
    const meRes = await makeRawRequest('GET', '/api/auth/me', null, {
      Authorization: `Bearer ${token}`,
    });
    assert(meRes.status === 200 && meRes.data.success, 'GET /api/auth/me succeeds with 200');
    assert(!meRes.data.user.password, 'Password hash is NOT present in GET /api/auth/me response');

    // -------------------------------------------------------------------------
    // TEST 4: Sensitive Field Tamper Resistance
    // -------------------------------------------------------------------------
    console.log('\n--- TEST GROUP 4: Profile Modification & Privilege Escalation ---');
    const tamperRes = await makeRawRequest(
      'PATCH',
      '/api/auth/profile',
      {
        email: 'attacker@evil.com',
        role: 'superadmin',
        password: 'HackedPassword999!',
        name: 'Hardening Verified',
      },
      { Authorization: `Bearer ${token}` }
    );
    assert(tamperRes.status === 200, 'Profile update returns 200');
    assert(
      tamperRes.data.user.name === 'Hardening Verified',
      'Permitted field (name) successfully updated'
    );

    // Verify DB state directly
    const dbUser = await User.findOne({ email: 'hardening_user@saferoute.org' });
    assert(dbUser !== null, 'Original email unmodified in database');
    assert(
      dbUser.email === 'hardening_user@saferoute.org',
      'Email immutability preserved (not changed to attacker@evil.com)'
    );

    // Verify old password still works
    const reAuthRes = await makeRawRequest('POST', '/api/auth/login', {
      email: 'hardening_user@saferoute.org',
      password: 'StrongPassword123!',
    });
    assert(
      reAuthRes.status === 200,
      'Original password remains active (password not tampered via profile update)'
    );

    // -------------------------------------------------------------------------
    // TEST 5: Large Payload Mitigation
    // -------------------------------------------------------------------------
    console.log('\n--- TEST GROUP 5: Large Request Body DoS Mitigation ---');
    const largeString = 'A'.repeat(150 * 1024); // 150KB payload (exceeds 100kb limit)
    const largePayloadRes = await makeRawRequest(
      'POST',
      '/api/auth/login',
      { email: 'test@test.com', password: largeString }
    );
    assert(
      largePayloadRes.status === 413,
      'Payload exceeding 100kb rejected with 413 Payload Too Large'
    );

    // -------------------------------------------------------------------------
    // TEST 6: Production Error Masking
    // -------------------------------------------------------------------------
    console.log('\n--- TEST GROUP 6: Error Handling & Stack Trace Masking ---');
    const badIdRes = await makeRawRequest('GET', '/api/contacts/invalid-mongo-id-999', null, {
      Authorization: `Bearer ${token}`,
    });
    assert(
      badIdRes.status === 404,
      'Invalid Mongoose ObjectId gracefully mapped to 404 Not Found'
    );
    assert(
      !badIdRes.data.stack,
      'Stack trace is completely omitted from error response'
    );

  } catch (err) {
    console.error('Hardening test execution error:', err);
    failed++;
  } finally {
    if (serverInstance) {
      await new Promise((resolve) => serverInstance.close(resolve));
    }
    await mongoose.disconnect();
    console.log('\n======================================================');
    console.log(` HARDENING RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runHardeningTests();

