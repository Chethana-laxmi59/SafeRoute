import http from 'http';

function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5000,
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

async function run() {
  console.log('--- RUNNING FULL SYSTEM TRUSTED CONTACTS VERIFICATION ---');

  // 1. Health check
  const health = await request('GET', '/api/health');
  if (health.status !== 200) throw new Error('Server not reachable');
  console.log('1. Server Online:', health.data.platform);

  // 2. Register User A & User B
  const timestamp = Date.now();
  const userARes = await request('POST', '/api/auth/register', {
    name: 'Kavya Nair',
    email: `kavya.${timestamp}@saferoute.org`,
    password: 'SafePassword123!',
  });
  const tokenA = userARes.data.token;

  const userBRes = await request('POST', '/api/auth/register', {
    name: 'Deepa Roy',
    email: `deepa.${timestamp}@saferoute.org`,
    password: 'SafePassword123!',
  });
  const tokenB = userBRes.data.token;
  console.log('2. Created 2 independent test users with distinct tokens.');

  // 3. User A creates contact 1
  console.log('3. User A creates primary guardian (Papa)...');
  const c1 = await request('POST', '/api/contacts', {
    name: 'Papa (Ramesh Nair)',
    phone: '+91 98765 00001',
    relationship: 'Father'
  }, tokenA);
  console.log('   Status:', c1.status, '| Contact ID:', c1.data.contact?._id);
  if (c1.status !== 201 || !c1.data.contact?._id) throw new Error('Create contact 1 failed');
  const contact1Id = c1.data.contact._id;

  // 4. User A creates contact 2
  console.log('4. User A creates secondary guardian (Sister)...');
  const c2 = await request('POST', '/api/contacts', {
    name: 'Anjali (Sister)',
    phone: '+91 98765 00002',
    relationship: 'Sister'
  }, tokenA);
  console.log('   Status:', c2.status, '| Contact ID:', c2.data.contact?._id);
  if (c2.status !== 201) throw new Error('Create contact 2 failed');
  const contact2Id = c2.data.contact._id;

  // 5. User A retrieves contact list
  console.log('5. User A retrieves contact circle...');
  const listA = await request('GET', '/api/contacts', null, tokenA);
  console.log('   Status:', listA.status, '| Count:', listA.data.count);
  if (listA.status !== 200 || listA.data.count !== 2) throw new Error('List count mismatch');

  // 6. User A retrieves single contact
  console.log('6. User A retrieves single contact by ID...');
  const single = await request('GET', `/api/contacts/${contact1Id}`, null, tokenA);
  console.log('   Status:', single.status, '| Name:', single.data.contact?.name);
  if (single.status !== 200 || single.data.contact?.name !== 'Papa (Ramesh Nair)') {
    throw new Error('Get single contact failed');
  }

  // 7. User A updates contact 1
  console.log('7. User A updates contact 1...');
  const update = await request('PUT', `/api/contacts/${contact1Id}`, {
    phone: '+91 98765 99999',
    relationship: 'Primary Guardian'
  }, tokenA);
  console.log('   Status:', update.status, '| Updated phone:', update.data.contact?.phone);
  if (update.status !== 200 || update.data.contact?.phone !== '+91 98765 99999') {
    throw new Error('Update contact failed');
  }

  // 8. Cross-User Isolation: User B tries to read User A's contact
  console.log('8. CROSS-USER ISOLATION: User B attempts to read User A contact...');
  const crossRead = await request('GET', `/api/contacts/${contact1Id}`, null, tokenB);
  console.log('   Status:', crossRead.status, '| Message:', crossRead.data.message);
  if (crossRead.status !== 403) throw new Error('Cross-user read was not blocked with 403');

  // 9. Cross-User Isolation: User B tries to update User A's contact
  console.log('9. CROSS-USER ISOLATION: User B attempts to update User A contact...');
  const crossUpdate = await request('PUT', `/api/contacts/${contact1Id}`, {
    name: 'Tampered Name'
  }, tokenB);
  console.log('   Status:', crossUpdate.status, '| Message:', crossUpdate.data.message);
  if (crossUpdate.status !== 403) throw new Error('Cross-user update was not blocked with 403');

  // 10. Cross-User Isolation: User B tries to delete User A's contact
  console.log('10. CROSS-USER ISOLATION: User B attempts to delete User A contact...');
  const crossDelete = await request('DELETE', `/api/contacts/${contact1Id}`, null, tokenB);
  console.log('    Status:', crossDelete.status, '| Message:', crossDelete.data.message);
  if (crossDelete.status !== 403) throw new Error('Cross-user delete was not blocked with 403');

  // 11. Verify User B has zero contacts
  console.log('11. Verifying User B has 0 contacts...');
  const listB = await request('GET', '/api/contacts', null, tokenB);
  console.log('    Status:', listB.status, '| Count:', listB.data.count);
  if (listB.status !== 200 || listB.data.count !== 0) throw new Error('Cross-user data leakage detected');

  // 12. User A deletes contact 2
  console.log('12. User A deletes contact 2...');
  const del = await request('DELETE', `/api/contacts/${contact2Id}`, null, tokenA);
  console.log('    Status:', del.status, '| Success:', del.data.success);
  if (del.status !== 200) throw new Error('Delete contact failed');

  // 13. Verify count is now 1
  console.log('13. Verifying remaining contacts count for User A...');
  const listAfter = await request('GET', '/api/contacts', null, tokenA);
  console.log('    Status:', listAfter.status, '| Count:', listAfter.data.count);
  if (listAfter.status !== 200 || listAfter.data.count !== 1) throw new Error('Remaining count mismatch');

  console.log('\n=============================================================');
  console.log(' 🎉 ALL END-TO-END TRUSTED CONTACTS INTEGRATION TESTS PASSED ');
  console.log('=============================================================\n');
}

run().catch((e) => {
  console.error('Integration test failed:', e);
  process.exit(1);
});

