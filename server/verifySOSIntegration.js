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
  console.log('--- RUNNING FULL SYSTEM EMERGENCY SOS INTEGRATION VERIFICATION ---');

  // 1. Health Check
  const health = await request('GET', '/api/health');
  if (health.status !== 200) throw new Error('Server not reachable');
  console.log('1. Server Online:', health.data.platform);

  // 2. Register User A & User B
  const timestamp = Date.now();
  const userARes = await request('POST', '/api/auth/register', {
    name: 'Divya Patel',
    email: `divya.${timestamp}@saferoute.org`,
    password: 'SafePassword123!',
  });
  const tokenA = userARes.data.token;

  const userBRes = await request('POST', '/api/auth/register', {
    name: 'Tara Sharma',
    email: `tara.${timestamp}@saferoute.org`,
    password: 'SafePassword123!',
  });
  const tokenB = userBRes.data.token;
  console.log('2. Registered two independent test users with isolated accounts.');

  // 3. User A adds guardian contact
  const contactRes = await request('POST', '/api/contacts', {
    name: 'Anil Patel (Father)',
    phone: '+91 98765 22222',
    relationship: 'Father',
  }, tokenA);
  if (contactRes.status !== 201) throw new Error('Contact creation failed');
  console.log('3. User A created emergency guardian contact.');

  // 4. User A triggers SOS
  console.log('4. User A triggers Emergency SOS broadcast in Demo Mode...');
  const sosTrigger = await request('POST', '/api/sos', {
    latitude: 12.9716,
    longitude: 77.5946,
    accuracy: 9.8,
    message: 'Distress alert from college campus',
  }, tokenA);

  console.log('   Status:', sosTrigger.status, '| Success:', sosTrigger.data.success);
  if (sosTrigger.status !== 201 || !sosTrigger.data.event?._id) {
    throw new Error('SOS trigger failed');
  }

  const event1 = sosTrigger.data.event;
  const event1Id = event1._id;
  console.log('   ✓ Incident ID:', event1Id);
  console.log('   ✓ Status:', event1.status);
  console.log('   ✓ Alert Mode:', event1.alertMode);
  console.log('   ✓ Delivery Status:', event1.deliveryStatus);
  console.log('   ✓ Delivered Flag (Strict Safety):', event1.deliveryDetails[0]?.delivered === false);

  if (event1.deliveryDetails[0]?.delivered !== false) {
    throw new Error('Safety violation: Demo alert falsely claimed external delivery!');
  }

  // 5. Query active event
  console.log('5. Querying active emergency event...');
  const activeRes = await request('GET', '/api/sos/active', null, tokenA);
  if (activeRes.status !== 200 || activeRes.data.event?._id !== event1Id) {
    throw new Error('Failed to retrieve active SOS event');
  }
  console.log('   ✓ Active event correctly identified.');

  // 6. Query SOS history
  console.log('6. Querying User A SOS history...');
  const histA = await request('GET', '/api/sos/history', null, tokenA);
  if (histA.status !== 200 || histA.data.count < 1) throw new Error('History count mismatch');
  console.log('   ✓ Retrieved', histA.data.count, 'incident(s) for User A.');

  // 7. CROSS-USER ISOLATION: User B tries to read User A's SOS event
  console.log('7. CROSS-USER ISOLATION: User B attempts to read User A event...');
  const crossRead = await request('GET', `/api/sos/${event1Id}`, null, tokenB);
  console.log('   Status:', crossRead.status, '| Message:', crossRead.data.message);
  if (crossRead.status !== 403) throw new Error('Cross-user read was not blocked with 403');

  // 8. CROSS-USER ISOLATION: User B tries to resolve User A's SOS event
  console.log('8. CROSS-USER ISOLATION: User B attempts to resolve User A event...');
  const crossResolve = await request('PATCH', `/api/sos/${event1Id}/resolve`, {}, tokenB);
  console.log('   Status:', crossResolve.status, '| Message:', crossResolve.data.message);
  if (crossResolve.status !== 403) throw new Error('Cross-user resolve was not blocked with 403');

  // 9. CROSS-USER ISOLATION: User B tries to cancel User A's SOS event
  console.log('9. CROSS-USER ISOLATION: User B attempts to cancel User A event...');
  const crossCancel = await request('PATCH', `/api/sos/${event1Id}/cancel`, {}, tokenB);
  console.log('   Status:', crossCancel.status, '| Message:', crossCancel.data.message);
  if (crossCancel.status !== 403) throw new Error('Cross-user cancel was not blocked with 403');

  // 10. Verify User B has zero events
  console.log('10. Verifying User B has 0 emergency events...');
  const histB = await request('GET', '/api/sos/history', null, tokenB);
  if (histB.status !== 200 || histB.data.count !== 0) throw new Error('Cross-user data leakage detected');
  console.log('    ✓ User B history is completely empty (zero data leakage).');

  // 11. User A resolves event 1
  console.log('11. User A marks event 1 as RESOLVED...');
  const resolveRes = await request('PATCH', `/api/sos/${event1Id}/resolve`, {}, tokenA);
  console.log('    Status:', resolveRes.status, '| New Status:', resolveRes.data.event?.status);
  if (resolveRes.status !== 200 || resolveRes.data.event?.status !== 'resolved') {
    throw new Error('Resolve failed');
  }

  // 12. Active event should now be null
  const afterResolveActive = await request('GET', '/api/sos/active', null, tokenA);
  if (afterResolveActive.data.event !== null) throw new Error('Active event was not cleared after resolution');
  console.log('    ✓ Active event cleared after resolution.');

  // 13. Trigger second event and cancel it
  console.log('13. Triggering second event to verify cancellation flow...');
  const sos2 = await request('POST', '/api/sos', { message: 'False alarm test' }, tokenA);
  const cancelRes = await request('PATCH', `/api/sos/${sos2.data.event._id}/cancel`, {}, tokenA);
  console.log('    Status:', cancelRes.status, '| Cancelled Status:', cancelRes.data.event?.status);
  if (cancelRes.status !== 200 || cancelRes.data.event?.status !== 'cancelled') {
    throw new Error('Cancel failed');
  }

  console.log('\n=============================================================');
  console.log(' 🎉 ALL END-TO-END EMERGENCY SOS INTEGRATION TESTS PASSED ');
  console.log('=============================================================\n');
}

run().catch((e) => {
  console.error('Integration test failed:', e);
  process.exit(1);
});

