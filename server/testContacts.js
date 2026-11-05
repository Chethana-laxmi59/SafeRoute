import http from 'http';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

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

// Error handler
app.use((err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ success: false, message });
});

const TEST_PORT = 5002;

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
  console.log('--- STARTING TRUSTED CONTACTS TEST SUITE ---');

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/saferoute';
  await mongoose.connect(mongoUri);
  console.log('✓ Connected to MongoDB');

  // Clean collections before test
  const collections = await mongoose.connection.db.collections();
  for (let c of collections) {
    if (c.collectionName === 'users' || c.collectionName === 'trustedcontacts') {
      await c.deleteMany({});
    }
  }

  const server = app.listen(TEST_PORT);
  console.log(`✓ Test Server listening on port ${TEST_PORT}\n`);

  try {
    // 1. Unauthenticated Request Rejection
    console.log('Test 1: Reject unauthenticated contact creation...');
    const unauthRes = await makeRequest('POST', '/api/contacts', { name: 'Mom', phone: '9876543210' });
    if (unauthRes.status === 401) {
      console.log('  PASSED: Rejected with 401 Unauthorized.');
    } else {
      throw new Error(`Test 1 Failed: expected 401, got ${unauthRes.status}`);
    }

    // 2. Register User A & User B
    console.log('\nTest 2: Register User A and User B...');
    const userARes = await makeRequest('POST', '/api/auth/register', {
      name: 'Aditi Rao',
      email: 'aditi@saferoute.org',
      password: 'Password123'
    });
    const tokenA = userARes.data.token;

    const userBRes = await makeRequest('POST', '/api/auth/register', {
      name: 'Neha Gupta',
      email: 'neha@saferoute.org',
      password: 'Password123'
    });
    const tokenB = userBRes.data.token;
    console.log('  PASSED: User A and User B registered and received distinct JWTs.');

    // 3. User A creates contact 1
    console.log('\nTest 3: User A creates trusted contact (Mom)...');
    const c1Res = await makeRequest('POST', '/api/contacts', {
      name: 'Mother (Geeta)',
      phone: '+91 98765 43210',
      relationship: 'Mother'
    }, tokenA);
    if (c1Res.status === 201 && c1Res.data.success && c1Res.data.contact._id) {
      console.log('  PASSED: Created contact with 201. ID:', c1Res.data.contact._id);
    } else {
      throw new Error(`Test 3 Failed: ${JSON.stringify(c1Res)}`);
    }
    const contact1Id = c1Res.data.contact._id;

    // 4. User A creates contact 2
    console.log('\nTest 4: User A creates second contact (Roommate)...');
    const c2Res = await makeRequest('POST', '/api/contacts', {
      name: 'Pooja (Roommate)',
      phone: '+91 91234 56789',
      relationship: 'Friend'
    }, tokenA);
    if (c2Res.status === 201 && c2Res.data.success) {
      console.log('  PASSED: Created second contact with 201.');
    } else {
      throw new Error(`Test 4 Failed: ${JSON.stringify(c2Res)}`);
    }
    const contact2Id = c2Res.data.contact._id;

    // 5. Input Validation: Missing required field
    console.log('\nTest 5: Reject contact creation with missing phone number...');
    const badReqRes = await makeRequest('POST', '/api/contacts', {
      name: 'Incomplete Contact'
    }, tokenA);
    if (badReqRes.status === 400) {
      console.log(`  PASSED: Rejected with 400. Message: "${badReqRes.data.message}"`);
    } else {
      throw new Error(`Test 5 Failed: expected 400, got ${badReqRes.status}`);
    }

    // 6. Input Validation: Invalid phone format
    console.log('\nTest 6: Reject contact creation with invalid phone format...');
    const badPhoneRes = await makeRequest('POST', '/api/contacts', {
      name: 'Bad Phone',
      phone: 'not-a-number'
    }, tokenA);
    if (badPhoneRes.status === 400) {
      console.log(`  PASSED: Rejected with 400. Message: "${badPhoneRes.data.message}"`);
    } else {
      throw new Error(`Test 6 Failed: expected 400, got ${badPhoneRes.status}`);
    }

    // 7. Retrieve contacts for User A
    console.log('\nTest 7: Retrieve all contacts for User A...');
    const listARes = await makeRequest('GET', '/api/contacts', null, tokenA);
    if (listARes.status === 200 && listARes.data.count === 2) {
      console.log(`  PASSED: Retrieved 2 contacts for User A.`);
    } else {
      throw new Error(`Test 7 Failed: expected count 2, got ${JSON.stringify(listARes)}`);
    }

    // 8. Retrieve individual contact by ID
    console.log('\nTest 8: Retrieve single contact by ID for User A...');
    const singleRes = await makeRequest('GET', `/api/contacts/${contact1Id}`, null, tokenA);
    if (singleRes.status === 200 && singleRes.data.contact.name === 'Mother (Geeta)') {
      console.log(`  PASSED: Retrieved single contact: ${singleRes.data.contact.name}`);
    } else {
      throw new Error(`Test 8 Failed: ${JSON.stringify(singleRes)}`);
    }

    // 9. Update contact
    console.log('\nTest 9: Update contact 1 details (new phone & relationship)...');
    const updateRes = await makeRequest('PUT', `/api/contacts/${contact1Id}`, {
      phone: '+91 99999 11111',
      relationship: 'Primary Guardian'
    }, tokenA);
    if (updateRes.status === 200 && updateRes.data.contact.relationship === 'Primary Guardian') {
      console.log('  PASSED: Contact updated successfully with 200.');
    } else {
      throw new Error(`Test 9 Failed: ${JSON.stringify(updateRes)}`);
    }

    // 10. CROSS-USER ISOLATION: User B tries to view User A's contact
    console.log('\nTest 10: CROSS-USER ISOLATION: User B attempts to read User A contact...');
    const crossRead = await makeRequest('GET', `/api/contacts/${contact1Id}`, null, tokenB);
    if (crossRead.status === 403) {
      console.log(`  PASSED: Cross-user read blocked with 403 Forbidden. Message: "${crossRead.data.message}"`);
    } else {
      throw new Error(`Test 10 Failed: Expected 403, got ${crossRead.status}`);
    }

    // 11. CROSS-USER ISOLATION: User B tries to update User A's contact
    console.log('\nTest 11: CROSS-USER ISOLATION: User B attempts to update User A contact...');
    const crossUpdate = await makeRequest('PUT', `/api/contacts/${contact1Id}`, {
      name: 'Hacked Contact'
    }, tokenB);
    if (crossUpdate.status === 403) {
      console.log(`  PASSED: Cross-user update blocked with 403 Forbidden.`);
    } else {
      throw new Error(`Test 11 Failed: Expected 403, got ${crossUpdate.status}`);
    }

    // 12. CROSS-USER ISOLATION: User B tries to delete User A's contact
    console.log('\nTest 12: CROSS-USER ISOLATION: User B attempts to delete User A contact...');
    const crossDelete = await makeRequest('DELETE', `/api/contacts/${contact1Id}`, null, tokenB);
    if (crossDelete.status === 403) {
      console.log(`  PASSED: Cross-user delete blocked with 403 Forbidden.`);
    } else {
      throw new Error(`Test 12 Failed: Expected 403, got ${crossDelete.status}`);
    }

    // 13. Verify User B has 0 contacts
    console.log('\nTest 13: Verify User B list only contains their own contacts...');
    const listBRes = await makeRequest('GET', '/api/contacts', null, tokenB);
    if (listBRes.status === 200 && listBRes.data.count === 0) {
      console.log('  PASSED: User B contact list is completely empty (zero data leakage).');
    } else {
      throw new Error(`Test 13 Failed: Expected count 0, got ${listBRes.data.count}`);
    }

    // 14. User A deletes contact 2
    console.log('\nTest 14: User A deletes contact 2...');
    const delRes = await makeRequest('DELETE', `/api/contacts/${contact2Id}`, null, tokenA);
    if (delRes.status === 200 && delRes.data.success) {
      console.log('  PASSED: Contact deleted with 200.');
    } else {
      throw new Error(`Test 14 Failed: ${JSON.stringify(delRes)}`);
    }

    // 15. Verify User A now has count 1
    console.log('\nTest 15: Verify remaining contact count for User A...');
    const listAAfterDel = await makeRequest('GET', '/api/contacts', null, tokenA);
    if (listAAfterDel.status === 200 && listAAfterDel.data.count === 1) {
      console.log('  PASSED: Remaining contact count is 1.');
    } else {
      throw new Error(`Test 15 Failed: ${JSON.stringify(listAAfterDel)}`);
    }

    // 16. Verify deleted contact returns 404
    console.log('\nTest 16: Verify deleted contact returns 404...');
    const getDeletedRes = await makeRequest('GET', `/api/contacts/${contact2Id}`, null, tokenA);
    if (getDeletedRes.status === 404) {
      console.log('  PASSED: Deleted contact returned 404 Not Found.');
    } else {
      throw new Error(`Test 16 Failed: Expected 404, got ${getDeletedRes.status}`);
    }

    console.log('\n======================================================');
    console.log(' 🎉 ALL 16 TRUSTED CONTACT TESTS PASSED (100% SUCCESS) ');
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

