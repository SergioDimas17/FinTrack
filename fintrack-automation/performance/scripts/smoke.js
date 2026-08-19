import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Smoke test: carga mínima para verificar la disponibilidad de la API FinTrack
const BASE_URL = __ENV.BASE_URL || 'https://wlsxfjlaxxwgnbhmtgmw.supabase.co';
const ANON_KEY = __ENV.K6_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indsc3hmamxheHh3Z25iaG10Z213Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2OTk3NTEsImV4cCI6MjA5ODI3NTc1MX0.O6fe3bylzRtNmPYL1zXYo1mIhMBrG9vxvQgYP_Hw9DI';
const TEST_EMAIL = __ENV.K6_TEST_EMAIL || 'pruebasQA@gmail.com';
const TEST_PASSWORD = __ENV.K6_TEST_PASSWORD || 'pruebas123'; // Contraseña corregida

// Métrica personalizada para monitorear errores de login
const loginFailureRate = new Rate('login_failures');

export const options = {
  vus: 2,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],   // Menos del 1% de peticiones fallidas
    http_req_duration: ['p(95)<2000'], // 95% de peticiones por debajo de 2s
    login_failures: ['rate<0.05'],    // Menos del 5% de errores en login
    checks: ['rate>0.95'],            // Más del 95% de aserciones exitosas
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
    'login status es 200': (r) => r.status === 200,
    'login contiene access_token': (r) => {
      try {
        return JSON.parse(r.body).access_token !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  loginFailureRate.add(!ok);

  if (!ok) {
    console.error(`Error en Login: ${res.status} ${res.body}`);
    return null;
  }

  return JSON.parse(res.body).access_token;
}

export default function () {
  // 1. Obtener Token
  const token = login();
  if (!token) {
    sleep(2);
    return;
  }

  // 2. Probar endpoint de cuentas
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
    'accounts status es 200': (r) => r.status === 200,
  });

  sleep(2);
}