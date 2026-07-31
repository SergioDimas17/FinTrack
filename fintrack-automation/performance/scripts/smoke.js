import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Smoke test: minimal load to verify the FinTrack API is up and healthy.
// 1-2 VUs for 1 minute. Used as a quick sanity check before deeper tests.

const BASE_URL = __ENV.BASE_URL || 'https://wlsxfjlaxxwgnbhmtgmw.supabase.co';
const ANON_KEY = __ENV.K6_ANON_KEY || '';
const TEST_EMAIL = __ENV.K6_TEST_EMAIL || 'pruebasQA@gmail.com';
const TEST_PASSWORD = __ENV.K6_TEST_PASSWORD || '';

// Custom metric: track login failures so they show up in the summary.
const loginFailureRate = new Rate('login_failures');

export const options = {
  vus: 2,
  duration: '1m',
  thresholds: {
    // Smoke test must pass cleanly: no failed checks, fast responses.
    http_req_failed: ['rate<0.01'],          // <1% of requests may fail
    http_req_duration: ['p(95)<2000'],      // 95% of requests under 2s
    login_failures: ['rate<0.05'],          // <5% login failures
    checks: ['rate>0.95'],                  // >95% of checks must pass
  },
};

// Login helper: returns the access token from the Supabase auth response.
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

  // 2. Hit the accounts edge function with the token
  const accountsRes = http.get(
    `${BASE_URL}/functions/v1/banking-api/accounts`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': ANON_KEY,
      },
    }
  );

  check(accountsRes, {
    'accounts status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
