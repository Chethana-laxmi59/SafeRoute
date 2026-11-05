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
  console.log('--- RUNNING FULL SYSTEM AUTHENTICATION VERIFICATION ---');
  
  // 1. Check Server Health
  const health = await request('GET', '/api/health');
  console.log('1. Health check status:', health.status, health.data.status);
  if (health.status !== 200) throw new Error('Server not reachable');

  // 2. Register User
  const timestamp = Date.now();
  const testUser = {
    name: 'Priya Verma',
    email: `priya.${timestamp}@saferoute.org`,
    password: 'SafePass#2026',
    phone: '+91 91234 56789'
  };

  console.log('2. Testing User Registration:', testUser.email);
  const reg = await request('POST', '/api/auth/register', testUser);
  console.log('   Response Code:', reg.status, '| Success:', reg.data.success);
  if (reg.status !== 201 || !reg.data.token || reg.data.user.password) {
    throw new Error('Registration failed or exposed password hash: ' + JSON.stringify(reg.data));
  }
  const token = reg.data.token;
  console.log('   ✓ User registered with ID:', reg.data.user._id);

  // 3. Test Duplicate Registration
  console.log('3. Testing Duplicate Registration with same email...');
  const dup = await request('POST', '/api/auth/register', testUser);
  console.log('   Response Code:', dup.status, '| Error message:', dup.data.message);
  if (dup.status !== 400) throw new Error('Duplicate email was not rejected');
  console.log('   ✓ Duplicate email properly rejected with 400');

  // 4. Test Login with Valid Credentials
  console.log('4. Testing Login with valid credentials...');
  const loginValid = await request('POST', '/api/auth/login', {
    email: testUser.email,
    password: testUser.password
  });
  console.log('   Response Code:', loginValid.status, '| Success:', loginValid.data.success);
  if (loginValid.status !== 200 || !loginValid.data.token) {
    throw new Error('Login failed: ' + JSON.stringify(loginValid.data));
  }
  console.log('   ✓ Login successful, JWT received');

  // 5. Test Login with Invalid Password
  console.log('5. Testing Login with wrong password...');
  const loginBad = await request('POST', '/api/auth/login', {
    email: testUser.email,
    password: 'WrongPassword'
  });
  console.log('   Response Code:', loginBad.status, '| Error message:', loginBad.data.message);
  if (loginBad.status !== 401) throw new Error('Wrong password was not rejected with 401');
  console.log('   ✓ Wrong password rejected with generic 401');

  // 6. Test Protected Route GET /api/auth/me with Bearer token
  console.log('6. Testing Protected Route GET /api/auth/me with Bearer token...');
  const me = await request('GET', '/api/auth/me', null, token);
  console.log('   Response Code:', me.status, '| User:', me.data.user?.name);
  if (me.status !== 200 || me.data.user?.email !== testUser.email.toLowerCase()) {
    throw new Error('Protected endpoint failed: ' + JSON.stringify(me.data));
  }
  console.log('   ✓ Protected route verified successfully');

  // 7. Test Protected Route without token
  console.log('7. Testing Protected Route GET /api/auth/me without token...');
  const noToken = await request('GET', '/api/auth/me');
  console.log('   Response Code:', noToken.status, '| Error message:', noToken.data.message);
  if (noToken.status !== 401) throw new Error('Missing token was not rejected with 401');
  console.log('   ✓ Missing token rejected with 401');

  console.log('\n======================================================');
  console.log('🎉 ALL END-TO-END AUTHENTICATION CHECKS PASSED (100%)');
  console.log('======================================================\n');
}

run().catch((e) => {
  console.error('Test execution failed:', e);
  process.exit(1);
});

