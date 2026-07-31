import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Stress test: push the FinTrack API beyond normal load to find its breaking point.
// Ramps 0 -> 50 -> 100 VUs over 5 minutes. Watch for rising error rates and latency.

const BASE_URL = __ENV.BASE_URL || 'https://wlsxfjlaxxwgnbhmtgmw.supabase.co';
const ANON_KEY = __ENV.K6_ANON_KEY || '';
const TEST_EMAIL = __ENV.K6_TEST_EMAIL || 'pruebasQA@gmail.com';
const TEST_PASSWORD = __ENV.K6_TEST_PASSWORD || '';

const loginFailureRate = new Rate('login_failures');

export const options = {
  stages: [
    { duration: '2m', target: 50 },   // ramp up to 50 VUs
    { duration: '2m', target: 100 },  // push to 100 VUs (breaking point search)
    { duration: '1m', target: 0 },    // ramp down
  ],
  thresholds: {
    // Under stress we tolerate more failures, but still want visibility.
    http_req_failed: ['rate<0.20'],        // <20% request failures
    http_req_duration: ['p(95)<5000'],   // 95% of requests under 5s
    login_failures: ['rate<0.20'],
    checks: ['rate>0.80'],
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

  // 3. POST transfer
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

  check(transferRes, {
    'transfer responded (2xx or 4xx)': (r) => r.status >= 200 && r.status < 500,
  });

  sleep(0.5);  // shorter sleep under stress to sustain load
}
