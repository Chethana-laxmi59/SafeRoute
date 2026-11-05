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
  console.log('--- RUNNING FULL SYSTEM SAFETY RESOURCES INTEGRATION VERIFICATION ---');

  // 1. Health check
  const health = await request('GET', '/api/health');
  if (health.status !== 200) throw new Error('Server not reachable');
  console.log('1. Server Online:', health.data.platform);

  // 2. Register user & get JWT
  const userRes = await request('POST', '/api/auth/register', {
    name: 'Shreya Iyer',
    email: `shreya.${Date.now()}@saferoute.org`,
    password: 'SafePassword123!',
  });
  const token = userRes.data.token;
  console.log('2. Test user registered and authenticated.');

  // 3. Retrieve all safety resources
  console.log('3. Fetching all safety resources...');
  const all = await request('GET', '/api/resources', null, token);
  console.log('   Status:', all.status, '| Total Resources Found:', all.data.count);
  if (all.status !== 200 || all.data.count < 12) throw new Error('Failed to retrieve seeded resources');

  // Verify demo flags
  const sample = all.data.resources[0];
  if (!sample.isDemo || sample.source !== 'Academic Demonstration Dataset') {
    throw new Error('Safety check failed: demo source metadata missing');
  }
  console.log('   ✓ Verified demo source indicator on resource:', sample.name);

  // 4. Test Category Filter: police
  console.log('4. Testing Category Filter: police...');
  const police = await request('GET', '/api/resources?category=police', null, token);
  if (police.status !== 200 || !police.data.resources.every((r) => r.category === 'police')) {
    throw new Error('Police category filter failed');
  }
  console.log('   ✓ Retrieved', police.data.count, 'police outposts.');

  // 5. Test Category Filter: hospital
  console.log('5. Testing Category Filter: hospital...');
  const hospitals = await request('GET', '/api/resources?category=hospital', null, token);
  if (hospitals.status !== 200 || !hospitals.data.resources.every((r) => r.category === 'hospital')) {
    throw new Error('Hospital category filter failed');
  }
  console.log('   ✓ Retrieved', hospitals.data.count, 'emergency hospitals.');

  // 6. Test Category Filter: safe_haven
  console.log('6. Testing Category Filter: safe_haven...');
  const havens = await request('GET', '/api/resources?category=safe_haven', null, token);
  if (havens.status !== 200 || !havens.data.resources.every((r) => r.category === 'safe_haven')) {
    throw new Error('Safe haven category filter failed');
  }
  console.log('   ✓ Retrieved', havens.data.count, 'community safe havens.');

  // 7. Test Distance Calculation & Sorting
  console.log('7. Testing Proximity Distance Calculation (lat: 12.9716, lng: 77.5946)...');
  const proximity = await request('GET', '/api/resources?lat=12.9716&lng=77.5946', null, token);
  if (proximity.status !== 200 || proximity.data.resources[0].distanceKm === undefined) {
    throw new Error('Distance calculation failed');
  }
  const closest = proximity.data.resources[0];
  console.log('   ✓ Closest Resource:', closest.name, `(${closest.distanceKm} km away)`);
  console.log('   ✓ Verified proximity sorting order.');

  // 8. Test Radius Filter
  console.log('8. Testing Proximity Radius Filter (radius=2 km)...');
  const radius = await request('GET', '/api/resources?lat=12.9716&lng=77.5946&radius=2', null, token);
  if (radius.status !== 200 || !radius.data.resources.every((r) => r.distanceKm <= 2)) {
    throw new Error('Radius filter failed');
  }
  console.log('   ✓ Found', radius.data.count, 'resources strictly within 2 km radius.');

  // 9. Test Single Resource Retrieval
  console.log('9. Testing GET /api/resources/:id...');
  const single = await request('GET', `/api/resources/${sample._id}`, null, token);
  if (single.status !== 200 || single.data.resource.name !== sample.name) {
    throw new Error('Single resource fetch failed');
  }
  console.log('   ✓ Retrieved resource:', single.data.resource.name);

  // 10. Test Invalid Category Error
  console.log('10. Testing Invalid Category rejection...');
  const badCat = await request('GET', '/api/resources?category=invalid_zone', null, token);
  if (badCat.status !== 400) throw new Error('Invalid category was not rejected with 400');
  console.log('    ✓ Rejected invalid category with 400 Bad Request.');

  console.log('\n=============================================================');
  console.log(' 🎉 ALL END-TO-END SAFETY RESOURCES INTEGRATION TESTS PASSED ');
  console.log('=============================================================\n');
}

run().catch((e) => {
  console.error('Integration test failed:', e);
  process.exit(1);
});

