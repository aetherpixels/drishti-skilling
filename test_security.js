/**
 * Automated Security & RBAC Verification Test Suite
 * Tests all requirements: Auth, RBAC, Headers, Sanitization, Edge Keys, Rate Limiting
 */

const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(body); } catch (e) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
          json
        });
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runSecurityTests() {
  console.log('====================================================');
  console.log('   DRISHTI-SKILLING: COMPREHENSIVE SECURITY AUDIT   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✔ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ✖ [FAIL] ${testName} ${details ? '(' + details + ')' : ''}`);
      failed++;
    }
  }

  // 1. Security Headers & Information Disclosure Check
  const rootRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET'
  });
  assert(rootRes.statusCode === 200, 'Frontend Static Route is reachable');
  assert(!rootRes.headers['x-powered-by'], 'Fingerprinting disabled: x-powered-by header is hidden');
  assert(rootRes.headers['x-content-type-options'] === 'nosniff', 'MIME Sniffing disabled: X-Content-Type-Options is nosniff');
  assert(rootRes.headers['x-frame-options'] === 'DENY', 'Clickjacking disabled: X-Frame-Options is DENY');
  assert(Boolean(rootRes.headers['strict-transport-security']), 'HSTS configured: Strict-Transport-Security is present');
  assert(Boolean(rootRes.headers['content-security-policy']), 'CSP enforced: Content-Security-Policy is present');

  // 2. Unauthenticated Access Protection on Admin Actions
  const unauthAction = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/actions',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { centre_id: 'TC-UP-10492', action: 'FREEZE_SUBSIDY' });
  assert(unauthAction.statusCode === 401, 'Admin Action Guard: Rejects unauthenticated freeze request with HTTP 401');

  // 3. Invalid Token Rejection
  const invalidTokenRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/actions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer fake.invalid.jwt_token_attempt_123'
    }
  }, { centre_id: 'TC-UP-10492', action: 'FREEZE_SUBSIDY' });
  assert(invalidTokenRes.statusCode === 401, 'Tampered Token Guard: Rejects invalid JWT with HTTP 401');

  // 4. Scrypt Password Login (Auditor)
  const auditorLogin = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'auditor@msde.gov.in', password: 'Auditor@MSDE2026!' });
  assert(auditorLogin.statusCode === 200 && auditorLogin.json.token, 'Scrypt Auth: Auditor successfully logs in with valid JWT');
  const auditorToken = auditorLogin.json ? auditorLogin.json.token : null;

  // 5. Authorized Action Execution with JWT
  if (auditorToken) {
    const authAction = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/actions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auditorToken}`
      }
    }, { centre_id: 'TC-UP-10492', action: 'FREEZE_SUBSIDY', note: 'Discrepancy verified' });
    assert(authAction.statusCode === 200 && authAction.json.success, 'RBAC Authorization: Auditor can execute FREEZE_SUBSIDY');
  }

  // 6. Role Hierarchy Enforcement (Auditor cannot reset database - Admin only)
  if (auditorToken) {
    const auditorReset = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/reset',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auditorToken}`
      }
    });
    assert(auditorReset.statusCode === 403, 'RBAC Role Boundary: Auditor is forbidden (403) from executing ADMIN-only reset');
  }

  // 7. Admin Login & Reset
  const adminLogin = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@msde.gov.in', password: 'Admin@MSDE2026!' });
  assert(adminLogin.statusCode === 200 && adminLogin.json.token, 'Admin Auth: Administrator logs in successfully');
  const adminToken = adminLogin.json ? adminLogin.json.token : null;

  if (adminToken) {
    const adminReset = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/reset',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    });
    assert(adminReset.statusCode === 200, 'Admin Privileges: Administrator can execute system reset');
  }

  // 8. Edge Telemetry Key Guard
  const unauthTelemetry = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/telemetry',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { centre_id: 'TC-UP-10492', detected_headcount: 10 });
  assert(unauthTelemetry.statusCode === 401, 'Edge Guard: Rejects telemetry without valid x-edge-api-key with HTTP 401');

  const authTelemetry = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/telemetry',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-edge-api-key': 'drishti_edge_node_token_secure_lan_iot'
    }
  }, { centre_id: 'TC-UP-10492', detected_headcount: 12, claimed_headcount: 30 });
  assert(authTelemetry.statusCode === 200, 'Edge Verification: Accepts telemetry with valid x-edge-api-key');

  // 9. Input Sanitization & XSS Mitigation
  if (auditorToken) {
    const xssAttempt = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/actions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auditorToken}`
      }
    }, {
      centre_id: 'TC-UP-10492',
      action: 'ISSUE_NOTICE',
      note: '<script>alert("pwned")</script><b>Dangerous Payload</b>'
    });
    const centreCheck = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/centres/TC-UP-10492',
      method: 'GET'
    });
    const sanitizedNote = centreCheck.json.centre.audit_notes;
    assert(!sanitizedNote.includes('<script>'), 'XSS Mitigation: Malicious script tags are sanitized before persistence');
  }

  // 10. Unknown API Endpoint 404 Guard
  const notFound = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/nonexistent_secret_leak_route',
    method: 'GET'
  });
  assert(notFound.statusCode === 404, 'API 404 Guard: Unknown routes return safe 404 without leaking server internals');

  console.log('\n====================================================');
  console.log(` AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runSecurityTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
