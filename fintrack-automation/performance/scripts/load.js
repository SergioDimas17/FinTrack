import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Load test: normal expected traffic on the FinTrack API.
// Ramps 10 -> 20 VUs over 3 minutes. Exercises the full flow:
// auth login -> GET accounts -> POST transfer.

const BASE_URL = __ENV.BASE_URL || 'https://wlsxfjlaxxwgnbhmtgmw.supabase.co';
const ANON_KEY = __ENV.K6_ANON_KEY || '';
const TEST_EMAIL = __ENV.K6_TEST_EMAIL || 'pruebasQA@gmail.com';
const TEST_PASSWORD = __ENV.K6_TEST_PASSWORD || '';

const loginFailureRate = new Rate('login_failures');

export const options = {
  stages: [
    { duration: '1m', target: 10 },   // ramp up to 10 VUs
    { duration: '1m', target: 20 },   // ramp up to 20 VUs
    { duration: '1m', target: 0 },    // ramp down to 0
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],        // <5% request failures under normal load
    http_req_duration: ['p(95)<3000'],    // 95% of requests under 3s
    login_failures: ['rate<0.05'],
    checks: ['rate>0.95'],
  },
};

function login() {
  const params = {
    headers: {
      'apikey': ANON_KEY,
      'Content-Type': 'application/json',
    },
  };

  const payload = JSON.stringify({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  const res = http.post(
    `${BASE_URL}/auth/v1/token?grant_type=password`,
    payload,
    params
  );

  const ok = check(res, {
    'login status is 200': (r) => r.status === 200,
    'login has access_token': (r) => {
      try {
        return JSON.parse(r.body).access_token !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  loginFailureRate.add(!ok);

  if (!ok) {
    console.error(`Login failed: ${res.status} ${res.body}`);
    return null;
  }

  return JSON.parse(res.body).access_token;
}

export default function () {
  // 1. Authenticate
  const token = login();
  if (!token) {
    return;
  }

  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'apikey': ANON_KEY,
    'Content-Type': 'application/json',
  };

  // 2. GET accounts
  const accountsRes = http.get(
    `${BASE_URL}/functions/v1/banking-api/accounts`,
    { headers: authHeaders }
  );

  check(accountsRes, {
    'accounts status is 200': (r) => r.status === 200,
  });

  // 3. POST transfer (use a dummy payload; QA environment should accept/validate it)
  const transferPayload = JSON.stringify({
    source_account: 'test-source-001',
    destination_account: 'test-dest-001',
    amount: 1.00,
    currency: 'USD',
  });

  const transferRes = http.post(
    `${BASE_URL}/functions/v1/transfer`,
    transferPayload,
    { headers: authHeaders }
  );

  // Transfer may return 200 or 4xx (validation) — we only assert it responds.
  check(transferRes, {
    'transfer responded (2xx or 4xx)': (r) => r.status >= 200 && r.status < 500,
  });

  sleep(1);
}
